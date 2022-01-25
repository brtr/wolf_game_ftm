import { WoolfAddress, WoolfABI, BarnAddress, BarnABI, WoolAddress, WoolABI, MilkAddress, ChefAddress, WeedAddress, MilkABI, ChefABI, WeedABI } from "./data.js";

(function() {
  let loginAddress = localStorage.getItem("loginAddress");
  let lpPoolId = 0;
  let mintAmount = 1;
  let unstakedTokens = [];
  let barnTokens = [];
  let wolfPackTokens = [];
  let targetIds = [];
  let targetType = "unstake";
  let payment = "ether";
  let tokenType = 0;
  let pendingWeed = 0;
  let weedAllowance = 0;
  let currentPrice, minted, mintCost, totalCost, balance;
  const TargetChain = {
    id: "4",
    name: "rinkeby"
  };

  const provider = new ethers.providers.Web3Provider(web3.currentProvider);
  const signer = provider.getSigner();
  const WoolContract = new ethers.Contract(WoolAddress, WoolABI, provider);
  const WoolfContract = new ethers.Contract(WoolfAddress, WoolfABI, provider);
  const BarnContract = new ethers.Contract(BarnAddress, BarnABI, provider);
  const barnWithSigner = BarnContract.connect(signer);
  const ChefContract = new ethers.Contract(ChefAddress, ChefABI, provider);
  const WeedContract = new ethers.Contract(WeedAddress, WeedABI, provider);
  const MilkContract = new ethers.Contract(MilkAddress, MilkABI, provider);

  function fetchErrMsg (err) {
    const errMsg = err.error ? err.error.message : err.message;
    alert('Error:  ' + errMsg.split(": ")[-1]);
    $("#loading").hide();
  }

  async function checkChainId () {
    const { chainId } = await provider.getNetwork();
    if (chainId != parseInt(TargetChain.id)) {
      alert("We don't support this chain, please switch to " + TargetChain.name + " and refresh");
      return;
    }
  }

  const reset = function() {
    unstakedTokens = [];
    barnTokens = [];
    wolfPackTokens = [];

    targetType = "unstake";
    targetIds = [];
    $(".tokenIcons").remove();

    mintAmount = 1;
    $("#mintAmount").text(mintAmount);
    getTotalCost();

    pendingWeed = 0;
    tokenType = 0;
  }

  const toggleBlock = function() {
    if (loginAddress == null) {
      $(".connected").hide();
      $(".unconnected").show();
    } else {
      $(".connected").show();
      $(".unconnected").hide();
    }
  }

  // Check if user is logged in
  const checkLogin = async function() {
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    if (accounts.length > 0) {
        localStorage.setItem("loginAddress", accounts[0]);
        loginAddress = accounts[0];
    } else {
        localStorage.removeItem("loginAddress");
        loginAddress = null;
    }
    toggleBlock();
  }

  const getCurrentPrice = async function() {
    if (payment == "wool") {
      currentPrice = await WoolfContract.wool_price();
      $(".mintCostToken").text("WOOL");
    } else if (payment == "weed") {
      currentPrice = await WoolfContract.weed_price();
      $(".mintCostToken").text("WEED");
    } else {
      currentPrice = await WoolfContract.MINT_PRICE();
      $(".mintCostToken").text("ETH");
    }

    currentPrice = parseFloat(ethers.utils.formatEther(currentPrice));
    getTotalCost();
    console.log("current price is ", currentPrice);
  }

  const getBalance = async function() {
    balance = await WoolContract.balanceOf(loginAddress);
    balance = parseFloat(ethers.utils.formatEther(balance));
    console.log("wool balance is ", balance);
    $("#woolBalance").text(balance);

    balance = await WeedContract.balanceOf(loginAddress);
    balance = parseFloat(ethers.utils.formatEther(balance));
    console.log("weed balance is ", balance);
    $("#weedBalance").text(balance);

    balance = await MilkContract.balanceOf(loginAddress);
    balance = parseFloat(ethers.utils.formatEther(balance));
    console.log("milk balance is ", balance);
    $("#milkBalance").text(balance);

    pendingWeed = await ChefContract.pendingweed(lpPoolId, loginAddress);
    console.log("pending weed is ", pendingWeed);
    $("#pendingWeed").text(pendingWeed);

    weedAllowance = await WeedContract.allowance(loginAddress, WoolfAddress);
    console.log("weed allowance is ", weedAllowance);
  }

  const getInfo = async function() {
    reset();
    const maxToken = await WoolfContract.MAX_TOKENS();
    $("#totalSupply").text(maxToken);

    if (loginAddress) {
      getBalance();

      const tokens = await WoolfContract.getOwnerTokens(loginAddress);
      console.log("all tokens, ", tokens);
      splitTokens(tokens);
      console.log("unstake tokens, ", unstakedTokens);
    }
    minted = await WoolfContract.minted();
    if (minted > 0) {
      $("#minted").text(minted);
    }

    getCurrentPrice();

    mintCost = await WoolfContract.mintCost(minted + 1);
    mintCost = parseFloat(ethers.utils.formatEther(mintCost));
    console.log("mint cost is ", mintCost);

    if (mintCost > 0) {
      $("#mintCost").text(mintCost);
      if (balance > mintCost) {
        $("#mintBtnBlock").show();
        $("#totalCostBlock").show();
        $("#insufficientBalance").hide();
      } else {
        $("#mintBtnBlock").hide();
        $("#totalCostBlock").hide();
        $("#insufficientBalance").show();
      }
    } else {
      $("#mintBtnBlock").show();
      $("#totalCostBlock").show();
      $("#insufficientBalance").hide();
    }

    const mintPercent = parseFloat(minted / maxToken).toFixed(3) * 100;
    $("#mintedPercent").css("width", mintPercent.toString() + "%");

    getTotalCost();
    $("#loading").hide();

    toggleStakeBtns();
  }

  const getTotalCost = async function() {
    console.log("mint amount is ", mintAmount);
    const price = mintCost > 0 ? mintCost : currentPrice;
    totalCost = price * mintAmount;
    if (payment == "weed" && totalCost > weedAllowance) {
      $(".approveWeedBlock").show();
      $(".mintTokenBlock").hide();
    } else {
      $(".approveWeedBlock").hide();
      $(".mintTokenBlock").show();
      $("#totalCost").text(totalCost.toLocaleString());
    }
  }

  const splitTokens = function(tokens) {
    for (var i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (token.isStaked) {
        if (token.isSheep) {
          $.inArray(token, barnTokens) == -1 && barnTokens.push(token);
        } else {
          $.inArray(token, wolfPackTokens) == -1 && wolfPackTokens.push(token);
        }
      } else {
        $.inArray(token, unstakedTokens) == -1 && unstakedTokens.push(token);
      }
    }

    addTokenIcons(barnTokens, "barn");
    toggleTokenBlock(barnTokens, $(".hasBarnToken"), $(".noBarnToken"));
    addTokenIcons(wolfPackTokens, "wolfPack");
    toggleTokenBlock(wolfPackTokens, $(".hasWolfPackToken"), $(".noWolfPackToken"));
    addTokenIcons(unstakedTokens, "unstake");
    toggleTokenBlock(unstakedTokens, $(".hasUnstakeToken"), $(".noUnstakedToken"));
  }

  const toggleTokenBlock = function(arr, $posBlock, $negBlock) {
    if (arr.length > 0) {
      $posBlock.show();
      $negBlock.hide();
    } else {
      $posBlock.hide();
      $negBlock.show();
    }
  }

  const addTokenIcons = function(arr, t_type) {
    let $block;
    if (t_type == "unstake") {
      $block = $(".hasUnstakeToken .tokens");
    } else if (t_type == "barn") {
      $block = $(".hasBarnToken");
    } else {
      $block = $(".hasWolfpackToken");
    }
    if (arr.length > 0) {
      for (var i = 0; i < arr.length; i++) {
        const isSheep = arr[i].isSheep;
        const imgPath = isSheep ? "./images/sheep.svg" : "./images/wolf.svg";
        $block.append("<img src=" + imgPath + " class='tokenIcons' data-id='" + arr[i].tokenId + "' data-type='" + t_type + "' />");
      }
    }
  }

  const weedApprove = async function(type) {
    try {
      $("#loading").show();
      const weedWithSigner = WeedContract.connect(signer);
      const targetAddress = type == "woolf" ? WoolfAddress : ChefAddress;
      const tx = await weedWithSigner.approve(targetAddress,  ethers.utils.parseUnits("100000000000", "ether"));
      console.log("sending tx, ", tx);
      await tx.wait();
      console.log("received tx ", tx);
      getInfo();
    } catch (err) {
      console.log(err);
      fetchErrMsg(err);
    }
  }

  const mint = async function(stake) {
    try {
      $("#loading").show();
      const price = payment == "ether" ? totalCost : 0;
      const woolfWithSigner = WoolfContract.connect(signer);
      console.log("price is ", price);
      console.log("mintAmount is ", mintAmount);
      console.log("token type is ", tokenType);
      const tx = await woolfWithSigner.mint(mintAmount, stake, tokenType, {value: ethers.utils.parseUnits(price.toString(), "ether")});
      console.log("sending tx, ", tx);
      await tx.wait();
      console.log("received tx ", tx);
      getInfo();
    } catch (err) {
      console.log(err);
      fetchErrMsg(err);
    }
  }

  const claim = async function(stake) {
    try {
      $("#loading").show();
      const tx = await barnWithSigner.claimManyFromBarnAndPack(targetIds, stake);
      console.log("sending tx, ", tx);
      await tx.wait();
      console.log("received tx ", tx);
      getInfo();
    } catch (err) {
      console.log(err);
      fetchErrMsg(err);
    }
  }

  const stake = async function() {
    try {
      $("#loading").show();
      const tx = await barnWithSigner.addManyToBarnAndPack(loginAddress, targetIds);
      console.log("sending tx, ", tx);
      await tx.wait();
      console.log("received tx ", tx);
      getInfo();
    } catch (err) {
      fetchErrMsg(err);
    }
  }

  const withdraw = async function() {
    try {
      $("#loading").show();
      const chefWithSigner = ChefContract.connect(signer);
      const tx = await chefWithSigner.withdraw(lpPoolId, 0);
      console.log("sending tx, ", tx);
      await tx.wait();
      console.log("received tx ", tx);
      getInfo();
    } catch (err) {
      fetchErrMsg(err);
    }
  }

  const toggleStakeBtns = function() {
    if (targetType == "unstake") {
      $("#stakeBtnBlock").hide();
      $("#unstakeBtnBlock").show();
    } else {
      $("#stakeBtnBlock").show();
      $("#unstakeBtnBlock").hide();
    }
  }

  if (window.ethereum) {
    $(".connectBtn").on("click", function() {
      checkLogin()
    });

    $(".payments").on("click", function() {
      payment = $(this).data("payment");
      if (payment == "wool") {
        tokenType = 1;
      } else if (payment == "weed") {
        tokenType = 2;
      } else {
        tokenType = 0;
      }
      getCurrentPrice();
    })

    checkChainId();
    toggleBlock();
    getInfo()

    $("#addBtn").click(function() {
      if (mintAmount < 10) {
        mintAmount = mintAmount + 1;
        $("#mintAmount").text(mintAmount);
        getTotalCost();
      }
    })

    $("#subBtn").click(function() {
      if (mintAmount > 1) {
        mintAmount = mintAmount - 1;
        $("#mintAmount").text(mintAmount);
        getTotalCost();
      }
    })

    $("#approveWoolfBtn").click(function() {
      weedApprove("woolf");
    })

    $("#approveChefBtn").click(function() {
      weedApprove("chef");
    })

    $("#mintBtn").click(function() {
      mint(false);
    })

    $("#mintStakeBtn").click(function() {
      mint(true);
    })

    $("#claimBtn").click(function() {
      claim(false);
    })

    $("#unStakeBtn").click(function() {
      claim(true);
    })

    $("#stakeBtn").click(function() {
      stake();
    })

    $("#withdrawBtn").click(function() {
      withdraw();
    })

    $(document).on("click", ".tokenIcons", function() {
      const tokenId = $(this).data("id");
      if($(this).data("type") != targetType) {
        targetIds = [];
        $(".tokenIcons").removeClass("checked");
      }
      if($.inArray(tokenId, targetIds) == -1) {
        targetIds.push(tokenId);
        targetType = $(this).data("type");
      } else {
        targetIds = $.grep(targetIds, function (value) {
          return value != tokenId;
        });
      }
      $(this).toggleClass("checked", $.inArray(tokenId, targetIds));

      toggleStakeBtns();
      console.log("token ids ", targetIds);
    })

    // detect Metamask account change
    ethereum.on('accountsChanged', function (accounts) {
      console.log('accountsChanges',accounts);
      if (accounts.length > 0) {
        localStorage.setItem("loginAddress", accounts[0]);
        loginAddress = accounts[0];
      } else {
        localStorage.removeItem("loginAddress");
        loginAddress = null;
      }
      getInfo();
      toggleBlock();
    });

    // detect Network account change
    ethereum.on('chainChanged', function(networkId){
      console.log('networkChanged',networkId);
      if (networkId != parseInt(TargetChain.id)) {
        alert("We don't support this chain, please switch to " + TargetChain.name + " and refresh");
      }
    });
  } else {
    console.warn("No web3 detected.");
  }

})();