// Real API Services for PRAMAN
import CryptoJS from 'crypto-js'

// Weather API Service
export const getWeatherData = async (latitude, longitude) => {
  // Using OpenWeatherMap API
  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY || '8b5596edd21ec8b8d3a8664227c3f822'
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
  
  console.log('Fetching weather data from:', url)
  
  const response = await fetch(url)
  
  if (!response.ok) {
    console.error('Weather API response not OK:', response.status, response.statusText)
    throw new Error(`Weather API request failed: ${response.status} ${response.statusText}`)
  }
  
  const data = await response.json()
  console.log('Weather API response:', data)
  
  return {
    rainfall: data.rain ? `${data.rain['1h'] || 0} mm` : '0 mm',
    humidity: `${data.main.humidity}%`,
    temperature: `${Math.round(data.main.temp)}°C`,
    windSpeed: `${Math.round(data.wind.speed * 3.6)} km/h`,
    pressure: `${data.main.pressure} hPa`
  }
}

// Location API Service
export const getLocationData = async () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          console.log('GPS coordinates obtained:', latitude, longitude)
          
          resolve({
            latitude: latitude.toFixed(6),
            longitude: longitude.toFixed(6)
          })
        } catch (error) {
          console.error('Error getting coordinates:', error)
          reject(error)
        }
      },
      (error) => {
        console.error('Geolocation error:', error)
        reject(new Error(`Location error: ${error.message}`))
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000
      }
    )
  })
}

// Blockchain Hash Functions
export const generateSignatureHash = (data) => {
  // Create a hash from the batch data
  const dataString = JSON.stringify(data)
  const hash = CryptoJS.SHA256(dataString).toString()
  return `0x${hash}`
}

export const generateTransactionHash = (senderAddress, recipientAddress, batchId, timestamp) => {
  // Create a transaction hash from sender, recipient, batch ID, and timestamp
  const transactionData = `${senderAddress}-${recipientAddress}-${batchId}-${timestamp}`
  const hash = CryptoJS.SHA256(transactionData).toString()
  return `0x${hash}`
}

export const generateBlockNumber = async () => {
  // Use Etherscan API directly to avoid MetaMask circuit breaker issues
  const response = await fetch('https://api.etherscan.io/api?module=proxy&action=eth_blockNumber')
  if (!response.ok) {
    throw new Error(`Etherscan API request failed: ${response.status} ${response.statusText}`)
  }
  
  const data = await response.json()
  if (data.result) {
    return parseInt(data.result, 16).toString()
  }
  
  throw new Error('Unable to fetch current block number from Etherscan API')
}

// Generate unique batch ID
export const generateBatchId = (regdNo, timestamp, plantCode) => {
  return `${regdNo}-${timestamp}-${plantCode}`
}

// Generate plant code from crop name
export const generatePlantCode = (cropName) => {
  const cropCodes = {
    'Ashwagandha': 'ASH',
    'Brahmi': 'BRH',
    'Tulsi': 'TUL',
    'Neem': 'NEM',
    'Amla': 'AML',
    'Turmeric': 'TUR',
    'Ginger': 'GIN',
    'Aloe Vera': 'ALO',
    'Shatavari': 'SHA',
    'Guduchi': 'GUD',
    'Arjuna': 'ARJ',
    'Triphala': 'TRI'
  }
  
  return cropCodes[cropName] || 'UNK'
}

// Get current timestamp
export const getCurrentTimestamp = () => {
  return Date.now().toString()
}

// Validate batch data
export const validateBatchData = (data) => {
  const requiredFields = ['cropInfo', 'location', 'weather']
  
  for (const field of requiredFields) {
    if (!data[field]) {
      throw new Error(`Missing required field: ${field}`)
    }
  }
  
  if (!data.cropInfo.name || !data.cropInfo.quantity) {
    throw new Error('Crop name and quantity are required')
  }
  
  return true
}

// Get user's wallet address
export const getWalletAddress = () => {
  const address = localStorage.getItem('walletAddress')
  if (!address) {
    throw new Error('Wallet not connected')
  }
  return address
}

// ===== BLOCKCHAIN FUNCTIONS (TO BE IMPLEMENTED AFTER DEPLOYMENT) =====
// These functions will work once the smart contract is deployed to a blockchain network

// TODO: Implement these functions after contract deployment
// - getBatchCompleteHistory()
// - getAllBatchesWithHistory()
// - getConsumerDashboard()
// - getCompleteDashboard()
// - getBatchDetails()
// - searchBatchesAdvanced()
// - Real-time monitoring functions
// - Dashboard analytics functions

// ===== LOCAL STORAGE MOCK FUNCTIONS (FOR TESTING) =====
// These functions simulate blockchain data using local storage for testing

// Mock function to store batch data locally (for testing)
export const mockStoreBatch = (batchData) => {
  try {
    const batches = JSON.parse(localStorage.getItem('mockBatches') || '[]')
    batches.push({
      ...batchData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: 'created'
    })
    localStorage.setItem('mockBatches', JSON.stringify(batches))
    return true
  } catch (error) {
    console.error('Error storing mock batch:', error)
    return false
  }
}

// Mock function to get all batches from local storage (for testing)
export const mockGetAllBatches = () => {
  try {
    return JSON.parse(localStorage.getItem('mockBatches') || '[]')
  } catch (error) {
    console.error('Error getting mock batches:', error)
    return []
  }
}

// Mock function to clear all mock data (for testing)
export const mockClearAllData = () => {
  try {
    localStorage.removeItem('mockBatches')
    localStorage.removeItem('mockUsers')
    localStorage.removeItem('mockTransactions')
    console.log('✅ All mock data cleared')
    return true
  } catch (error) {
    console.error('Error clearing mock data:', error)
    return false
  }
}
