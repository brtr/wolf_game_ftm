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

  contractFactory = await hre.ethers.getContractFactory('MILK');
  const milkContract = await contractFactory.deploy();
  await milkContract.deployed();
  console.log("Milk Contract deployed to:", milkContract.address);

  contractFactory = await hre.ethers.getContractFactory('WEED');
  const weedContract = await contractFactory.deploy();
  await weedContract.deployed();
  console.log("Weed Contract deployed to:", weedContract.address);

  contractFactory = await hre.ethers.getContractFactory('MasterChef');
  const chefContract = await contractFactory.deploy(weedContract.address, OWNER_ADDRESS, OWNER_ADDRESS, '10000000000000000', 10044960); //change start block
  await chefContract.deployed();
  console.log("Masterchef Contract deployed to:", chefContract.address);

  contractFactory = await hre.ethers.getContractFactory('Woolf');
  const woolfContract = await contractFactory.deploy(woolContract.address, milkContract.address, traitContract.address, 10000);
  await woolfContract.deployed();
  console.log("Woolf Contract deployed to:", woolfContract.address);

  contractFactory = await hre.ethers.getContractFactory('Barn');
  const barnContract = await contractFactory.deploy(woolfContract.address, milkContract.address);
  await barnContract.deployed();
  console.log("Barn Contract deployed to:", barnContract.address);

  contractFactory = await hre.ethers.getContractFactory('Randomizer');
  const randomContract = await contractFactory.deploy();
  await randomContract.deployed();
  console.log("Randomizer Contract deployed to:", randomContract.address);
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