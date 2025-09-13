import React, { useState, useEffect } from 'react'
import { 
  getWeatherData, 
  getLocationData, 
  generateSignatureHash, 
  generateTransactionHash, 
  generateBlockNumber,
  getCurrentTimestamp,
  getWalletAddress
} from '../utils/apiServices'

function ReceiveBatchForm({ user, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    batchId: '',
    senderInfo: {
      name: '',
      role: '',
      regdNo: '',
      email: ''
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
    qualityCheck: {
      condition: '',
      contaminationLevel: '',
      weight: '',
      temperature: '',
      humidity: '',
      notes: ''
    },
    documents: [],
    notes: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

        // Get location data
        const locationData = await getLocationData()
        
        // Get weather data
        const weatherData = await getWeatherData(locationData.latitude, locationData.longitude)
        
        // Generate blockchain data
        const timestamp = getCurrentTimestamp()
        const signatureHash = generateSignatureHash({
          action: 'receive_batch',
          timestamp,
          receiver: user?.regd_no,
          location: locationData
        })
        
        const transactionHash = generateTransactionHash(
          'SENDER_ADDRESS', // Will be updated when sender info is filled
          getWalletAddress(),
          'BATCH_ID', // Will be updated when batch ID is entered
          timestamp
        )
        
        const blockNumber = await generateBlockNumber()
        
        setFormData(prev => ({
          ...prev,
          location: locationData,
          weather: weatherData,
          blockchain: {
            signatureHash,
            transactionHash,
            blockNumber
          }
        }))
        
      } catch (error) {
        console.error('Error initializing form:', error)
        setError(error.message)
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
      // Update transaction hash with actual sender and batch info
      const timestamp = getCurrentTimestamp()
      const updatedTransactionHash = generateTransactionHash(
        formData.senderInfo.regdNo || 'UNKNOWN',
        getWalletAddress(),
        formData.batchId,
        timestamp
      )

      const batchData = {
        ...formData,
        status: 'received',
        received_at: new Date().toISOString(),
        supplyChainStage: 'received',
        previousActor: formData.senderInfo.regdNo,
        nextActor: null, // Will be set when sent to next actor
        blockchain: {
          ...formData.blockchain,
          transactionHash: updatedTransactionHash
        }
      }
      
      onSubmit(batchData)
      onClose()
    } catch (error) {
      console.error('Error receiving batch:', error)
      setError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
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
            <h2 className="text-3xl font-bold text-gray-900">📥 Receive Batch</h2>
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
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📦 Batch Information</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Batch ID *
                </label>
                <input
                  type="text"
                  value={formData.batchId}
                  onChange={(e) => setFormData(prev => ({ ...prev, batchId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter the batch ID to receive"
                  required
                />
              </div>
            </div>

            {/* Sender Information */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">👤 Sender Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sender Name *
                  </label>
                  <input
                    type="text"
                    value={formData.senderInfo.name}
                    onChange={(e) => handleInputChange('senderInfo', 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter sender name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sender Role *
                  </label>
                  <input
                    type="text"
                    value={formData.senderInfo.role}
                    onChange={(e) => handleInputChange('senderInfo', 'role', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter sender role"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Registration ID
                  </label>
                  <input
                    type="text"
                    value={formData.senderInfo.regdNo}
                    onChange={(e) => handleInputChange('senderInfo', 'regdNo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter registration ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.senderInfo.email}
                    onChange={(e) => handleInputChange('senderInfo', 'email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter email address"
                  />
                </div>
              </div>
            </div>

            {/* Quality Check */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🔍 Quality Check</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Condition *
                  </label>
                  <select
                    value={formData.qualityCheck.condition}
                    onChange={(e) => handleInputChange('qualityCheck', 'condition', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    required
                  >
                    <option value="">Select condition</option>
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
                    value={formData.qualityCheck.contaminationLevel}
                    onChange={(e) => handleInputChange('qualityCheck', 'contaminationLevel', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    required
                  >
                    <option value="">Select level</option>
                    {contaminationOptions.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.qualityCheck.weight}
                    onChange={(e) => handleInputChange('qualityCheck', 'weight', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    placeholder="Enter weight"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Temperature (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.qualityCheck.temperature}
                    onChange={(e) => handleInputChange('qualityCheck', 'temperature', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    placeholder="Enter temperature"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Humidity (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.qualityCheck.humidity}
                    onChange={(e) => handleInputChange('qualityCheck', 'humidity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    placeholder="Enter humidity"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quality Notes
                  </label>
                  <textarea
                    value={formData.qualityCheck.notes}
                    onChange={(e) => handleInputChange('qualityCheck', 'notes', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    rows="2"
                    placeholder="Quality assessment notes"
                  />
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📍 Receiving Location (Auto-filled)</h3>
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
                  Upload Receiving Documents
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                rows="3"
                placeholder="Enter any additional notes or observations..."
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'Receiving Batch...' : 'Receive Batch'}
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

export default ReceiveBatchForm
