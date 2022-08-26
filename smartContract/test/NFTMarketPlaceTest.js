const {expect}= require("chai");
const {ethers} = require("hardhat");

// 1 ether = 10**18 wei => converts ether to wei
const toWei = (num) => ethers.utils.parseEther(num.toString())
const fromWei = (num) => ethers.utils.formatEther(num)

 
describe("NFTMarketPlace", function(){
    let addr1, addr2, nft, marketPlace
    let deployer = 0x6A13b88A2bC7E8226679DFbb60f47FD9C3D93943
    let feePercent = 10
    let URI = "Sample Uri"
    beforeEach(async function () {
        const NFT = await ethers.getContractFactory("NFT");
        const MarketPlace = await ethers.getContractFactory("MarketPlace");

        [deployer, addr1, addr2] = await ethers.getSigners();
        nft = await NFT.deploy();
        await nft.deployed();
        marketPlace = await MarketPlace.deploy(feePercent);
    });
    describe("Deployment", function () {
        it("Should track name and symbol of the nft collection", async function(){
            expect(await nft.name()).to.equal("myToken");
            expect(await nft.symbol()).to.be.not.equal("MTR");
        });
        it("Should track feeAccount and FeePercent", async function(){
            //expect(await marketPlace.mainAccount()).to.equal(deployer.address);
            expect(await marketPlace.feePercent()).to.equal(feePercent);
        });
    });
    describe("Minting", function () {
        it("Should take count of each minted NFT", async function() {
            await nft.connect(addr1).safeMint(URI);
            // expect(await nft.tokenId()).to.be.equal(0);
            expect(await nft.balanceOf(addr1.address)).to.be.equal(1);
            expect(await nft.tokenURI(0)).to.equal(`https://ipfs.io/ipfs/${URI}`);
        });
        it("Should track feeAccount and FeePercent", async function(){
            expect(await marketPlace.mainAccount()).to.equal(marketPlace.address);
            expect(await marketPlace.feePercent()).to.equal(feePercent);
        });
    });

    describe("Making MarketPlace Items", function () {
        beforeEach(async function () {
            await nft.connect(addr1).safeMint(URI);
            await nft.connect(addr1).setApprovalForAll(marketPlace.address, true);
            
        });

        it("Should track newly created item, transfer NFT from seller to marketplace and emit item created", async function(){
             await expect(marketPlace.connect(addr1).createItem(nft.address, 0, toWei(1))).to.emit(marketPlace, "ItemCreated")
             .withArgs(1, nft.address, 0, addr1.address, toWei(1));
             expect(await nft.ownerOf(0)).to.equal(marketPlace.address);
            expect(await marketPlace.itemCount()).to.be.equal(1);

            // const item = marketPlace.items(1);
            // expect(await item.itemId).to.equal(1);
            // expect(await item.nft).to.equal(nft.address);
            // expect(await item.tokenId).to.equal(0);
            // expect(await item.price).to.equal(toWei(1));
            // expect(await item.sold).to.equal(false);
         });

         it("Should fail if price is set to Zero", async function(){
            expect(await marketPlace.connect(addr1).createItem(nft.address, 0, 0)).to.be.reverted();
         });


    });
    describe("Purchasing MarketPlace Items", function () {
        beforeEach(async function () {
            let price = 2;
            await nft.connect(addr1).safeMint(URI);
            await nft.connect(addr1).setApprovalForAll(marketPlace.address, true);
            await marketPlace.connect(addr1).createItem(nft.address,0, 20);
        });
        it("Should update item as sold, pay seller, transfer NFT to buyer, charge fees and emit a bought event", async function(){
            const seller = await addr1.getBalance();
            const feeAccountInitialEthBal = await marketPlace.balance;
            totalPriceInWei = await marketPlace.connect(deployer).priceConvert(marketPlace.getTotalPrice(1));

            await expect(marketPlace.connect(deployer).buyItem(1,{value: totalPriceInWei}))
            .to.emit(marketPlace, "ItemBought").withArgs(
                1, nft.address, 0, toWei(price), addr1.address, deployer.address
            )
            const sellerFinalEthBal = await addr1.getBalance();
            const feeAccountFinalEthBal = await marketPlace.balance;

            expect(+fromWei(sellerFinalEthBal)).to.equal(+price + + fromWei(seller))

            const fee = (feePercent / 100) * price

            expect(+fromWei(feeAccountFinalEthBal)).to.equal(+fee + + fromWei(feeAccountInitialEthBal))
            expect(await nft.ownerOf(0)).to.equal(deployer.address)
            expect(await marketPlace.items(1).sold).to.equal(true)

        })

    });
    
});
