const traits = require("../data.json");
const { WOOL_ADDRESS, TRAITS_ADDRESS, WOOLF_ADDRESS, BARN_ADDRESS, WEED_ADDRESS, UNISWAP_ROUTER, CHEF_ADDRESS, MILK_ADDRESS, RANDOM_ADDRESS, LP_ADDRESS } = process.env;
const main = async () => {
  let contractFactory = await hre.ethers.getContractFactory('Traits');
  const traitContract = contractFactory.attach(TRAITS_ADDRESS);

  contractFactory = await hre.ethers.getContractFactory('WOOL');
  const woolContract = contractFactory.attach(WOOL_ADDRESS);

  contractFactory = await hre.ethers.getContractFactory('MILK');
  const milkContract = contractFactory.attach(MILK_ADDRESS);

  contractFactory = await hre.ethers.getContractFactory('WEED');
  const weedContract = contractFactory.attach(WEED_ADDRESS);

  contractFactory = await hre.ethers.getContractFactory('Woolf');
  const woolfContract = contractFactory.attach(WOOLF_ADDRESS);

  contractFactory = await hre.ethers.getContractFactory('MasterChef');
  const chefContract = contractFactory.attach(CHEF_ADDRESS);

  await traitContract.setWoolf(WOOLF_ADDRESS);
  console.log("set woolf for trait success");
  await woolContract.addController(BARN_ADDRESS);
  await woolContract.addController(WOOLF_ADDRESS);
  console.log("set controller for wool success");
  await woolContract.approve(UNISWAP_ROUTER, 9999999);
  console.log("set approve for wool success");
  await milkContract.addController(BARN_ADDRESS);
  await milkContract.addController(WOOLF_ADDRESS);
  console.log("set controller for milk success");
  await weedContract.addMinter(CHEF_ADDRESS);
  console.log("set minter for weed success");
  await weedContract.approve(CHEF_ADDRESS, 9999999);
  console.log("set approve for weed success");
  await woolfContract.setBarn(BARN_ADDRESS);
  await woolfContract.setRandomizer(RANDOM_ADDRESS);
  console.log("set barn for woolf success");
  await chefContract.add(100, LP_ADDRESS, 0, false)
  console.log("set lptoken for chef success");

  for (const trait of traits) {
    const traitIds = [...Array(trait.data.length).keys()];
    tx = await traitContract.uploadTraits(trait.id, traitIds, trait.data);
    tx.wait();
  }
  console.log("Uploaded Traits Data");
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();