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

function SendBatchForm({ user, batches, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    selectedBatch: '',
    recipientInfo: {
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
    transportInfo: {
      method: '',
      trackingNumber: '',
      estimatedDelivery: '',
      specialInstructions: ''
    },
    documents: [],
    notes: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const transportMethods = [
    'Road Transport', 'Rail Transport', 'Air Cargo', 'Sea Freight', 
    'Courier Service', 'Cold Chain Transport', 'Express Delivery'
  ]

  // Get valid recipient roles based on current user's role
  const getValidRecipientRoles = (userRole) => {
    const roleMapping = {
      'farmer': ['collector', 'supplier'],
      'collector': ['lab', 'supplier'],
      'lab': ['supplier', 'distributor'],
      'supplier': ['distributor', 'retailer'],
      'distributor': ['retailer', 'consumer'],
      'retailer': ['consumer'],
      'consumer': []
    }
    
    return roleMapping[userRole?.toLowerCase()] || []
  }

  const recipientRoles = getValidRecipientRoles(user?.role)

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
        
        // Check if wallet is connected
        const walletAddress = getWalletAddress()
        console.log('🔗 Wallet connected for send:', walletAddress)

        // Generate blockchain data
        const timestamp = getCurrentTimestamp()
        const signatureHash = generateSignatureHash({
          action: 'send_batch',
          timestamp,
          sender: user?.regd_no,
          location: locationData
        })
        
        const transactionHash = generateTransactionHash(
          walletAddress,
          'RECIPIENT_ADDRESS', // Will be updated when recipient is selected
          'BATCH_ID', // Will be updated when batch is selected
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
      // Update transaction hash with actual recipient and batch info
      const selectedBatch = batches.find(b => (b.id || b.batchId).toString() === formData.selectedBatch)
      if (!selectedBatch) {
        throw new Error('Selected batch not found')
      }

      const timestamp = getCurrentTimestamp()
      const updatedTransactionHash = generateTransactionHash(
        getWalletAddress(),
        formData.recipientInfo.regdNo || 'UNKNOWN',
        selectedBatch.batch_id,
        timestamp
      )

      const batchData = {
        ...formData,
        status: 'in_transit',
        sent_at: new Date().toISOString(),
        supplyChainStage: 'in_transit',
        previousActor: user?.regd_no,
        nextActor: formData.recipientInfo.regdNo,
        blockchain: {
          ...formData.blockchain,
          transactionHash: updatedTransactionHash
        }
      }
      
      onSubmit(batchData)
      onClose()
    } catch (error) {
      console.error('Error sending batch:', error)
      setError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const availableBatches = batches.filter(batch => 
    batch.status === 'created' || batch.status === 'received'
  )

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
            <h2 className="text-3xl font-bold text-gray-900">📤 Send Batch</h2>
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
            {/* Select Batch */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📦 Select Batch to Send</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Batches *
                </label>
                <select
                  value={formData.selectedBatch}
                  onChange={(e) => setFormData(prev => ({ ...prev, selectedBatch: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select a batch to send</option>
                  {availableBatches.map(batch => (
                    <option key={batch.id || batch.batchId || batch.batch_id} value={batch.id || batch.batchId || batch.batch_id}>
                      {batch.name || batch.cropInfo?.name || 'Unknown'} - {batch.batch_id || batch.batchId} ({batch.status})
                    </option>
                  ))}
                </select>
                {availableBatches.length === 0 && (
                  <p className="text-sm text-red-600 mt-2">
                    No available batches to send. Create or receive a batch first.
                  </p>
                )}
              </div>
            </div>

            {/* Recipient Information */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">👤 Recipient Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient Name *
                  </label>
                  <input
                    type="text"
                    value={formData.recipientInfo.name}
                    onChange={(e) => handleInputChange('recipientInfo', 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter recipient name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient Role *
                  </label>
                  <select
                    value={formData.recipientInfo.role}
                    onChange={(e) => handleInputChange('recipientInfo', 'role', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    <option value="">Select recipient role</option>
                    {recipientRoles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                  {recipientRoles.length === 0 && (
                    <p className="text-red-500 text-sm mt-1">
                      ⚠️ Your role ({user?.role}) cannot send batches to other roles.
                    </p>
                  )}
                  {recipientRoles.length > 0 && (
                    <p className="text-green-600 text-sm mt-1">
                      ✅ You can send to: {recipientRoles.join(', ')}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Registration ID
                  </label>
                  <input
                    type="text"
                    value={formData.recipientInfo.regdNo}
                    onChange={(e) => handleInputChange('recipientInfo', 'regdNo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter registration ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.recipientInfo.email}
                    onChange={(e) => handleInputChange('recipientInfo', 'email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter email address"
                  />
                </div>
              </div>
            </div>

            {/* Transport Information */}
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🚚 Transport Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transport Method *
                  </label>
                  <select
                    value={formData.transportInfo.method}
                    onChange={(e) => handleInputChange('transportInfo', 'method', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  >
                    <option value="">Select transport method</option>
                    {transportMethods.map(method => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tracking Number
                  </label>
                  <input
                    type="text"
                    value={formData.transportInfo.trackingNumber}
                    onChange={(e) => handleInputChange('transportInfo', 'trackingNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter tracking number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Delivery
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.transportInfo.estimatedDelivery}
                    onChange={(e) => handleInputChange('transportInfo', 'estimatedDelivery', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Instructions
                  </label>
                  <input
                    type="text"
                    value={formData.transportInfo.specialInstructions}
                    onChange={(e) => handleInputChange('transportInfo', 'specialInstructions', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Any special handling instructions"
                  />
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📍 Current Location (Auto-filled)</h3>
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
                  Upload Shipping Documents
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                placeholder="Enter any additional notes or special instructions..."
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting || availableBatches.length === 0}
                className={`flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors ${isSubmitting || availableBatches.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'Sending Batch...' : 'Send Batch'}
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

export default SendBatchForm
