import React, { useEffect, useState } from "react";
import {
  Connection,
  clusterApiUrl,
  PublicKey,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

const getProvider = () => {
  if ("solana" in window) {
    const provider = window.solana;
    if (provider.isPhantom) return provider;
  }
  window.open("https://phantom.app/", "_blank");
};

export default function App() {
  const [provider, setProvider] = useState(null);
  const [walletKey, setWalletKey] = useState(null);
  const [balance, setBalance] = useState(null);

  const connection = new Connection(clusterApiUrl("devnet"));

  useEffect(() => {
    const prov = getProvider();
    if (prov) setProvider(prov);
  }, []);

  const connectWallet = async () => {
    try {
      const res = await provider.connect();
      setWalletKey(res.publicKey.toString());
    } catch (err) {
      console.error("Connect error:", err);
    }
  };

  const getWalletBalance = async () => {
    try {
      const pubKey = new PublicKey(walletKey);
      const bal = await connection.getBalance(pubKey);
      setBalance(bal / LAMPORTS_PER_SOL);
    } catch (err) {
      console.error("Balance fetch error:", err);
    }
  };

  const sendSol = async () => {
    const recipient = prompt("Enter recipient address:");
    if (!recipient) return;

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: provider.publicKey,
        toPubkey: new PublicKey(recipient),
        lamports: 0.01 * LAMPORTS_PER_SOL, // 0.01 SOL
      })
    );

    try {
      const { signature } = await provider.signAndSendTransaction(transaction);
      await connection.confirmTransaction(signature);
      alert("✅ Transaction sent: " + signature);
    } catch (err) {
      console.error("Send error:", err);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>🪙 Solana Manual Wallet Integration</h1>

      {!walletKey ? (
        <button onClick={connectWallet}>Connect to Phantom</button>
      ) : (
        <>
          <p>
            <strong>Wallet:</strong> {walletKey}
          </p>
          <button onClick={getWalletBalance}>Get Balance</button>
          {balance !== null && (
            <p>
              <strong>Balance:</strong> {balance} SOL
            </p>
          )}
          <button onClick={sendSol}>Send 0.01 SOL</button>
        </>
      )}
    </div>
  );
}
