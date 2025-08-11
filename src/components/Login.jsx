import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { generateMnemonic } from '../services/wallet';

function Login() {
  const [mnemonic, setMnemonic] = useState('');
  const [newMnemonic, setNewMnemonic] = useState('');
  const [error, setError] = useState('');
  const { login } = useWallet();

  const handleImport = async (e) => {
    e.preventDefault();
    if (!mnemonic.trim() || mnemonic.trim().split(' ').length !== 12) {
      setError('Please enter a valid 12-word mnemonic phrase.');
      return;
    }
    try {
      setError('');
      await login(mnemonic.trim());
    } catch (err) {
      setError('Invalid mnemonic phrase. Please check and try again.');
    }
  };

  const handleCreate = () => setNewMnemonic(generateMnemonic());
  const proceedWithNewMnemonic = async () => await login(newMnemonic);

  if (newMnemonic) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-lg space-y-6">
          <div className="text-center">
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔐</div>
            <h1 className="text-3xl font-bold">Save Your Secret Phrase</h1>
            <p className="text-lg mt-4" style={{ color: 'rgba(255,255,255,0.8)' }}>
              Your gateway to the crypto world
            </p>
          </div>
          
          <div className="bg-yellow-900 border border-yellow-500 rounded-lg p-4">
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>⚠️</span>
              <h3 className="font-bold text-yellow-400">CRITICAL SECURITY WARNING</h3>
            </div>
            <p className="text-sm" style={{ lineHeight: '1.6' }}>
              Write down these 12 words in the exact order shown. Store them securely offline. 
              This is the ONLY way to recover your wallet. Never share this phrase with anyone.
            </p>
          </div>
          
          <div className="bg-base-200 p-6 rounded-xl shadow-lg">
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '2rem' }}>📝</span>
              <h3 className="text-lg font-semibold mt-2" style={{ color: 'rgba(255,255,255,0.9)' }}>
                Your Recovery Phrase
              </h3>
            </div>
            <div className="mnemonic-phrase">
              {newMnemonic}
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              marginTop: '1.5rem',
              padding: '1rem',
              background: 'rgba(16, 185, 129, 0.1)',
              borderRadius: '0.5rem',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}>
              <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>✅</span>
              <span style={{ fontSize: '0.9rem', color: '#6bcf7f' }}>
                I have safely written down my recovery phrase
              </span>
            </div>
            <button 
              onClick={proceedWithNewMnemonic}
              className="mt-6 w-full btn btn-success"
              style={{ 
                fontSize: '1.1rem',
                padding: '1.2rem 2rem',
                fontWeight: '700'
              }}
            >
              🚀 Continue to Wallet
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md space-y-8">
        <div className="text-center">
          <div style={{ 
            fontSize: '5rem', 
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            💰
          </div>
          <h1 className="text-4xl font-bold">CryptoVault</h1>
          <p className="text-lg mt-4" style={{ 
            color: 'rgba(255,255,255,0.8)',
            fontWeight: '300'
          }}>
            Your secure gateway to decentralized finance
          </p>
        </div>
        
        <div className="bg-base-200 p-8 rounded-xl shadow-lg">
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '2.5rem' }}>📥</span>
            <h2 className="text-2xl font-semibold mt-2">Import Existing Wallet</h2>
            <p style={{ 
              color: 'rgba(255,255,255,0.7)', 
              fontSize: '0.9rem',
              marginTop: '0.5rem'
            }}>
              Enter your 12-word recovery phrase to restore your wallet
            </p>
          </div>
          <form onSubmit={handleImport} className="space-y-4">
            <div style={{ position: 'relative' }}>
              <textarea
                value={mnemonic}
                onChange={(e) => setMnemonic(e.target.value)}
                placeholder="word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12"
                className="w-full p-3 border border-gray-600 rounded-lg bg-base-100 focus:ring-2 focus:ring-blue-500 transition"
                rows="3"
                style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}
              />
              <div style={{
                position: 'absolute',
                top: '0.5rem',
                right: '0.5rem',
                background: 'rgba(102, 126, 234, 0.2)',
                borderRadius: '0.3rem',
                padding: '0.2rem 0.5rem',
                fontSize: '0.7rem',
                color: '#667eea'
              }}>
                12 words
              </div>
            </div>
            <button type="submit" className="mt-4 w-full btn btn-primary">
              <span style={{ marginRight: '0.5rem' }}>🔓</span>
              Import Wallet
            </button>
            {error && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0.8rem',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '0.5rem',
                marginTop: '1rem'
              }}>
                <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>❌</span>
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}
          </form>
        </div>
        
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>
          <span style={{ fontSize: '1.2rem' }}>✨</span>
          <span style={{ margin: '0 1rem', fontSize: '0.9rem' }}>OR</span>
          <span style={{ fontSize: '1.2rem' }}>✨</span>
        </div>
        
        <div className="bg-base-200 p-8 rounded-xl shadow-lg">
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '2.5rem' }}>✨</span>
            <h2 className="text-2xl font-semibold mt-2">Create New Wallet</h2>
            <p style={{ 
              color: 'rgba(255,255,255,0.7)', 
              fontSize: '0.9rem',
              marginTop: '0.5rem'
            }}>
              Generate a brand new wallet with a secure recovery phrase
            </p>
          </div>
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '0.8rem',
            padding: '1rem',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            <span style={{ fontSize: '1.5rem', marginBottom: '0.5rem', display: 'block' }}>🛡️</span>
            <p style={{ fontSize: '0.85rem', color: '#6bcf7f', lineHeight: '1.4' }}>
              Your new wallet will be secured with military-grade encryption
            </p>
          </div>
          <button onClick={handleCreate} className="w-full btn btn-neutral">
            <span style={{ marginRight: '0.5rem' }}>🎯</span>
            Create New Wallet
          </button>
        </div>
        
        <div style={{ 
          textAlign: 'center',
          marginTop: '2rem',
          padding: '1rem',
          borderTop: '1px solid rgba(255,255,255,0.1)'
        }}>
          <p style={{ 
            fontSize: '0.8rem', 
            color: 'rgba(255,255,255,0.5)',
            lineHeight: '1.5'
          }}>
            🔒 Your keys, your crypto. Always verify transactions before signing.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;