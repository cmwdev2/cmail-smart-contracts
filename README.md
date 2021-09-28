# sol-starter

A basic modern truffle-base brew solidity smart contracts dev project with open-zeppelin integration.

Will save you 2 hours of your life when you want to get started with smart contracts dev.

You are welcome.

## Setup 
1. Ensure you are running NodeJS v8.9.4 or later
1. Install Truffle Suite: `npm install -g truffle`
2. Install [Genanche](`https://www.trufflesuite.com/ganache`)
3. Install deps (open-zeppelin contracts): `yarn install`

## Compile
```bash 
cd smart-contracts
truffle compile
```

## Deploy
```bash 
cd smart-contracts
truffle migrate --reset
```

## Test
Make sure Genanche app is running.

```bash 
cd smart-contracts
truffle test
```
