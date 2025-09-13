// Web3 Service for PRAMAN Blockchain Integration
import Web3 from 'web3'

class Web3Service {
  constructor() {
    this.web3 = null
    this.contract = null
    this.contractAddress = null
    this.contractABI = null
  }

  // Initialize Web3 connection
  async initialize() {
    try {
      if (typeof window.ethereum !== 'undefined') {
        // Use custom RPC provider instead of MetaMask's default
        // Try multiple RPC endpoints for better reliability
        const rpcEndpoints = [
          'https://ethereum-sepolia.publicnode.com',
          'https://sepolia.drpc.org',
          'https://rpc.sepolia.org'
        ]
        
        let web3Instance = null
        for (const rpcUrl of rpcEndpoints) {
          try {
            web3Instance = new Web3(rpcUrl)
            // Test the connection
            await web3Instance.eth.getBlockNumber()
            console.log(`✅ Using RPC endpoint: ${rpcUrl}`)
            break
          } catch (error) {
            console.log(`❌ RPC endpoint failed: ${rpcUrl}`)
            continue
          }
        }
        
        if (!web3Instance) {
          throw new Error('All RPC endpoints failed')
        }
        
        this.web3 = web3Instance
        
        // Still use MetaMask for account management
        this.web3.eth.accounts.wallet.clear()
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        if (accounts.length > 0) {
          this.web3.eth.defaultAccount = accounts[0]
        }
        
        // Check if MetaMask is on the correct network
        const chainId = await window.ethereum.request({ method: 'eth_chainId' })
        const sepoliaChainId = '0xaa36a7' // 11155111 in hex
        
        if (chainId !== sepoliaChainId) {
          console.warn('⚠️ MetaMask is not on Sepolia network. Current chain ID:', chainId)
          console.log('🔧 Please switch to Sepolia testnet in MetaMask')
        } else {
          console.log('✅ MetaMask is connected to Sepolia testnet')
        }
        
        console.log('✅ Web3 initialized with custom RPC and MetaMask accounts')
        return true
      } else {
        console.error('❌ MetaMask not detected')
        return false
      }
    } catch (error) {
      console.error('❌ Error initializing Web3:', error)
      return false
    }
  }

  // Get current account
  async getCurrentAccount() {
    try {
      if (!this.web3) {
        throw new Error('Web3 not initialized')
      }
      
      // Get account from MetaMask directly
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        return accounts[0] || null
      }
      
      return null
    } catch (error) {
      console.error('❌ Error getting current account:', error)
      return null
    }
  }

  // Get network ID
  async getNetworkId() {
    try {
      if (!this.web3) {
        throw new Error('Web3 not initialized')
      }
      
      return await this.web3.eth.net.getId()
    } catch (error) {
      console.error('❌ Error getting network ID:', error)
      return null
    }
  }

  // Get current block number
  async getCurrentBlockNumber() {
    try {
      if (!this.web3) {
        throw new Error('Web3 not initialized')
      }
      
      return await this.web3.eth.getBlockNumber()
    } catch (error) {
      console.error('❌ Error getting block number:', error)
      return null
    }
  }

  // Get balance
  async getBalance(address) {
    try {
      if (!this.web3) {
        throw new Error('Web3 not initialized')
      }
      
      const balance = await this.web3.eth.getBalance(address)
      return this.web3.utils.fromWei(balance, 'ether')
    } catch (error) {
      console.error('❌ Error getting balance:', error)
      return null
    }
  }

  // Generate transaction hash
  generateTransactionHash(from, to, data, nonce) {
    try {
      if (!this.web3) {
        throw new Error('Web3 not initialized')
      }
      
      const transaction = {
        from,
        to,
        data,
        nonce
      }
      
      return this.web3.utils.sha3(JSON.stringify(transaction))
    } catch (error) {
      console.error('❌ Error generating transaction hash:', error)
      return null
    }
  }

  // Sign message
  async signMessage(message, account) {
    try {
      if (!this.web3) {
        throw new Error('Web3 not initialized')
      }
      
      return await this.web3.eth.personal.sign(message, account)
    } catch (error) {
      console.error('❌ Error signing message:', error)
      return null
    }
  }

  // Verify signature
  async verifySignature(message, signature, account) {
    try {
      if (!this.web3) {
        throw new Error('Web3 not initialized')
      }
      
      const recoveredAccount = await this.web3.eth.personal.ecRecover(message, signature)
      return recoveredAccount.toLowerCase() === account.toLowerCase()
    } catch (error) {
      console.error('❌ Error verifying signature:', error)
      return false
    }
  }

  // Contract interaction methods for PRAMAN Supply Chain
  async deployContract(contractABI, contractBytecode, constructorArgs = []) {
    try {
      if (!this.web3) {
        throw new Error('Web3 not initialized')
      }
      
      const account = await this.getCurrentAccount()
      if (!account) {
        throw new Error('No account connected')
      }
      
      const contract = new this.web3.eth.Contract(contractABI)
      const deploy = contract.deploy({
        data: contractBytecode,
        arguments: constructorArgs
      })
      
      const deployedContract = await deploy.send({
        from: account,
        gas: 3000000
      })
      
      this.contract = deployedContract
      this.contractAddress = deployedContract.options.address
      this.contractABI = contractABI
      
      console.log('✅ Contract deployed at:', this.contractAddress)
      return deployedContract
    } catch (error) {
      console.error('❌ Error deploying contract:', error)
      return null
    }
  }

  // Load existing contract
  async loadContract(contractAddress, contractABI) {
    try {
      if (!this.web3) {
        throw new Error('Web3 not initialized')
      }
      
      this.contract = new this.web3.eth.Contract(contractABI, contractAddress)
      this.contractAddress = contractAddress
      this.contractABI = contractABI
      
      console.log('✅ Contract loaded at:', contractAddress)
      return this.contract
    } catch (error) {
      console.error('❌ Error loading contract:', error)
      return null
    }
  }

  // Call contract method (read-only)
  async callContractMethod(methodName, args = []) {
    try {
      if (!this.contract) {
        throw new Error('Contract not loaded')
      }
      
      return await this.contract.methods[methodName](...args).call()
    } catch (error) {
      console.error(`❌ Error calling contract method ${methodName}:`, error)
      return null
    }
  }

  // Send contract transaction
  async sendContractTransaction(methodName, args = [], options = {}) {
    try {
      if (!this.contract) {
        throw new Error('Contract not loaded')
      }
      
      const account = await this.getCurrentAccount()
      if (!account) {
        throw new Error('No account connected')
      }
      
      console.log(`🔄 Preparing transaction for ${methodName} with args:`, args)
      console.log(`👤 From account:`, account)
      
      // Ensure contract is properly loaded
      if (!this.contract) {
        await this.loadDeployedContract()
      }
      
      const transaction = this.contract.methods[methodName](...args)
      
      // Estimate gas with better error handling
      let gasEstimate
      try {
        gasEstimate = await transaction.estimateGas({ from: account })
        console.log(`⛽ Gas estimate:`, gasEstimate)
      } catch (gasError) {
        console.error(`❌ Gas estimation failed:`, gasError)
        // Use a default gas limit if estimation fails
        gasEstimate = BigInt(500000)
        console.log(`⚠️ Using default gas limit:`, gasEstimate)
      }
      
      // Add buffer to gas estimate (handle BigInt properly)
      const gasWithBuffer = gasEstimate + (gasEstimate / BigInt(5)) // Add 20% buffer
      
      // Use MetaMask for transaction signing
      const result = await transaction.send({
        from: account,
        gas: gasWithBuffer.toString(),
        gasPrice: '20000000000', // 20 gwei
        ...options
      })
      
      console.log(`✅ Transaction sent for ${methodName}:`, result.transactionHash)
      return result
    } catch (error) {
      console.error(`❌ Error sending contract transaction ${methodName}:`, error)
      
      // Provide more specific error information
      if (error.message && error.message.includes('Internal JSON-RPC error')) {
        console.error(`🔍 This is likely a contract revert. Check:`)
        console.error(`   - User permissions/role restrictions`)
        console.error(`   - Contract state requirements`)
        console.error(`   - Input parameter validation`)
      }
      
      throw error // Re-throw to let the calling code handle it
    }
  }

  // ===== BLOCKCHAIN FUNCTIONS (IMPLEMENTED FOR LOCAL BLOCKCHAIN) =====
  
  // Contract configuration for local blockchain
  CONTRACT_ADDRESS = "0x507067CCA9941B9A8E42aB237a7797600aDA0358"
  CONTRACT_ABI = [
    // Contract ABI will be loaded from artifacts
  ]

  // Load contract ABI from deployed contract
  async loadContractABI() {
    try {
      // Load the ABI from the deployed contract file
      const response = await fetch('/SEPOLIA_ABI.json')
      if (!response.ok) {
        throw new Error(`Failed to load contract ABI: ${response.status}`)
      }
      
      const abi = await response.json()
      this.CONTRACT_ABI = abi
      console.log('✅ Contract ABI loaded successfully from SEPOLIA_ABI.json')
    } catch (error) {
      console.error('❌ Error loading contract ABI:', error)
      // Fallback to hardcoded ABI if loading fails
      console.log('⚠️ Falling back to hardcoded ABI')
      this.CONTRACT_ABI = [
        {
          "inputs": [{"internalType": "string", "name": "_name", "type": "string"}, {"internalType": "string", "name": "_email", "type": "string"}, {"internalType": "string", "name": "_regdNo", "type": "string"}, {"internalType": "string", "name": "_role", "type": "string"}],
          "name": "registerUser",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [{"internalType": "address", "name": "_walletAddress", "type": "address"}],
          "name": "isUserRegistered",
          "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "getAllBatches",
          "outputs": [{"components": [{"internalType": "string", "name": "batchId", "type": "string"}, {"internalType": "string", "name": "regdNo", "type": "string"}, {"internalType": "string", "name": "cropName", "type": "string"}, {"internalType": "uint256", "name": "quantity", "type": "uint256"}, {"internalType": "string", "name": "variant", "type": "string"}, {"internalType": "string", "name": "condition", "type": "string"}, {"internalType": "string", "name": "contaminationLevel", "type": "string"}, {"internalType": "uint256", "name": "latitude", "type": "uint256"}, {"internalType": "uint256", "name": "longitude", "type": "uint256"}, {"internalType": "string", "name": "location", "type": "string"}, {"internalType": "uint256", "name": "rainfall", "type": "uint256"}, {"internalType": "uint256", "name": "humidity", "type": "uint256"}, {"internalType": "uint256", "name": "temperature", "type": "uint256"}, {"internalType": "uint256", "name": "windSpeed", "type": "uint256"}, {"internalType": "uint256", "name": "pressure", "type": "uint256"}, {"internalType": "string", "name": "signatureHash", "type": "string"}, {"internalType": "string", "name": "transactionHash", "type": "string"}, {"internalType": "uint256", "name": "blockNumber", "type": "uint256"}, {"internalType": "string", "name": "status", "type": "string"}, {"internalType": "string", "name": "supplyChainStage", "type": "string"}, {"internalType": "string", "name": "previousActor", "type": "string"}, {"internalType": "string", "name": "nextActor", "type": "string"}, {"internalType": "uint256", "name": "createdAt", "type": "uint256"}, {"internalType": "uint256", "name": "updatedAt", "type": "uint256"}, {"internalType": "bool", "name": "exists", "type": "bool"}], "internalType": "struct PRAMANSupplyChain.Batch[]", "name": "", "type": "tuple[]"}],
          "stateMutability": "view",
          "type": "function"
        }
      ]
    }
  }

  // Get contract instance for API services
  getContractInstance() {
    if (!this.contract) {
      throw new Error('Contract not loaded. Please load contract first.')
    }
    return this.contract
  }

  // Load the deployed contract
  async loadDeployedContract() {
    try {
      if (!this.web3) {
        throw new Error('Web3 not initialized')
      }
      
      await this.loadContractABI()
      
      // Create contract instance with MetaMask provider for transactions
      const metaMaskWeb3 = new Web3(window.ethereum)
      this.contract = new metaMaskWeb3.eth.Contract(this.CONTRACT_ABI, this.CONTRACT_ADDRESS)
      this.contractAddress = this.CONTRACT_ADDRESS
      
      console.log('✅ Deployed contract loaded at:', this.CONTRACT_ADDRESS)
      return this.contract
    } catch (error) {
      console.error('❌ Error loading deployed contract:', error)
      throw error
    }
  }

  // Get all batches from contract (using custom RPC for reading)
  async getAllBatches() {
    try {
      if (!this.web3) {
        throw new Error('Web3 not initialized')
      }
      
      await this.loadContractABI()
      
      // Create a read-only contract instance using custom RPC
      const readContract = new this.web3.eth.Contract(this.CONTRACT_ABI, this.CONTRACT_ADDRESS)
      return await readContract.methods.getAllBatches().call()
    } catch (error) {
      console.error(`❌ Error getting all batches:`, error)
      throw error
    }
  }

  // Get batch by ID
  async getBatch(batchId) {
    try {
      if (!this.contract) {
        await this.loadDeployedContract()
      }
      
      return await this.contract.methods.getBatch(batchId).call()
    } catch (error) {
      console.error(`❌ Error getting batch ${batchId}:`, error)
      throw error
    }
  }

  // Get user information
  async getUser(address) {
    try {
      if (!this.contract) {
        await this.loadDeployedContract()
      }
      
      return await this.contract.methods.getUser(address).call()
    } catch (error) {
      console.error(`❌ Error getting user ${address}:`, error)
      // Return null if user doesn't exist instead of throwing
      if (error.message && error.message.includes('User not found')) {
        return null
      }
      throw error
    }
  }

  // Check if user is registered (using custom RPC for reading)
  async isUserRegistered(address) {
    try {
      console.log('🔍 Web3Service: Checking registration for:', address)
      
      if (!this.web3) {
        throw new Error('Web3 not initialized')
      }
      
      await this.loadContractABI()
      
      // Create a read-only contract instance using custom RPC
      const readContract = new this.web3.eth.Contract(this.CONTRACT_ABI, this.CONTRACT_ADDRESS)
      const result = await readContract.methods.isUserRegistered(address).call()
      console.log('🔍 Web3Service: Raw result from contract:', result, typeof result)
      
      // Ensure we return a boolean value
      const booleanResult = Boolean(result)
      console.log('🔍 Web3Service: Boolean result:', booleanResult)
      return booleanResult
    } catch (error) {
      console.error(`❌ Error checking user registration ${address}:`, error)
      // If there's an error, assume user is not registered
      return false
    }
  }

  // ===== ROLE VALIDATION FUNCTIONS =====

  // Check if user can create genesis batches (only farmers)
  async canCreateGenesisBatch(userAddress) {
    try {
      if (!this.contract) {
        await this.loadDeployedContract()
      }
      
      return await this.contract.methods.canCreateGenesisBatch(userAddress).call()
    } catch (error) {
      console.error('❌ Error checking genesis batch creation permission:', error)
      return false
    }
  }

  // Check if user can send batches
  async canSendBatch(userAddress) {
    try {
      if (!this.contract) {
        await this.loadDeployedContract()
      }
      
      return await this.contract.methods.canSendBatch(userAddress).call()
    } catch (error) {
      console.error('❌ Error checking send batch permission:', error)
      return false
    }
  }

  // Check if user can receive batches
  async canReceiveBatch(userAddress) {
    try {
      if (!this.contract) {
        await this.loadDeployedContract()
      }
      
      return await this.contract.methods.canReceiveBatch(userAddress).call()
    } catch (error) {
      console.error('❌ Error checking receive batch permission:', error)
      return false
    }
  }

  // Get user role
  async getUserRole(userAddress) {
    try {
      if (!this.contract) {
        await this.loadDeployedContract()
      }
      
      return await this.contract.methods.getUserRole(userAddress).call()
    } catch (error) {
      console.error('❌ Error getting user role:', error)
      return null
    }
  }

  // Check if two roles can interact
  async canInteractWithRole(senderRole, recipientRole) {
    try {
      if (!this.contract) {
        await this.loadDeployedContract()
      }
      
      return await this.contract.methods.canInteractWithRole(senderRole, recipientRole).call()
    } catch (error) {
      console.error('❌ Error checking role interaction:', error)
      return false
    }
  }

  // Get all valid roles
  async getValidRoles() {
    try {
      if (!this.contract) {
        await this.loadDeployedContract()
      }
      
      return await this.contract.methods.getValidRoles().call()
    } catch (error) {
      console.error('❌ Error getting valid roles:', error)
      return []
    }
  }

  // Check if address is registered with different role
  async isAddressRegisteredWithDifferentRole(address, newRole) {
    try {
      if (!this.contract) {
        await this.loadDeployedContract()
      }
      
      return await this.contract.methods.isAddressRegisteredWithDifferentRole(address, newRole).call()
    } catch (error) {
      console.error('❌ Error checking role conflict:', error)
      return false
    }
  }

  // Get address by registration number
  async getAddressByRegdNo(regdNo) {
    try {
      if (!this.contract) {
        await this.loadDeployedContract()
      }
      
      return await this.contract.methods.getAddressByRegdNo(regdNo).call()
    } catch (error) {
      console.error('❌ Error getting address by registration number:', error)
      return null
    }
  }

  // Switch MetaMask to Sepolia network
  async switchToSepoliaNetwork() {
    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask not detected')
      }

      const sepoliaChainId = '0xaa36a7' // 11155111 in hex
      
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: sepoliaChainId }],
        })
        console.log('✅ Switched to Sepolia network')
        return true
      } catch (switchError) {
        // If the network doesn't exist, add it
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: sepoliaChainId,
                  chainName: 'Sepolia Test Network',
                  nativeCurrency: {
                    name: 'SepoliaETH',
                    symbol: 'SepoliaETH',
                    decimals: 18,
                  },
                  rpcUrls: ['https://ethereum-sepolia.publicnode.com'],
                  blockExplorerUrls: ['https://sepolia.etherscan.io'],
                },
              ],
            })
            console.log('✅ Added and switched to Sepolia network')
            return true
          } catch (addError) {
            console.error('❌ Error adding Sepolia network:', addError)
            return false
          }
        } else {
          console.error('❌ Error switching to Sepolia network:', switchError)
          return false
        }
      }
    } catch (error) {
      console.error('❌ Error switching network:', error)
      return false
    }
  }
}

// Create singleton instance
const web3Service = new Web3Service()

export default web3Service
