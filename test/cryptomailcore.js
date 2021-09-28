const CryptoMailCore = artifacts.require("CryptoMailCore");

/*
    Use truffle test --show-events to display all events

    Usage of accounts in tests
    Accounts[0] - deploys CryptoMailCore - owner (migration-time)
    Accounts[1] - creates paid thread
    Accounts[2] - paid thread receiver
 */

contract('CryptoMailCore', (accounts) => {

  it('contract config', async () => {
    const instance = await CryptoMailCore.deployed();
    console.log("Instance address: ", await instance.address);
    const fee = await instance.getFee();
    assert(fee > 0 && fee < 100, "fee must be 1 to 99 percent");
    const t = await instance.getTimeout();
    assert(t > 0, "timeout must be positive non-zero");

    // sign accounts[1] address...
    const sig = await web3.eth.sign(accounts[1], accounts[1]);
    console.log("Account 1 sig on account 1 string: " + sig);
  });

  it('user should be able to deposit', async () => {
    const instance = await CryptoMailCore.deployed();

    // 16 bytes: little_endain(1: u64) || little_endain(1: u64)
    // memory layout to test threadId=1 and messageId=1
    // 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01
    // 0x00000000000000010000000000000001
    console.log("Accounts[0]: " + accounts[0])
    console.log("Accounts[1]: " + accounts[1])
    console.log("Accounts[2]: " + accounts[2])

    const messageId = "0x00000000000000010000000000000001"; //web3.utils.toHex(Math.floor(Math.random() * 500000));
    const amount = 200000;
    let b0 = await web3.eth.getBalance(accounts[1]);
    const res = await instance.deposit(accounts[2], messageId, {from: accounts[1], value: amount});
    console.log("Transaction id: " + res.receipt.transactionHash);
    assert.equal(res.receipt.status, true, "unexpected receipt status");
    let b1 = await web3.eth.getBalance(accounts[1]);
    assert(b1 <= b0 - amount, "expected coin deposit to lower balance");
    const b = await web3.eth.getBalance(instance.address);
    assert.equal(b.valueOf(), amount, "unexpected contract balance");
    const data = await instance.getDeposit(messageId);
    console.log("deposits["+ messageId +"]=", data);



  });

  it('recipient should be able withdraw', async () => {
    const amount = 200000;
    const instance = await CryptoMailCore.deployed();
    const messageId = web3.utils.toHex(Math.floor(Math.random() * 50000000));
    const res = await instance.deposit(accounts[2], messageId, {from: accounts[1], value: amount});
    let fee = await instance.getFee();
    let b0 = web3.eth.getBalance(accounts[2]);
    const res1 = await instance.withdraw(messageId, {from: accounts[2]});
    let b1 = web3.eth.getBalance(accounts[0]);
    assert(b1 = b0 + fee, "expected balance to grow");
    // todo: test owner balance grew by fee

  });
});
