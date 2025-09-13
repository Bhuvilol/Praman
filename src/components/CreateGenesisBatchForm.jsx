import React, { useState, useEffect } from 'react'
import { 
  getWeatherData, 
  getLocationData, 
  generateSignatureHash, 
  generateTransactionHash, 
  generateBlockNumber,
  generateBatchId,
  generatePlantCode,
  getCurrentTimestamp,
  validateBatchData,
  getWalletAddress
} from '../utils/apiServices'

function CreateGenesisBatchForm({ user, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    batchId: '',
    farmerInfo: {
      name: user?.name || '',
      regdNo: user?.regd_no || '',
      email: user?.email || ''
    },
    cropInfo: {
      name: '',
      quantity: '',
      variant: '',
      condition: '',
      contaminationLevel: ''
    },
    location: {
      latitude: '',
      longitude: ''
    },
    weather: {
      rainfall: '',
      humidity: '',
      temperature: '',
      windSpeed: '',
      pressure: ''
    },
    blockchain: {
      signatureHash: '',
      transactionHash: '',
      blockNumber: ''
    },
    documents: [],
    notes: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Crop options
  const cropOptions = [
    'Ashwagandha', 'Brahmi', 'Tulsi', 'Neem', 'Amla', 'Turmeric', 
    'Ginger', 'Aloe Vera', 'Shatavari', 'Guduchi', 'Arjuna', 'Triphala'
  ]

  const variantOptions = [
    'Organic', 'Wild', 'Cultivated', 'Hybrid', 'Traditional', 'Premium'
  ]

  const conditionOptions = [
    'Excellent', 'Good', 'Fair', 'Poor', 'Damaged'
  ]

  const contaminationOptions = [
    'None', 'Low', 'Moderate', 'High', 'Critical'
  ]

  // Initialize form data with real APIs
  useEffect(() => {
    const initializeForm = async () => {
      try {
        setLoading(true)
        setError('')
        console.log('🚀 Initializing CreateGenesisBatchForm...')

        // Check if wallet is connected
        const walletAddress = getWalletAddress()
        console.log('🔗 Wallet connected:', walletAddress)

        // Get location data
        console.log('📍 Getting location data...')
        const locationData = await getLocationData()
        console.log('📍 Location data received:', locationData)
        
        // Get weather data
        console.log('🌤️ Getting weather data...')
        const weatherData = await getWeatherData(locationData.latitude, locationData.longitude)
        console.log('🌤️ Weather data received:', weatherData)
        
        // Generate batch ID
        const timestamp = getCurrentTimestamp()
        const plantCode = 'GEN' // Genesis batch code
        const batchId = generateBatchId(user?.regd_no || 'FRM001', timestamp, plantCode)
        console.log('🆔 Generated batch ID:', batchId)
        
        // Generate blockchain data
        console.log('⛓️ Generating blockchain data...')
        const signatureHash = generateSignatureHash({
          batchId,
          timestamp,
          farmer: user?.regd_no,
          location: locationData
        })
        
        const transactionHash = generateTransactionHash(
          walletAddress,
          'GENESIS',
          batchId,
          timestamp
        )
        
        const blockNumber = await generateBlockNumber()
        console.log('⛓️ Blockchain data generated:', { signatureHash, transactionHash, blockNumber })
        
        setFormData(prev => ({
          ...prev,
          batchId,
          location: locationData,
          weather: weatherData,
          blockchain: {
            signatureHash,
            transactionHash,
            blockNumber
          }
        }))
        
        console.log('✅ Form data initialized successfully!')
        
      } catch (error) {
        console.error('❌ Error initializing form:', error)
        if (error.message === 'Wallet not connected') {
          setError('Please connect your wallet first to create a batch')
        } else {
          setError(error.message)
        }
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      initializeForm()
    }
  }, [user])


  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files)
    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, ...files]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate form data
      validateBatchData(formData)
      
      // Prepare batch data for submission
      const batchData = {
        ...formData,
        status: 'created',
        created_at: new Date().toISOString(),
        supplyChainStage: 'genesis', // This is the starting point
        previousActor: null, // No previous actor for genesis
        nextActor: null // Will be set when sent
      }
      
      onSubmit(batchData)
      onClose()
    } catch (error) {
      console.error('Error creating batch:', error)
      setError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading form data...</p>
          <p className="text-sm text-gray-500 mt-2">Fetching location, weather, and blockchain data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">🌱 Create Genesis Batch</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="text-red-400">⚠️</div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error Loading Form Data</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Batch ID */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Batch ID (Auto-generated)
              </label>
              <input
                type="text"
                value={formData.batchId}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
              />
            </div>

            {/* Farmer Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Farmer Name
                </label>
                <input
                  type="text"
                  value={formData.farmerInfo.name}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration ID
                </label>
                <input
                  type="text"
                  value={formData.farmerInfo.regdNo}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.farmerInfo.email}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                />
              </div>
            </div>

            {/* Crop Information */}
            <div className="bg-emerald-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🌿 Crop Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Crop Name *
                  </label>
                  <select
                    value={formData.cropInfo.name}
                    onChange={(e) => handleInputChange('cropInfo', 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  >
                    <option value="">Select Crop</option>
                    {cropOptions.map(crop => (
                      <option key={crop} value={crop}>{crop}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity (kg) *
                  </label>
                  <input
                    type="number"
                    value={formData.cropInfo.quantity}
                    onChange={(e) => handleInputChange('cropInfo', 'quantity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Enter quantity"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Variant *
                  </label>
                  <select
                    value={formData.cropInfo.variant}
                    onChange={(e) => handleInputChange('cropInfo', 'variant', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  >
                    <option value="">Select Variant</option>
                    {variantOptions.map(variant => (
                      <option key={variant} value={variant}>{variant}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Condition *
                  </label>
                  <select
                    value={formData.cropInfo.condition}
                    onChange={(e) => handleInputChange('cropInfo', 'condition', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  >
                    <option value="">Select Condition</option>
                    {conditionOptions.map(condition => (
                      <option key={condition} value={condition}>{condition}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contamination Level *
                  </label>
                  <select
                    value={formData.cropInfo.contaminationLevel}
                    onChange={(e) => handleInputChange('cropInfo', 'contaminationLevel', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  >
                    <option value="">Select Level</option>
                    {contaminationOptions.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📍 Location Information (Auto-filled)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Latitude
                  </label>
                  <input
                    type="text"
                    value={formData.location.latitude}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longitude
                  </label>
                  <input
                    type="text"
                    value={formData.location.longitude}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                  />
                </div>
              </div>
            </div>

            {/* Weather Information */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🌤️ Weather Information (Auto-filled)</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rainfall
                  </label>
                  <input
                    type="text"
                    value={formData.weather.rainfall}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Humidity
                  </label>
                  <input
                    type="text"
                    value={formData.weather.humidity}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Temperature
                  </label>
                  <input
                    type="text"
                    value={formData.weather.temperature}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Wind Speed
                  </label>
                  <input
                    type="text"
                    value={formData.weather.windSpeed}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pressure
                  </label>
                  <input
                    type="text"
                    value={formData.weather.pressure}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                  />
                </div>
              </div>
            </div>

            {/* Blockchain Information */}
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">⛓️ Blockchain Information (Auto-generated)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Signature Hash
                  </label>
                  <input
                    type="text"
                    value={formData.blockchain.signatureHash}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction Hash
                  </label>
                  <input
                    type="text"
                    value={formData.blockchain.transactionHash}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Block Number
                  </label>
                  <input
                    type="text"
                    value={formData.blockchain.blockNumber}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                  />
                </div>
              </div>
            </div>

            {/* Document Upload */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📄 Document Upload</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Photos/Documents
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                />
                {formData.documents.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">Uploaded files:</p>
                    <ul className="text-sm text-gray-500">
                      {formData.documents.map((file, index) => (
                        <li key={index}>• {file.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                rows="3"
                placeholder="Enter any additional notes or observations..."
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'Creating Batch...' : 'Create Genesis Batch'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateGenesisBatchForm
