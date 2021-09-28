pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/Ownable.sol";

contract CryptoMailCore is Ownable {
    // messaging thread deposit
    struct Deposit {
        uint amount;
        address depositor;
        address recipient;
        uint block;
    }

    // messageId (thread_id || msg_id) => deposit
    mapping(bytes16 => Deposit) private _deposits;

    uint16 private _timeout = 3; // dev testing
    // uint16 private _timeout = 11136; // product settings - blocks in one month
    uint8 private _fee_percent = 5; // service tx fee

    function getDeposit(bytes16 messageId) public view returns(Deposit memory) {
        return _deposits[messageId];
    }

    function getTimeout() public view returns(uint16) {
        return _timeout;
    }

    function getFee() public view returns(uint8) {
        return _fee_percent;
    }

    // Owner updates config
    function updateConfig(uint8 fee, uint16 timeout) public onlyOwner {
        require(fee > 0 && fee < 100, "out of bounds");
        require(timeout > 0, "invalid timeout");
        _fee_percent = fee;
        _timeout = timeout;
    }

    // make a payment for a new message in a new thread
    function deposit(address recipient, bytes16 messageId) public payable returns(bool) {
        // prevent attack on existing threads by reusing their ids
        if (_deposits[messageId].block != 0) {
            emit InvalidMessageId(messageId);
            return false; // messageId collision - return w/o overwrite and don't throw (less gas)
        }

        _deposits[messageId] = Deposit(msg.value, msg.sender, recipient, block.number);
        emit DepositEvent(messageId, msg.sender, recipient, msg.value);
        return true;
    }

    // recipient withdraw funds for a thread
    function withdraw(bytes16 messageId) public payable {
        Deposit memory d = _deposits[messageId];
        require(msg.sender == d.recipient, "sender != recipient"); // note that after delete d.recipient should be 0x0
        delete _deposits[messageId];
        uint f = d.amount * _fee_percent / 100;
        payable(msg.sender).transfer(d.amount - f);
        payable(this.owner()).transfer(f);

        emit WithdrawEvent(messageId, msg.sender,d.amount -f, f);
    }

    // depositor gets a refund if recipient didn't withdraw for a long time
    function refund(bytes16 messageId) public payable {
        Deposit memory d = _deposits[messageId];
        require(msg.sender == d.depositor, "sender != depositor"); // note that after delete d.depositor should be 0x0
        require(block.number >= d.block + _timeout, "too early");
        delete _deposits[messageId];
        uint f = d.amount * _fee_percent / 100;
        payable(msg.sender).transfer(d.amount - f);
        payable(this.owner()).transfer(f);

        emit RefundEvent(messageId, msg.sender,d.amount -f, f);
    }

    // events for pre-production migration development only
    event InvalidMessageId(bytes16 messageId);
    event DepositEvent(bytes16 messageId, address depositor, address recipient, uint amount);
    event WithdrawEvent(bytes16 messageId, address receipient, uint amount, uint fee);
    event RefundEvent(bytes16 messageId, address depositor, uint amount, uint fee);
}
