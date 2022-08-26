// SPDX-License-Identifier: MIT
pragma solidity = 0.8.4;

import "@openzeppelin/contracts/interfaces/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol"; 
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract MarketPlace is ReentrancyGuard{
    using Counters for Counters.Counter;
    using SafeMath for uint256;

    address payable mainAccount = payable(address(this));
    uint public immutable feePercent;
    Counters.Counter public itemCount;
    AggregatorV3Interface internal priceFeed;

    struct Item{
        uint256 itemId;
        IERC721 nft;
        uint tokenId;
        uint price;
        address payable seller;
        bool sold;
    }
    event received(address indexed operator, address indexed from, uint tokenId, bytes data);
    event ItemCreated(uint itemId, address indexed nft, uint tokenId, address indexed owner, uint price);
    event ItemBought(uint itemId, address indexed nft, uint tokenId, address indexed seller, address indexed buyer);

    mapping(uint=>Item) public items;

    modifier noZeroAddress(){
        require(msg.sender != address(0));
        _;
    }

    constructor(uint _feePercent){
        feePercent = _feePercent;
        priceFeed = AggregatorV3Interface(0x8A753747A1Fa494EC906cE90E9f37563A8AF630e);
    }

    // function setApprovalForAll(address operator, bool approved) public virtual override {
    //     _setApprovalForAll(_msgSender(), operator, approved);
    // }

    /// @notice Oracle function to get latest price of ETH/USD
    function getLatestPrice() public view returns (int) {
        ( /*uint80 roundID*/,
            int ExchangePrice,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/ ) = priceFeed.latestRoundData();
        return ExchangePrice; 
    }

    /// @notice This function is to convert the dollar price of the NFTn
    /// to wei so that the wallet can pay the amount
    function priceConvert(uint __price) public view returns(uint){
        return __price.mul(10**26).div(uint(getLatestPrice())); 

        /*  Exchangeprice =  10 ** 18wei
           __price =  x   */     
    }

    function createItem(IERC721 _nft, uint _tokenId, uint _price) external nonReentrant noZeroAddress {
        require(_price != 0, "Price must be greater than zero");
        //require(, "Invalid tokenId, does not exist");

        _nft.transferFrom(msg.sender, address(this), _tokenId);
        itemCount.increment();
        uint count = itemCount.current();

        items[count] = Item (count, _nft, _tokenId, _price, payable(msg.sender), false);
        emit ItemCreated(count, address(_nft), _tokenId, msg.sender, _price);

    }

    receive () external payable {}

    fallback () external payable {}

    /// @notice To buy the item by sending ether to the contract and using the itemId to get the Item
    function buyItem(uint _itemId) external payable nonReentrant noZeroAddress{
        uint firstPrice = getTotalPrice(_itemId);
        uint totalPrice = priceConvert(firstPrice);

        Item storage item = items[_itemId];
        uint sellerPrice = priceConvert(item.price);
        //uint mainAccountPrice = totalPrice - sellerPrice;

        require(_itemId > 0 && _itemId <= itemCount.current(), "Item doesn't exist"); 
        require(msg.value >= totalPrice, "Not enough ether to cover item price and market fee");
        require(!item.sold, "Item already sold");

        (bool success,) = mainAccount.call{value: totalPrice}("");
        require(success, "Ether transfer wasn't successful");

        (bool successful,) = payable(item.seller).call{value: sellerPrice}("");
        require(successful, "Ether transfer wasn't successful");

        item.sold = true;

        item.nft.transferFrom(address(this), msg.sender, item.tokenId);
        emit ItemBought(_itemId, address(item.nft), item.tokenId, item.seller, msg.sender);
     }

     function getTotalPrice(uint _itemId) public view returns (uint){
        return (items[_itemId].price).mul(100 + feePercent).div(100);
     }

     function getContractBalance() public view returns (uint) {
        return mainAccount.balance;
     }
}
 