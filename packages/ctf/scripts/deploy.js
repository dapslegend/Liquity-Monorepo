const hre = require('hardhat');
const { ethers } = hre;

async function main() {
  const addresses = require('../config/liquity.mainnet.addresses.json').addresses;

  // Use mainnet LUSD address when forking, else a zero address placeholder
  const lusd = addresses.lusdToken;
  const tokenIface = new ethers.utils.Interface([
    'function balanceOf(address) view returns (uint256)'
  ]);

  const CTFVault = await ethers.getContractFactory('CTFVault');
  const vault = await CTFVault.deploy(lusd);
  await vault.deployed();

  console.log('CTFVault deployed at', vault.address);

  // Log initial balances if on fork
  try {
    const ethBal = await ethers.provider.getBalance(vault.address);
    console.log('Vault ETH balance', ethers.utils.formatEther(ethBal));
  } catch {}
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
