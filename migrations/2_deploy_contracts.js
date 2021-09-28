const CrptoMailCore = artifacts.require("CryptoMailCore");

module.exports = async function(deployer) {
  await deployer.deploy(CrptoMailCore);
};
