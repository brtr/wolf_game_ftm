const traits = require("../data.json");
const delay = ms => new Promise(res => setTimeout(res, ms));

async function main() {
  const NFT = await hre.ethers.getContractFactory("Traits");
  const { TRAITS_ADDRESS } = process.env;
  const contract = NFT.attach(TRAITS_ADDRESS);
  console.log(TRAITS_ADDRESS);
  for (const trait of traits) {
    const traitIds = [...Array(trait.data.length).keys()];
    await contract.uploadTraits(trait.id, traitIds, trait.data);
    await delay(10000);
  }  // add data to traits
}

main().then(() => process.exit(0)).catch(error => {
  console.error(error);
  process.exit(1);
});
