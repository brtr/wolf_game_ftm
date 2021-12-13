const { OWNER_ADDRESS } = process.env;
const main = async () => {
  let contractFactory = await hre.ethers.getContractFactory('Traits');
  const traitContract = await contractFactory.deploy();
  await traitContract.deployed();
  console.log("Trait Contract deployed to:", traitContract.address);

  contractFactory = await hre.ethers.getContractFactory('WOOL');
  const woolContract = await contractFactory.deploy();
  await woolContract.deployed();
  console.log("Wool Contract deployed to:", woolContract.address);

  contractFactory = await hre.ethers.getContractFactory('WEED');
  const weedContract = await contractFactory.deploy();
  await weedContract.deployed();
  console.log("Weed Contract deployed to:", weedContract.address);

  contractFactory = await hre.ethers.getContractFactory('MasterChef');
  const chefContract = await contractFactory.deploy(weedContract.address, OWNER_ADDRESS, OWNER_ADDRESS, 1, 9794719); //change start block
  await chefContract.deployed();
  console.log("Masterchef Contract deployed to:", chefContract.address);

  contractFactory = await hre.ethers.getContractFactory('Woolf');
  const woolfContract = await contractFactory.deploy(woolContract.address, traitContract.address, 1000000);
  await woolfContract.deployed();
  console.log("Woolf Contract deployed to:", woolfContract.address);

  contractFactory = await hre.ethers.getContractFactory('Barn');
  const barnContract = await contractFactory.deploy(woolfContract.address, woolContract.address);
  await barnContract.deployed();
  console.log("Barn Contract deployed to:", barnContract.address);
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