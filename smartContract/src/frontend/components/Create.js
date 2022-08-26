import { useState } from 'react'
import { BigNumber, ethers } from "ethers"
import { Row, Form, Button } from 'react-bootstrap'
import { create as ipfsHttpClient } from 'ipfs-http-client'
const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')


const Create = ({ marketplace, nft }) => {
  const [image, setImage] = useState('')
  const [price, setPrice] = useState({})
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const uploadToIPFS = async (event) => {
    event.preventDefault()
    const file = event.target.files[0]
    if (typeof file !== 'undefined') {
      try {
        const result = await client.add(file)
        console.log(result)
        setImage(`https://ipfs.infura.io/ipfs/${result.path}`)
      } catch (error){
        console.log("ipfs image upload error: ", error)
      }
    }
  }

  const onChange = (e) => {
    const pprice = e.target.value; 
    if(Number(pprice)){
      setPrice(pprice);
    }}


  const createNFT = async () => {
    if (!image || !price || !name || !description) return
    try{
      const result = await client.add(JSON.stringify({image, price, name, description}))
      mintThenList(result)
    } catch(error) {
      console.log("ipfs uri upload error: ", error)
    }
  }
  const mintThenList = async (result) => {
    const uri = `${result.path}`
    // mint nft 
    console.log('About to mint')
    await(await nft.safeMint(uri)).wait()
    console.log("Minted!")
    // get tokenId of new nft 
    const id = await nft._tokenIdCounter() - 1
    // approve marketplace to spend nft
    await(await nft.setApprovalForAll(marketplace.address, true, {gasLimit: 470000})).wait()
    console.log("aPPROVED!")
    // add nft to marketplace
    const listingPrice = ethers.utils.parseUnits(price, 18)
    console.log(id)
    await(await marketplace.createItem(nft.address, id, listingPrice,)).wait()
    console.log("created")
    alert("NFT Created!!")
  }


  return (
    <div className="container-fluid mt-5">
      <div className="row">
        <main role="main" className="col-lg-12 mx-auto" style={{ maxWidth: '1000px' }}>
          <div className="content mx-auto">
            <Row className="g-4">
              <Form.Control
                type="file"
                required
                name="file"
                onChange={uploadToIPFS}
              />
              <Form.Control onChange={(e) => setName(e.target.value)} size="lg" required type="text" placeholder="Name..." />
              <Form.Control onChange={(e) => setDescription(e.target.value)} size="lg" required as="textarea" placeholder="Description..." />
              <Form.Control onChange={(e) => onChange(e)} size="lg" required type="number" placeholder="Price in US Dollar" />
              <div className="d-grid px-0">
                <Button onClick={createNFT} variant="primary" size="lg">
                  Mint NFT!
                </Button>
              </div>
            </Row>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Create