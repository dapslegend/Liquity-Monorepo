require('dotenv').config();
require('@nomiclabs/hardhat-ethers');

const { ANVIL_FORK_URL, ALCHEMY_API_KEY, FORK_BLOCK, DISABLE_FORKING } = process.env;
// Default to the provided free Ankr RPC if nothing is set
const DEFAULT_ANKR = 'https://rpc.ankr.com/eth/5d5002658e20aca493616af98cfdaa3deb70b5c40b21bc2da4bf05c0b86cef09';

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: '0.7.6',
    settings: {
      optimizer: { enabled: true, runs: 200 }
    }
  },
  networks: {
    anvil: {
      url: 'http://127.0.0.1:8545',
      chainId: 1
    },
    hardhat: {
      chainId: 1,
      // Allow opt-out of forking when explicitly requested (handy for local dry runs)
      ...(DISABLE_FORKING === 'true'
        ? {}
        : {
            forking: {
              url:
                ANVIL_FORK_URL ||
                (ALCHEMY_API_KEY
                  ? `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
                  : DEFAULT_ANKR),
              blockNumber: FORK_BLOCK ? parseInt(FORK_BLOCK) : 16233419
            }
          }),
      initialBaseFeePerGas: 0
    }
  }
};
