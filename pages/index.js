import React, { useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import CreateProduct from "../components/CreateProduct";
import Product from '../components/Product';

import { fetchCoffee } from '../lib/api';


const App = () => {

  // This will fetch the users' public key (wallet address) from any wallet supported
  const { publicKey } = useWallet();
  const isOwner = (publicKey ? publicKey.toString() === process.env.NEXT_PUBLIC_OWNER_PUBLIC_KEY : false);
  const [creating, setCreating] = useState(false);
  const [products, setProducts] = useState([]);


  useEffect(() => {
    if (publicKey) {
      fetch(`/api/fetchProducts`)
        .then(response => response.json())
        .then(data => {
          setProducts(data);
        });
    }
    fetchCoffee()

  }, [publicKey]);

  const renderNotConnectedContainer = () => (
    <div>
      <img src="https://media2.giphy.com/media/iEpkpgoWTi19Y0xIM6/giphy.gif?cid=790b76119f95c7e0cf63aa425e49d0696b8185a68ea922b2&rid=giphy.gif&ct=g" alt="coffee" />
      <div className="button-container">
        <WalletMultiButton className="cta-button connect-wallet-button" />
      </div>
    </div>
  );

  const renderItemBuyContainer = () => (
    <div className="products-container">
      {products.map((product) => (
        <Product key={product.id} product={product} />
      ))}
    </div>
  );


  return (
    <div className="App">
      <div className="container">
        <header className="header-container">
          <div className="title-container">
            <p className="header">Coffee Solana Store</p>
            {isOwner && (
              <button className="create-product-button" onClick={() => setCreating(!creating)}>
                {creating ? "Close" : "Create Product"}
              </button>
            )}
          </div>
          <p className="sub-text">The only Coffee Solana Store that accepts Solana and USDC</p>
        </header>

        <main>
          {/* We only render the connect button if public key doesn't exist */}
          {creating && <CreateProduct />}
          {publicKey ? renderItemBuyContainer() : renderNotConnectedContainer()}
        </main>
      </div>
    </div>
  );
};

export default App;
