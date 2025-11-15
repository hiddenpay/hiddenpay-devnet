'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface WalletContextType {
  connected: boolean
  connecting: boolean
  publicKey: string | null
  walletProvider: any
  connect: (walletType: 'phantom' | 'solflare' | 'backpack') => Promise<void>
  disconnect: () => void
  signTransaction: (transaction: any) => Promise<any>
  signAllTransactions: (transactions: any[]) => Promise<any[]>
  signMessage: (message: Uint8Array | string) => Promise<any>
  sendTransaction: (transaction: any, options?: any) => Promise<string>
}

const WalletContext = createContext<WalletContextType>({
  connected: false,
  connecting: false,
  publicKey: null,
  walletProvider: null,
  connect: async () => {},
  disconnect: () => {},
  signTransaction: async () => {},
  signAllTransactions: async () => [],
  signMessage: async () => {},
  sendTransaction: async () => '',
})

export const useWallet = () => useContext(WalletContext)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [walletProvider, setWalletProvider] = useState<any>(null)

  useEffect(() => {
    // Check if wallet was previously connected
    const savedWallet = localStorage.getItem('hiddenPayWallet')
    const savedPublicKey = localStorage.getItem('hiddenPayPublicKey')
    
    if (savedWallet && savedPublicKey && typeof window !== 'undefined') {
      // Try to reconnect to saved wallet
      reconnectWallet(savedWallet as 'phantom' | 'solflare' | 'backpack')
    }
  }, [])

  const reconnectWallet = async (walletType: 'phantom' | 'solflare' | 'backpack') => {
    try {
      let provider: any = null
      
      if (walletType === 'phantom') {
        provider = (window as any).phantom?.solana
      } else if (walletType === 'solflare') {
        provider = (window as any).solflare
      } else if (walletType === 'backpack') {
        provider = (window as any).backpack
      }

      if (provider && provider.isConnected) {
        const pubKey = provider.publicKey.toString()
        setConnected(true)
        setPublicKey(pubKey)
        setWalletProvider(provider)
      }
    } catch (error) {
      console.error('Wallet reconnection error:', error)
    }
  }

  const connect = async (walletType: 'phantom' | 'solflare' | 'backpack') => {
    setConnecting(true)
    
    try {
      let provider: any = null
      
      // Get the wallet provider from window object
      if (walletType === 'phantom' && typeof window !== 'undefined') {
        provider = (window as any).phantom?.solana
      } else if (walletType === 'solflare' && typeof window !== 'undefined') {
        provider = (window as any).solflare
      } else if (walletType === 'backpack' && typeof window !== 'undefined') {
        provider = (window as any).backpack
      }

      if (!provider) {
        // If wallet not installed, redirect to install page
        const installUrls = {
          phantom: 'https://phantom.app/',
          solflare: 'https://solflare.com/',
          backpack: 'https://backpack.app/'
        }
        window.open(installUrls[walletType], '_blank')
        setConnecting(false)
        return
      }

      const response = await provider.connect({ onlyIfTrusted: false })
      const pubKey = response.publicKey.toString()
      
      setConnected(true)
      setPublicKey(pubKey)
      setWalletProvider(provider)
      
      // Save to localStorage
      localStorage.setItem('hiddenPayWallet', walletType)
      localStorage.setItem('hiddenPayPublicKey', pubKey)
      
      provider.on('disconnect', () => {
        disconnect()
      })
      
    } catch (error) {
      console.error('Wallet connection error:', error)
    } finally {
      setConnecting(false)
    }
  }

  const disconnect = () => {
    if (walletProvider) {
      walletProvider.disconnect()
    }
    setConnected(false)
    setPublicKey(null)
    setWalletProvider(null)
    localStorage.removeItem('hiddenPayWallet')
    localStorage.removeItem('hiddenPayPublicKey')
  }

  const signTransaction = async (transaction: any) => {
    if (!walletProvider) {
      throw new Error('Wallet not connected')
    }
    
    try {
      const signedTransaction = await walletProvider.signTransaction(transaction)
      return signedTransaction
    } catch (error) {
      console.error('Transaction signing error:', error)
      throw error
    }
  }

  const signAllTransactions = async (transactions: any[]) => {
    if (!walletProvider) {
      throw new Error('Wallet not connected')
    }
    
    try {
      const signedTransactions = await walletProvider.signAllTransactions(transactions)
      return signedTransactions
    } catch (error) {
      console.error('Transactions signing error:', error)
      throw error
    }
  }

  const signMessage = async (message: Uint8Array | string) => {
    if (!walletProvider) {
      throw new Error('Wallet not connected')
    }
    
    try {
      const encodedMessage = typeof message === 'string' 
        ? new TextEncoder().encode(message) 
        : message
      
      const signature = await walletProvider.signMessage(encodedMessage)
      return signature
    } catch (error) {
      console.error('Message signing error:', error)
      throw error
    }
  }

  const sendTransaction = async (transaction: any, options?: any) => {
    if (!walletProvider) {
      throw new Error('Wallet not connected')
    }
    
    try {
      const signature = await walletProvider.signAndSendTransaction(transaction, options)
      return signature
    } catch (error) {
      console.error('Transaction send error:', error)
      throw error
    }
  }

  return (
    <WalletContext.Provider value={{ 
      connected, 
      connecting, 
      publicKey, 
      walletProvider,
      connect, 
      disconnect,
      signTransaction,
      signAllTransactions,
      signMessage,
      sendTransaction
    }}>
      {children}
    </WalletContext.Provider>
  )
}
