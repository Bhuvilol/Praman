import React, { useState, useEffect } from 'react'
import logo from '/logod.png'

function Header() {
  const [walletAddress, setWalletAddress] = useState('')
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Check if wallet is connected on component mount
    const address = localStorage.getItem('walletAddress')
    if (address) {
      setWalletAddress(address)
      setIsConnected(true)
    }

    // Listen for wallet connection changes
    const handleStorageChange = () => {
      const address = localStorage.getItem('walletAddress')
      if (address) {
        setWalletAddress(address)
        setIsConnected(true)
      } else {
        setWalletAddress('')
        setIsConnected(false)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    // Also listen for custom events (for same-tab updates)
    window.addEventListener('walletConnected', handleStorageChange)
    window.addEventListener('walletDisconnected', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('walletConnected', handleStorageChange)
      window.removeEventListener('walletDisconnected', handleStorageChange)
    }
  }, [])

  const formatAddress = (address) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const handleDisconnect = () => {
    localStorage.removeItem('walletAddress')
    setWalletAddress('')
    setIsConnected(false)
    
    // Dispatch disconnect event
    window.dispatchEvent(new CustomEvent('walletDisconnected'))
    
    // Redirect to home page
    window.location.href = '/'
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-12 sm:px-16 lg:px-20">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <img 
              src={logo} 
              alt="PRAMAN" 
              className="h-16 w-auto"
            />
          </div>
          
          <div className="flex items-center space-x-6">
            {/* Wallet Connection Status */}
            {isConnected ? (
              <div className="flex items-center space-x-3 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-800">Connected</span>
                </div>
                <div className="text-sm font-mono text-green-700 bg-green-100 px-2 py-1 rounded">
                  {formatAddress(walletAddress)}
                </div>
                <button
                  onClick={handleDisconnect}
                  className="text-green-600 hover:text-green-800 hover:bg-green-100 rounded px-2 py-1 text-xs font-medium transition-colors"
                  title="Disconnect Wallet"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-sm font-medium text-gray-600">Not Connected</span>
              </div>
            )}
            
            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">
                About
              </a>
              <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">
                Services
              </a>
              <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">
                Contact
              </a>
            </nav>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
