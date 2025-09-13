import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useToast } from '../contexts/ToastContext'
import web3Service from '../utils/web3Service'

function RegistrationPage() {
  const { roleId } = useParams()
  const navigate = useNavigate()
  const { showError, showSuccess, showWarning } = useToast()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    regdNo: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false)
  const [existingUser, setExistingUser] = useState(null)

  const roleNames = {
    farmer: 'Farmer',
    collector: 'Collector',
    lab: 'Lab (Quality Inspector)',
    supplier: 'Supplier',
    distributor: 'Distributor',
    retailer: 'Retailer'
  }

  const rolePrefixes = {
    farmer: 'FRM',
    collector: 'COL',
    lab: 'LAB',
    supplier: 'SUP',
    distributor: 'DIS',
    retailer: 'RET'
  }

  // Check for existing user and generate registration number
  useEffect(() => {
    const initializeRegistration = async () => {
      try {
        // Get wallet address from localStorage
        const walletAddress = localStorage.getItem('walletAddress')
        let isRegistered = false
        
        if (walletAddress) {
          // Initialize Web3 service
          await web3Service.initialize()
          
          // Check if user is already registered
          isRegistered = await web3Service.isUserRegistered(walletAddress)
          
          if (isRegistered) {
            // Get user details
            const user = await web3Service.getUser(walletAddress)
            if (user && user.exists) {
              const currentRole = user.role
              
              if (currentRole !== roleId) {
                // User is registered with a different role
                const shortAddress = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                showError(`Dear address ${shortAddress}, you are already registered as a "${currentRole}". Please login there instead of trying to register as a "${roleNames[roleId]}".`, 10000)
                // Redirect to contributor page after a short delay
                setTimeout(() => {
                  navigate('/contributor')
                }, 3000)
                return
              } else {
                // User is already registered with the same role - redirect to dashboard immediately
                setIsAlreadyRegistered(true)
                setExistingUser(user)
                showWarning(`You are already registered as a ${roleNames[roleId]} with ID ${user.regdNo}. Redirecting to dashboard...`)
                setTimeout(() => {
                  navigate(`/dashboard/${roleId}`)
                }, 2000)
                return
              }
            } else {
              // User mapping exists but user data is invalid, treat as new user
              console.warn('User mapping exists but user data is invalid, allowing registration')
            }
          }
        }

        // Only generate registration number for new users
        if (!isRegistered) {
          const generateRegdNo = async () => {
            try {
              console.log('🔍 Generating sequential registration number for role:', roleId)
              
              // Initialize Web3 service
              await web3Service.initialize()
              
              // Get all batches from blockchain to find existing registration numbers
              const allBatches = await web3Service.getAllBatches()
              console.log('🔍 All batches from blockchain:', allBatches.length)
              
              const rolePrefix = rolePrefixes[roleId]
              let maxRegdNo = 0
              
              // Find the highest existing registration number for this role
              for (const batch of allBatches) {
                if (batch.regdNo && batch.regdNo.startsWith(rolePrefix)) {
                  const regdNumber = parseInt(batch.regdNo.replace(rolePrefix, ''))
                  if (regdNumber > maxRegdNo) {
                    maxRegdNo = regdNumber
                  }
                }
              }
              
              // Generate the next sequential number
              const nextNumber = maxRegdNo + 1
              const regdNo = `${rolePrefix}${String(nextNumber).padStart(3, '0')}`
              
              console.log('🔍 Found max existing regd number:', maxRegdNo)
              console.log('🔍 Generated next sequential registration number:', regdNo)
              setFormData(prev => ({ ...prev, regdNo }))
              
            } catch (error) {
              console.error('Error generating registration number:', error)
              // If blockchain call fails, start with 001
              const regdNo = `${rolePrefixes[roleId]}001`
              setFormData(prev => ({ ...prev, regdNo }))
            }
          }

          generateRegdNo()
        }
      } catch (error) {
        console.error('Error initializing registration:', error)
        showError('Error checking user registration status. Please try again.')
      }
    }

    initializeRegistration()
  }, [roleId, navigate, showError, showWarning])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Get wallet address from localStorage
      const walletAddress = localStorage.getItem('walletAddress')
      
      if (!walletAddress) {
        showError('Wallet address not found. Please connect your wallet again.')
        navigate('/contributor')
        return
      }

      // Initialize Web3 service
      await web3Service.initialize()
      
      // Double-check if user is already registered (in case they bypassed the check)
      const isRegistered = await web3Service.isUserRegistered(walletAddress)
      
      if (isRegistered) {
        const user = await web3Service.getUser(walletAddress)
        if (user && user.exists) {
          const shortAddress = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
          showError(`Dear address ${shortAddress}, you are already registered as a "${user.role}". Please login there instead of trying to register again.`, 10000)
          // Redirect to contributor page after a short delay
          setTimeout(() => {
            navigate('/contributor')
          }, 3000)
          return
        }
      }

      // Register user on blockchain
      const contract = await web3Service.loadDeployedContract()
      
      // Send registration transaction
      const result = await web3Service.sendContractTransaction('registerUser', [
        formData.name,
        formData.email,
        formData.regdNo,
        roleId
      ])

      if (result) {
        showSuccess(`Registration successful! Welcome to PRAMAN as a ${roleNames[roleId]}.\nYour Registration ID: ${formData.regdNo}`)
        
        // Wait a moment for the transaction to be mined, then navigate
        setTimeout(() => {
          navigate(`/dashboard/${roleId}`)
        }, 2000)
      } else {
        throw new Error('Registration transaction failed')
      }
    } catch (error) {
      console.error('Registration error:', error)
      
      // Handle specific blockchain errors
      if (error.message.includes('User already registered')) {
        const walletAddress = localStorage.getItem('walletAddress')
        const shortAddress = walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'your address'
        showError(`Dear address ${shortAddress}, you are already registered. Please login with your existing role instead of trying to register again.`, 10000)
        setTimeout(() => {
          navigate('/contributor')
        }, 3000)
      } else if (error.message.includes('Registration number already exists')) {
        showError('This registration number is already taken. Please try again.')
      } else if (error.message.includes('Invalid role specified')) {
        showError('Invalid role specified. Please try again.')
      } else {
        showError(`Registration failed: ${error.message}. Please try again.`)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center px-12 py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium mb-4 flex items-center gap-2 mx-auto"
            >
              ← Back to Home
            </button>
            <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-wider" style={{ fontFamily: 'Nunito, -apple-system, BlinkMacSystemFont, sans-serif' }}>
              Complete Registration
            </h1>
            <p className="text-lg text-gray-600">
              Register as a {roleNames[roleId]} in the PRAMAN ecosystem
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            {isAlreadyRegistered && existingUser ? (
              <div className="text-center space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <div className="text-yellow-600 text-4xl mb-3">⚠️</div>
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                    Already Registered
                  </h3>
                  <p className="text-yellow-700 mb-4">
                    You are already registered as a <strong>{roleNames[roleId]}</strong> with ID <strong>{existingUser.regdNo}</strong>.
                  </p>
                  <p className="text-sm text-yellow-600">
                    Redirecting to your dashboard...
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/dashboard/${roleId}`)}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
                >
                  Go to Dashboard
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  placeholder="Enter your email address"
                />
              </div>

              {/* Registration Number (Read-only) */}
              <div>
                <label htmlFor="regdNo" className="block text-sm font-semibold text-gray-700 mb-2">
                  Registration Number
                </label>
                <input
                  type="text"
                  id="regdNo"
                  name="regdNo"
                  value={formData.regdNo}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This is your unique registration number for the {roleNames[roleId]} role
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'Registering...' : 'Complete Registration'}
              </button>
            </form>
            )}
          </div>
        </div>
    </div>
  )
}

export default RegistrationPage
