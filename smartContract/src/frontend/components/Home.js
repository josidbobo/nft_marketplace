import {useState, useEffect} from 'react'
import {Row, Col, Card, Button} from 'react-bootstrap'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import {ethers} from 'ethers'

const Home = ({marketplace, nft}) => {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const loadMarketPlaceItems = async () => {
        const itemCount = await marketplace.itemCount()
  
        let items = []
        for(let i = 0; i <= itemCount; i++){
            const item = await marketplace.items(i)
            
            if(!item.sold){
                // get uri
                const uri = await nft.tokenURI(item.tokenId)
                console.log(uri)
                // use uri to fetch the nft metadata from ipfs
                const response = await fetch(`https://ipfs.io/ipfs/${uri}/`)
                const metadata = await response.json()
                //const mJson = metadata.json
                // get total price of item(item price + fee)
                const totalPrice = await marketplace.getTotalPrice(item.itemId)
                const formatedPrice = ethers.utils.formatEther(totalPrice)

                const sellerPrice = await marketplace.priceConvert(item.price)
                const newmovement = await ethers.utils.formatEther(sellerPrice)
                console.log(newmovement)

                items.push({
                    formatedPrice,
                    itemId: item.itemId,
                    seller: item.seller,
                    name: metadata.name,
                    description: metadata.description,
                    image: metadata.image
                })
            }
        }
        setItems(items)
        setLoading(false)
    }

    const buyMarketItem = async (item) => {
      const totalPrice = await marketplace.getTotalPrice(item.itemId)
      const weiPrice = await marketplace.priceConvert(totalPrice)
      
      const forMat = ethers.utils.formatUnits(weiPrice)
      console.log(forMat)
        await (await marketplace.buyItem(item.itemId, {value: weiPrice})).wait()
        loadMarketPlaceItems()
    }
    useEffect(() => {
        loadMarketPlaceItems()
    }, [])

    if (loading) return (
        <main style={{ padding: "1rem 0" }}>
          <h2>Loading...</h2>
        </main>
      )
          
  return (
    <div className="flex justify-center">
      {items.length > 0 ?
        <div className="px-5 container">
          <Row xs={1} md={2} lg={4} className="g-4 py-5">
            {items.map((item, idx) => (
              <Col key={idx} className="overflow-hidden">
                <Card>
                  <Card.Img variant="top" src={item.image} />
                  <Card.Body color="secondary">
                    <Card.Title>{item.name}</Card.Title>
                    <Card.Text>
                      {item.description}
                    </Card.Text>
                  </Card.Body>
                  <Card.Footer>
                    <div className='d-grid'>
                      <Button onClick={() => buyMarketItem(item)} variant="primary" size="lg">
                        Buy for {`$${item.formatedPrice}`}
                      </Button>
                    </div>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
        : (
          <main style={{ padding: "1rem 0" }}>
            <h2>No assets</h2>
          </main>
        )}

        </div>
    );
}

export default Home