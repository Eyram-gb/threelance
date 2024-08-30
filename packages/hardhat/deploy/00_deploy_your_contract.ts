import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys a contract named "ThreeLanceContract" using the deployer account and
 * constructor arguments set to the manufacturer's name.
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployThreeLanceContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("ThreeLance", {
    from: deployer,
    log: true,
    autoMine: true,
  });

  //const threelanceContract = await hre.ethers.getContract<Contract>("ThreeLance", deployer);
  // console.log("'ABC' Hash Test:", await threelanceContract.getHash("ABC"));
};

export default deployThreeLanceContract;

deployThreeLanceContract.tags = ["ThreeLance"];
