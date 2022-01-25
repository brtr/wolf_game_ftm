const hre = require("hardhat");
const { WOOLF_ADDRESS, OWNER_ADDRESS } = process.env;

async function main() {
  const NFT = await hre.ethers.getContractFactory("Woolf");
  const contract = NFT.attach(WOOLF_ADDRESS);
  const price = "0.001"
  console.log(await contract.mint(1, true, 0, OWNER_ADDRESS, {value: ethers.utils.parseUnits(price, 'ether')}));
}
main().then(() => process.exit(0)).catch(error => {
  console.error(error);
  process.exit(1);
});