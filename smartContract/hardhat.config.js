require("@nomiclabs/hardhat-waffle");
require("dotenv").config();

module.exports = {
  solidity: {
    compilers: [
      {version: "0.8.0"},
      {version: "0.8.1"},
      {version: "0.8.4"}
    ]
  },
  paths: {
    artifacts: "./src/backend/artifacts",
    sources: "./contracts",
    cache: "./src/backend/cache",
    tests: "./test"
  },
  //defaultNetwork: "localhost",
  networks: {
    rinkeby: {
      url: process.env.RINKEBY_URL,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
