async function main() {

  const [deployer] = await ethers.getSigners();

  //NFT contract deploy
  const NFT = await ethers.getContractFactory("NFT");
  const nft = await NFT.deploy();
  await nft.deployed();

  // MarketPlace contract deploy
  // const MarketPlace = await ethers.getContractFactory("MarketPlace");
  // const marketPlace = await MarketPlace.deploy(10);
  // await marketPlace.deployed();

  
  // console.log("Deployed marketplace contract is:", marketPlace.address);
  console.log("Deployed nft contract is:", nft.address);

  //console.log("Deploying contracts with the account:", deployer.address);
  //console.log("Account balance:", (await deployer.getBalance()).toString());

  // deploy contracts here:
  
  
  // For each contract, pass the deployed contract and name to this function to save a copy of the contract ABI and address to the front end.
  saveFrontendFiles(nft, "NFT");
  // saveFrontendFiles(marketPlace, "MarketPlace");
}

function saveFrontendFiles(contract, name) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../../frontend/contractsData";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + `/${name}-address.json`,
    JSON.stringify({ address: contract.address }, undefined, 2)
  );

  const contractArtifact = artifacts.readArtifactSync(name);

  fs.writeFileSync(
    contractsDir + `/${name}.json`,
    JSON.stringify(contractArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
