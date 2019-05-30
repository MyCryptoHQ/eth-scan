const Migrations = artifacts.require('Migrations');

/**
 * @param {Deployer} deployer
 */
module.exports = deployer => {
  deployer.deploy(Migrations);
};
