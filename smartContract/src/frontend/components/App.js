import {BrowserRouter, Routes, Route} from "react-router-dom"
import './App.css';
import Navigation from './Navbar'
import {useState} from 'react';
import {ethers} from 'ethers';
//import MarketPlaceAddress from '../contractsData/MarketPlace-address.json'
import MarketPlaceAbi from '../contractsData/MarketPlace.json'
//import NFTAddress from '../contractsData/NFT-address.json'
import NFTAbi from '../contractsData/NFTO.json'
import Home from "./Home"
import Create from './Create'
import MyListedItem from './MyListedItem'
import MyPurchases from './MyPurchases'
import {Spinner} from 'react-bootstrap'
 
function App() {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true)
  const [nft, setNFT] = useState({})
  const [marketplace, setMarketPlace] = useState({})

  const web3Handler = async () => {
    // let provider = await detectEthereumProvider()
    // if(provider)
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    // Get provider from Metamask
    const provider =  await new ethers.providers.Web3Provider(window.ethereum)
    
    setAccount(accounts[0])
    // Set signer
    const signer = provider.getSigner()

    window.ethereum.on('chainChanged', (chainId) => {
      window.location.reload();
    })

    window.ethereum.on('accountsChanged', async function (accounts) {
      setAccount(accounts[0])
      await web3Handler()
    })
    loadContracts(signer) 
  }

  const loadContracts = async (signer) => {
    const marketplace = new ethers.Contract("0xD235C833B58fDa5721cCD2cB2372e0DD6c7Bb7a7", MarketPlaceAbi.abi, signer)
    setMarketPlace(marketplace)
    const nft =  new ethers.Contract("0x626bEE7089fF00BBa9d43A6051eE7B44C01a97C9", NFTAbi.abi, signer)
    // 0x7C48870535DB4dA3Ac73505A287DB32CfaC045A8
    setNFT(nft)
    setLoading(false)
  }
  return (
  <BrowserRouter>
    <div className="App">
     <Navigation web3Handler={web3Handler} account={account}/>
     {loading ? (<div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh'}}>
      <Spinner animation='border' style={{display: 'flex'}}/>
      <p className='mx-3 my-0'>Awaiting MetaMask Connection...</p>
      </div>) :
      (<Routes>
      <Route path="/" element={<Home marketplace={marketplace} nft={nft}/>} />
      <Route path="/create" element={<Create marketplace={marketplace} nft={nft}/>} />
      <Route path="/my-listed-items" element={<MyListedItem marketplace={marketplace} nft={nft} account={account}/> } />
      <Route path="/my-purchases" element={<MyPurchases marketplace={marketplace} nft={nft} account={account}/>}/>
     </Routes>)}
    </div>
  </BrowserRouter>
  );
}

export default App;
