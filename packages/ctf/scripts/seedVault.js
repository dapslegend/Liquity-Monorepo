const hre = require('hardhat');
const { ethers } = hre;

// Seeds the vault with ETH by setting its balance via JSON-RPC, to create a real prize pool.
async function setBalance(addr, ether) {
  const hexBal = ethers.utils.hexlify(ethers.utils.parseEther(ether));
  await ethers.provider.send('hardhat_setBalance', [addr, hexBal]);
}

async function main() {
  const vaultAddress = process.env.VAULT_ADDR;
  if (!vaultAddress) throw new Error('Set VAULT_ADDR to the deployed CTFVault address');

  const prizeEth = process.env.PRIZE_ETH || '500';
  await setBalance(vaultAddress, prizeEth);

  const bal = await ethers.provider.getBalance(vaultAddress);
  console.log('Seeded vault', vaultAddress, 'ETH balance =', ethers.utils.formatEther(bal));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
