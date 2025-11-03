require('dotenv').config();
const hre = require('hardhat');
const { ethers } = hre;

async function getEthBalance(address) {
  const bal = await ethers.provider.getBalance(address);
  return bal.toString();
}

async function getErc20Balance(token, address) {
  const erc20 = new ethers.Contract(
    token,
    ['function balanceOf(address) view returns (uint256)', 'function decimals() view returns (uint8)', 'function symbol() view returns (string)'],
    ethers.provider
  );
  const [bal, decimals, symbol] = await Promise.all([
    erc20.balanceOf(address),
    erc20.decimals().catch(() => 18),
    erc20.symbol().catch(() => 'TOKEN')
  ]);
  return { raw: bal.toString(), decimals, symbol };
}

async function main() {
  const { addresses } = require('../config/liquity.mainnet.addresses.json');
  const out = {};

  const tokenAddrs = {
    LUSD: addresses.lusdToken,
    LQTY: addresses.lqtyToken
  };

  const provider = ethers.provider;
  if (!provider) throw new Error('No provider. Run via Hardhat: npx hardhat run scripts/fetchBalances.js --network hardhat');

  const addrs = Object.entries(addresses);
  for (const [name, addr] of addrs) {
    const eth = await getEthBalance(addr);
    const tokens = {};
    for (const [sym, tAddr] of Object.entries(tokenAddrs)) {
      try {
        tokens[sym] = await getErc20Balance(tAddr, addr);
      } catch (e) {
        tokens[sym] = { error: e.message };
      }
    }
    out[name] = { address: addr, ETH: eth, tokens };
  }

  const fs = require('fs');
  const path = require('path');
  const outPath = path.join(__dirname, '..', 'config', 'balances.snapshot.json');
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log('Wrote balances snapshot to', outPath);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
