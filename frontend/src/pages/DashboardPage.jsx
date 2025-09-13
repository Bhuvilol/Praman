import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import CreateGenesisBatchForm from '../components/CreateGenesisBatchForm'
import SendBatchForm from '../components/SendBatchForm'
import ReceiveBatchForm from '../components/ReceiveBatchForm'
import web3Service from '../utils/web3Service'

function DashboardPage() {
  const { roleId } = useParams()
  const navigate = useNavigate()
  const walletAddress = localStorage.getItem('walletAddress')
  
  const [user, setUser] = useState(null)
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateBatch, setShowCreateBatch] = useState(false)
  const [showSendBatch, setShowSendBatch] = useState(false)
  const [showReceiveBatch, setShowReceiveBatch] = useState(false)

  // Role configurations
  const roleConfig = {
    farmer: { 
      emoji: '🌾', 
      title: 'Farmer', 
      canCreateGenesis: true,
      canSend: true,
      canReceive: false
    },
    collector: { 
      emoji: '📋', 
      title: 'Collector', 
      canCreateGenesis: false,
      canSend: true,
      canReceive: true
    },
    lab: { 
      emoji: '🔬', 
      title: 'Lab Inspector', 
      canCreateGenesis: false,
      canSend: true,
      canReceive: true
    },
    supplier: { 
      emoji: '📦', 
      title: 'Supplier', 
      canCreateGenesis: false,
      canSend: true,
      canReceive: true
    },
    distributor: { 
      emoji: '🚚', 
      title: 'Distributor', 
      canCreateGenesis: false,
      canSend: true,
      canReceive: true
    },
    retailer: { 
      emoji: '🏪', 
      title: 'Retailer', 
      canCreateGenesis: false,
      canSend: true,
      canReceive: true
    }
  }

  const currentRole = roleConfig[roleId] || roleConfig.farmer

  useEffect(() => {
    loadUserData()
  }, [walletAddress])

  const loadUserData = async () => {
    try {
      console.log('🔍 DashboardPage: Loading user data for:', walletAddress)
      
      // Initialize Web3 service
      await web3Service.initialize()
      
      // Check if user is registered on blockchain
      const isRegistered = await web3Service.isUserRegistered(walletAddress)
      console.log('🔍 DashboardPage: isUserRegistered result:', isRegistered)
      
      if (isRegistered) {
        // Get user details from blockchain
        const blockchainUser = await web3Service.getUser(walletAddress)
        console.log('🔍 DashboardPage: blockchain user data:', blockchainUser)
        
        if (blockchainUser && blockchainUser.exists) {
          // Convert blockchain user data to expected format
          const userData = {
            id: blockchainUser.regdNo,
            name: blockchainUser.name,
            email: blockchainUser.email,
            regd_no: blockchainUser.regdNo,
            role: blockchainUser.role,
            wallet_address: blockchainUser.walletAddress
          }
          
          setUser(userData)
          console.log('✅ DashboardPage: User data set from blockchain:', userData)
          
          // Get user batches from blockchain
          try {
            const allBatches = await web3Service.getAllBatches()
            // Filter batches for this user - show all batches they're involved with
            let userBatches = allBatches.filter(batch => {
              const userRegdNo = blockchainUser.regdNo
              
              // For collectors, show batches they have received or are supposed to receive
              if (blockchainUser.role === 'collector') {
                return (
                  // Batch is in transit and this collector is the next actor
                  (batch.status === 'in_transit' && batch.nextActor === userRegdNo) ||
                  // Batch was sent by this collector
                  batch.previousActor === userRegdNo ||
                  // Batch is currently held by this collector
                  batch.currentHolder === userRegdNo
                )
              }
              
              // For farmers, show batches they created or are involved with
              if (blockchainUser.role === 'farmer') {
                return (
                  // Created by user
                  batch.regdNo === userRegdNo ||
                  // Sent by user (previous actor)
                  batch.previousActor === userRegdNo ||
                  // User is in the supply chain history (if we track that)
                  (batch.supplyChainHistory && batch.supplyChainHistory.includes(userRegdNo)) ||
                  // User is the current owner (if we track that)
                  batch.currentOwner === userRegdNo
                )
              }
              
              // For collectors, show batches they have received or are supposed to receive
              if (blockchainUser.role === 'collector') {
                return (
                  // Batch is in transit and this collector is the next actor
                  (batch.status === 'in_transit' && batch.nextActor === userRegdNo) ||
                  // Batch was sent by this collector
                  batch.previousActor === userRegdNo ||
                  // Batch is currently held by this collector
                  batch.currentHolder === userRegdNo
                )
              }
              
              // For lab, supplier, distributor, retailer - show batches they can receive or have received
              if (['lab', 'supplier', 'distributor', 'retailer', 'consumer'].includes(blockchainUser.role)) {
                return (
                  // Batch is in transit and this user is the next actor
                  (batch.status === 'in_transit' && batch.nextActor === userRegdNo) ||
                  // Batch was sent by this user
                  batch.previousActor === userRegdNo ||
                  // Batch is currently held by this user
                  batch.currentHolder === userRegdNo
                )
              }
              
              // Fallback for any other roles
              return (
                // Created by user
                batch.regdNo === userRegdNo ||
                // Sent by user (previous actor)
                batch.previousActor === userRegdNo ||
                // Received by user (next actor)
                batch.nextActor === userRegdNo ||
                // User is in the supply chain history (if we track that)
                (batch.supplyChainHistory && batch.supplyChainHistory.includes(userRegdNo)) ||
                // User is the current owner (if we track that)
                batch.currentOwner === userRegdNo
              )
            })
            
            // If no batches found with specific filtering, show all batches for farmers
            // (since farmers create genesis batches and should see all their creations)
            if (userBatches.length === 0 && blockchainUser.role === 'farmer') {
              console.log('🔍 No specific batches found, showing all batches for farmer')
              userBatches = allBatches
            }
            setBatches(userBatches)
            console.log('✅ DashboardPage: User batches loaded:', userBatches.length)
            console.log('🔍 DashboardPage: Batch data structure:', userBatches)
          } catch (batchError) {
            console.error('Error loading batches:', batchError)
            setBatches([])
          }
        } else {
          console.error('❌ DashboardPage: User data is invalid')
          setUser(null)
        }
      } else {
        console.log('❌ DashboardPage: User is not registered on blockchain')
        setUser(null)
      }
    } catch (error) {
      console.error('❌ DashboardPage: Error loading user data:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBatch = async (batchData) => {
    try {
      console.log('🔍 Creating genesis batch on blockchain:', batchData)
      
      // Initialize Web3 service
      await web3Service.initialize()
      
      // Prepare blockchain transaction data with proper type conversion
      const blockchainData = {
        batchId: batchData.batchId,
        cropName: batchData.cropInfo.name,
        quantity: parseInt(batchData.cropInfo.quantity) || 0,
        variant: batchData.cropInfo.variant,
        condition: batchData.cropInfo.condition,
        contaminationLevel: batchData.cropInfo.contaminationLevel,
        latitude: Math.round(parseFloat(batchData.location.latitude) * 1000000), // Convert to integer (6 decimal places)
        longitude: Math.round(parseFloat(batchData.location.longitude) * 1000000), // Convert to integer (6 decimal places)
        location: batchData.location.address || 'Origin',
        rainfall: parseInt(batchData.weather.rainfall.replace(/[^\d]/g, '')) || 0, // Remove non-digits
        humidity: parseInt(batchData.weather.humidity.replace(/[^\d]/g, '')) || 0, // Remove non-digits
        temperature: parseInt(batchData.weather.temperature.replace(/[^\d]/g, '')) || 0, // Remove non-digits
        windSpeed: parseInt(batchData.weather.windSpeed.replace(/[^\d]/g, '')) || 0, // Remove non-digits
        pressure: parseInt(batchData.weather.pressure.replace(/[^\d]/g, '')) || 0, // Remove non-digits
        signatureHash: batchData.blockchain.signatureHash
      }
      
      console.log('🔍 Blockchain transaction data:', blockchainData)
      
      // Call blockchain contract
      const result = await web3Service.sendContractTransaction('createGenesisBatch', [
        blockchainData.batchId,
        blockchainData.cropName,
        blockchainData.quantity,
        blockchainData.variant,
        blockchainData.condition,
        blockchainData.contaminationLevel,
        blockchainData.latitude,
        blockchainData.longitude,
        blockchainData.location,
        blockchainData.rainfall,
        blockchainData.humidity,
        blockchainData.temperature,
        blockchainData.windSpeed,
        blockchainData.pressure,
        blockchainData.signatureHash
      ])
      
      if (result) {
        console.log('✅ Genesis batch created on blockchain:', result.transactionHash)
        
        // Update local batches list
        const newBatch = {
          ...batchData,
          transactionHash: result.transactionHash,
          blockNumber: result.blockNumber,
          status: 'created',
          supplyChainStage: 'genesis'
        }
        
        setBatches([...batches, newBatch])
        alert(`Genesis batch created successfully!\nTransaction: ${result.transactionHash}`)
      } else {
        throw new Error('Blockchain transaction failed')
      }
    } catch (error) {
      console.error('❌ Error creating genesis batch:', error)
      alert(`Failed to create genesis batch: ${error.message}`)
    }
  }

  const handleSendBatch = async (batchData) => {
    try {
      console.log('🔍 Sending batch on blockchain:', batchData)
      
      // Initialize Web3 service
      await web3Service.initialize()
      
      // Validate role interaction before sending
      const currentUserRole = user?.role?.toLowerCase()
      const recipientRole = batchData.recipientInfo.role?.toLowerCase()
      
      const validRoleInteractions = {
        'farmer': ['collector', 'supplier'],
        'collector': ['lab', 'supplier'],
        'lab': ['supplier', 'distributor'],
        'supplier': ['distributor', 'retailer'],
        'distributor': ['retailer', 'consumer'],
        'retailer': ['consumer'],
        'consumer': []
      }
      
      const canSend = validRoleInteractions[currentUserRole]?.includes(recipientRole)
      
      if (!canSend) {
        const validRoles = validRoleInteractions[currentUserRole] || []
        throw new Error(`Invalid role interaction: ${currentUserRole} cannot send to ${recipientRole}. Valid recipients: ${validRoles.join(', ')}`)
      }
      
      // Call blockchain contract to send batch
      const result = await web3Service.sendContractTransaction('sendBatch', [
        batchData.selectedBatch, // batchId
        batchData.recipientInfo.regdNo, // recipientRegdNo
        batchData.transportInfo?.method || 'Truck', // transportMethod
        batchData.blockchain?.signatureHash || '0x' + 'b'.repeat(64) // newSignatureHash
      ])
      
      if (result) {
        console.log('✅ Batch sent on blockchain:', result.transactionHash)
        
        // Reload batches from blockchain
        loadUserData()
        alert(`Batch sent successfully!\nTransaction: ${result.transactionHash}`)
      } else {
        throw new Error('Blockchain transaction failed')
      }
    } catch (error) {
      console.error('❌ Error sending batch:', error)
      
      // Provide more specific error messages
      let errorMessage = error.message
      if (error.message.includes('Invalid role interaction')) {
        errorMessage = `❌ Role Restriction: ${error.message}`
      } else if (error.message.includes('Internal JSON-RPC error')) {
        errorMessage = '❌ Transaction failed: This is likely due to role restrictions or invalid parameters. Please check the recipient role and try again.'
      }
      
      alert(`Failed to send batch: ${errorMessage}`)
    }
  }

  const handleReceiveBatch = async (batchData) => {
    try {
      console.log('🔍 Receiving batch on blockchain:', batchData)
      
      // Initialize Web3 service
      await web3Service.initialize()
      
      // Convert qualityCheck object to string if it's an object
      let qualityCheckString = 'Quality check passed'
      if (batchData.qualityCheck) {
        if (typeof batchData.qualityCheck === 'object') {
          qualityCheckString = JSON.stringify(batchData.qualityCheck)
        } else {
          qualityCheckString = batchData.qualityCheck
        }
      }
      
      // Call blockchain contract to receive batch
      const result = await web3Service.sendContractTransaction('receiveBatch', [
        batchData.selectedBatch || batchData.batchId, // batchId
        qualityCheckString, // qualityCheck (must be string)
        batchData.blockchain?.signatureHash || '0x' + 'c'.repeat(64) // newSignatureHash
      ])
      
      if (result) {
        console.log('✅ Batch received on blockchain:', result.transactionHash)
        
        // Reload batches from blockchain
        loadUserData()
        alert(`Batch received successfully!\nTransaction: ${result.transactionHash}`)
      } else {
        throw new Error('Blockchain transaction failed')
      }
    } catch (error) {
      console.error('❌ Error receiving batch:', error)
      alert(`Failed to receive batch: ${error.message}`)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">User not found. Please register first.</p>
          <button
            onClick={() => navigate('/contributor')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 px-12 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-black text-gray-900 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
              {currentRole.emoji} {currentRole.title} Dashboard
            </h1>
            <p className="text-gray-600">Welcome back, {user.name}!</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
          >
            ← Back to Home
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Section 1: User Details */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              👤 User Details
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p className="text-lg font-semibold text-gray-900">{user.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-lg font-semibold text-gray-900">{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Registration ID</label>
                <p className="text-lg font-semibold text-emerald-600">{user.regd_no}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Role</label>
                <p className="text-lg font-semibold text-gray-900">{currentRole.title}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Wallet Address</label>
                <p className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Member Since</label>
                <p className="text-sm text-gray-600">
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Batch Statistics */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              📊 Batch Statistics
            </h2>
            <div className="space-y-4">
              <div className="text-center p-4 bg-emerald-50 rounded-lg">
                <div className="text-3xl font-bold text-emerald-600">{batches.length}</div>
                <div className="text-sm text-gray-600">
                  {currentRole.canCreateGenesis ? 'Total Batches Created' : 'Total Batches Involved'}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-xl font-bold text-blue-600">
                    {batches.filter(b => b.status === 'created').length}
                  </div>
                  <div className="text-xs text-gray-600">Created</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-xl font-bold text-yellow-600">
                    {batches.filter(b => b.status === 'in_transit').length}
                  </div>
                  <div className="text-xs text-gray-600">In Transit</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-xl font-bold text-green-600">
                    {batches.filter(b => b.status === 'received').length}
                  </div>
                  <div className="text-xs text-gray-600">Received</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-xl font-bold text-purple-600">
                    {batches.filter(b => b.status === 'completed').length}
                  </div>
                  <div className="text-xs text-gray-600">Completed</div>
                </div>
              </div>

              {batches.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Recent Batches</h3>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {batches.slice(0, 3).map((batch, index) => (
                      <div key={batch.batchId || batch.id || index} className="text-xs p-2 bg-gray-50 rounded">
                        <div className="font-medium">{batch.cropName || batch.name || 'Unknown Crop'}</div>
                        <div className="text-gray-500">{batch.batchId || batch.batch_id || 'No ID'}</div>
                        <div className="text-gray-400 text-xs">{batch.status || 'Unknown Status'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Action Tools */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              🛠️ Action Tools
            </h2>
            <div className="space-y-3">
              {currentRole.canCreateGenesis && (
                <button
                  onClick={() => setShowCreateBatch(true)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  🌱 Create Genesis Batch
                </button>
              )}
              
              {currentRole.canReceive && (
                <button
                  onClick={() => setShowReceiveBatch(true)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  📥 Receive Batch
                </button>
              )}
              
              {currentRole.canSend && (
                <button
                  onClick={() => setShowSendBatch(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  📤 Send Batch
                </button>
              )}
            </div>

            {/* Quick Stats */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Stats</h3>
              <div className="text-xs text-gray-600 space-y-1">
                <div>Active Batches: {batches.filter(b => b.status !== 'completed').length}</div>
                <div>Completed: {batches.filter(b => b.status === 'completed').length}</div>
                <div>Success Rate: {batches.length > 0 ? Math.round((batches.filter(b => b.status === 'completed').length / batches.length) * 100) : 0}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Forms */}
        {showCreateBatch && (
          <CreateGenesisBatchForm
            user={user}
            onClose={() => setShowCreateBatch(false)}
            onSubmit={handleCreateBatch}
          />
        )}

        {showSendBatch && (
          <SendBatchForm
            user={user}
            batches={batches}
            onClose={() => setShowSendBatch(false)}
            onSubmit={handleSendBatch}
          />
        )}

        {showReceiveBatch && (
          <ReceiveBatchForm
            user={user}
            onClose={() => setShowReceiveBatch(false)}
            onSubmit={handleReceiveBatch}
          />
        )}
      </div>
    </div>
  )
}

export default DashboardPage