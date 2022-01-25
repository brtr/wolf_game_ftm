## 合约地址(Polygon Mumbai testnet)：
WOOL_ADDRESS = “0x283dCAF71E12DdfB1d0b7dD94c96fA4ade4f20Af”  
TRAITS_ADDRESS = “0xc36Ec42143872EbC654f3F9436a7850C209DD65d”  
WOOLF_ADDRESS = “0x2C054f03d0Bcf5a3Ef15dCEAa90C1BF655cF9E53”  
BARN_ADDRESS = “0x9a9CD3cE43FB112e1141a9f41A236f6974aaa45b”  

## 发布流程

不同网络合约代码可以通用，ETH, MATIC, FTM已测试，不过FTM的testnet没找到可以查看nft数据的地方，建议使用MATIC

建议使用remix操作，发布成功后马上去scan上面验证源码，期间不要改动代码，否则需要重新发布

1. 首先发布Traits和WOOL两个合约，不需要参数

2. 然后是Woolf，发布需要传WOOL_ADDRESS, TRAITS_ADDRESS, MAX_TOKENS(最多支持的token数量)

3. 最后是Barn，发布需要传WOOLF_ADDRESS和WOOL_ADDRESS

4. 使用脚本上传Traits数据到Traits合约，并更新Traits合约里面的WOOLF_ADDRESS

5. 更新Woolf合约里面的BARN_ADDRESS

6. 打开在WOOL合约，找到write contract里面的add controller, 输入BARN_ADDRESS

## 操作流程

### Mint

打开Woolf合约，找到write contract里面的mint，输入需要mint的数量和总价，以及是否需要stake，点击write生成数据
如需指定wolf等级，请在score一栏输入5-8，否则输入0随机生成

### Claim

打开Barn合约，找到write contract里面的claimManyFromBarnAndPack，输入需要收割对象的tokenID，选择是否需要unstake，点击write获得相对应的Wool

### metamask增加WOOL币种

打开WOOL合约，找到write contract里面的approve, 输入当前登录的地址和amount(暂时没发现有什么用), 点击write获取相应授权即可显示

### 查看相对应的图片和属性

打开https://testnets.opensea.io/  输入Woolf合约地址或者登录帐号即可查看


## 前端页面发布注意事项

1. 需要修改data.js里面的woolf address和barn address

2. 需要修改main.js里面的SERVER_URL和API_KEY

3. 本地测试需要先跑一个node服务器，npm start或者yarn start都行，默认端口3000


## 发布

1. npx hardhat run scripts/deploy.js --network rinkeby

2. npx hardhat verify --network rinkeby 合约地址

## 注意事项

1. 需要在wool的合约里通过addController将woolf合约给加进去，否则无法在woolf合约里通过wool去mint

2. 在wool里mint 羊毛，需要先将钱包地址通过addController加进去，然后mint 羊毛(注意要加18个0)

3. 在woolf合约里通过setPaidTokens设置， 比如设置为2， 则代表mint2个之后，就可以使用羊毛去mint

