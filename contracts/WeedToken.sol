pragma solidity ^0.8.0;
import "./ERC20.sol";
import "./Ownable.sol";

contract WEED is ERC20, Ownable{

    uint256 public maxSupply = 1000000000000*(10**18);
    mapping(address=>bool) public blacklist;
    mapping(address=>bool) public minters;

    constructor() ERC20("WEED", "WEED") {
    }

    modifier onlyMiner(){
        require(minters[msg.sender],"you are not minter >_<");
        _;
    }

    function setBlacklist(address user, bool value) external onlyOwner{
        blacklist[user] = value;
    }

    function _beforeTokenTransfer(address sender, address recipient, uint256 amount)internal override {
        require(!blacklist[sender]&&!blacklist[recipient]);
    }

    function mint(address to, uint256 amount)external onlyMiner{
        uint256 newSupply = totalSupply()+amount;
        if(newSupply>maxSupply){
            _mint(to, maxSupply-totalSupply());
        }else{
            _mint(to, amount);
        }
    }

    function addMinter(address _minter)external onlyOwner {
        minters[_minter] = true;
    }

    function removeMinter(address _minter)external onlyOwner{
        minters[_minter] = false;
    }
}
