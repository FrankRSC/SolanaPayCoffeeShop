import React, { useState, useEffect, useMemo } from 'react';
import { Keypair, Transaction } from '@solana/web3.js';
import { findReference, FindReferenceError } from '@solana/pay';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { InfinitySpin } from 'react-loader-spinner';
import IPFSDownload from './IpfsDownload';
import { addOrder, hasPurchased, fetchItem } from "../lib/api";

const STATUS = {
  Initial: 'Initial',
  Submitted: 'Submitted',
  Paid: 'Paid',
};

export default function Buy({ itemID, type }) {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const orderID = useMemo(() => Keypair.generate().publicKey, []); // Public key used to identify the order

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(STATUS.Initial); // Tracking transaction status
  const [item, setItem] = useState(null); // IPFS hash & filename of the purchased item

  const order = useMemo(
    () => ({
      buyer: publicKey.toString(),
      orderID: orderID.toString(),
      itemID: itemID,
    }),
    [publicKey, orderID, itemID]
  );

  const processTransaction = async () => {
    setLoading(true);
    let txResponse;
    switch (type) {
      case 'USDC':
        txResponse = await fetch("../api/createTransactionUSDC", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(order),
        });

        break;

      default:
        txResponse = await fetch("../api/createTransaction", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(order),
        });
        break;
    }
    const txData = await txResponse.json();

    const tx = Transaction.from(Buffer.from(txData.transaction, 'base64'));
    console.log('Tx data is', tx);

    try {
      const txHash = await sendTransaction(tx, connection);
      console.log(
        `Transaction sent: https://solscan.io/tx/${txHash}?cluster=devnet`
      );
      setStatus(STATUS.Submitted);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if this address already has already purchased this item
    // If so, fetch the item and set paid to true
    // Async function to avoid blocking the UI
    async function checkPurchased() {
      const purchased = await hasPurchased(publicKey, itemID);
      if (purchased) {
        setStatus(STATUS.Paid);
        const item = await fetchItem(itemID);
        setItem(item);
      }
    }
    checkPurchased();
  }, [publicKey, itemID]);

  useEffect(() => {
    // Check if transaction was confirmed
    if (status === STATUS.Submitted) {
      setLoading(true);
      const interval = setInterval(async () => {
        try {
          const result = await findReference(connection, orderID);
          console.log('Finding tx reference', result.confirmationStatus);
          if (
            result.confirmationStatus === 'confirmed' ||
            result.confirmationStatus === 'finalized'
          ) {
            clearInterval(interval);
            setStatus(STATUS.Paid);
            setLoading(false);
            addOrder(order);
            alert('Thank you for your purchase!');
          }
        } catch (e) {
          if (e instanceof FindReferenceError) {
            return null;
          }
          console.error('Unknown error', e);
        } finally {
          setLoading(false);
        }
      }, 2000);
      return () => {
        clearInterval(interval);
      };
    }

    async function getItem(itemID) {
      const item = await fetchItem(itemID);
      console.log(item)
      setItem(item);
    }

    if (status === STATUS.Paid) {
      getItem(itemID);
    }

  }, [status]);

  if (!publicKey) {
    return (
      <div>
        <p>You need to connect your wallet to make transactions</p>
      </div>
    );
  }

  return (
    <>
      {/* Display either buy button or IPFSDownload component based on if Hash exists */}
      {item ? (
          <button disabled={loading} className="buy-button" >
            <IPFSDownload hash={item.hash} filename={item.filename} />
          </button>
        ) : !loading ? (
          <button disabled={loading} className="buy-button" onClick={() => processTransaction(type)}>
            Buy whit {type} 🠚
          </button>
        ) :
          <InfinitySpin color="gray" />
      }
    </>
  );
}