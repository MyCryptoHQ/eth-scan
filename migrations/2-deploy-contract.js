const BalanceScanner = artifacts.require('BalanceScanner');

/**
 * @param {Deployer} deployer
 */
module.exports = deployer => {
  deployer.deploy(BalanceScanner);
};
