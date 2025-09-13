// Local Storage Database Simulation
class LocalStorageDB {
  constructor() {
    this.storageKey = 'praman_users';
    this.initializeStorage();
  }

  // Initialize storage with empty data
  initializeStorage() {
    if (!localStorage.getItem(this.storageKey)) {
      localStorage.setItem(this.storageKey, JSON.stringify({
        users: [],
        batches: [],
        counters: {
          farmer: 0,
          collector: 0,
          lab: 0,
          supplier: 0,
          distributor: 0,
          retailer: 0
        }
      }));
    }
  }

  // Get all data
  getData() {
    return JSON.parse(localStorage.getItem(this.storageKey));
  }

  // Save data
  saveData(data) {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  // Check if user exists
  checkUserExists(walletAddress) {
    const data = this.getData();
    const user = data.users.find(u => u.wallet_address === walletAddress);
    return {
      exists: !!user,
      user: user || null
    };
  }

  // Get user count by role
  getUserCount(role) {
    const data = this.getData();
    return data.counters[role] || 0;
  }

  // Register new user
  registerUser(userData) {
    const data = this.getData();
    
    // Check if user already exists
    if (data.users.some(u => u.wallet_address === userData.walletAddress)) {
      throw new Error('User already exists');
    }

    // Generate registration number
    const role = userData.role;
    const count = data.counters[role] + 1;
    const prefixes = {
      farmer: 'FRM',
      collector: 'COL',
      lab: 'LAB',
      supplier: 'SUP',
      distributor: 'DIS',
      retailer: 'RET'
    };
    
    const regdNo = `${prefixes[role]}${String(count).padStart(3, '0')}`;
    
    // Create new user
    const newUser = {
      id: Date.now(), // Simple ID generation
      wallet_address: userData.walletAddress,
      role: userData.role,
      name: userData.name,
      email: userData.email,
      regd_no: regdNo,
      created_at: new Date().toISOString()
    };

    // Add user and update counter
    data.users.push(newUser);
    data.counters[role] = count;
    
    this.saveData(data);
    
    return {
      success: true,
      user: newUser
    };
  }

  // Get all users
  getAllUsers() {
    const data = this.getData();
    return data.users;
  }

  // Clear all data
  clearAllData() {
    localStorage.removeItem(this.storageKey);
    this.initializeStorage();
  }

  // Reset and fix corrupted data
  resetData() {
    console.log('Resetting localStorage data...');
    this.clearAllData();
    console.log('LocalStorage data reset complete');
  }

  // Export data (for backup)
  exportData() {
    return this.getData();
  }

  // Import data (for restore)
  importData(data) {
    this.saveData(data);
  }

  // Batch Management Methods
  // Get batches for a specific user
  getUserBatches(userId) {
    const data = this.getData();
    // Ensure batches array exists
    if (!data.batches || !Array.isArray(data.batches)) {
      console.warn('Batches array not found, initializing...');
      data.batches = [];
      this.saveData(data);
    }
    return data.batches.filter(batch => batch.owner_id === userId);
  }

  // Create new batch
  createBatch(batchData) {
    const data = this.getData();
    // Ensure batches array exists
    if (!data.batches || !Array.isArray(data.batches)) {
      console.warn('Batches array not found, initializing...');
      data.batches = [];
    }
    
    const newBatch = {
      id: Date.now(),
      owner_id: batchData.ownerId,
      batch_id: batchData.batchId,
      name: batchData.name,
      description: batchData.description,
      status: batchData.status || 'created', // created, in_transit, received, completed
      created_at: new Date().toISOString(),
      current_location: batchData.currentLocation || 'Origin',
      metadata: batchData.metadata || {}
    };

    data.batches.push(newBatch);
    this.saveData(data);
    
    return {
      success: true,
      batch: newBatch
    };
  }

  // Update batch status
  updateBatchStatus(batchId, newStatus, location = null) {
    const data = this.getData();
    // Ensure batches array exists
    if (!data.batches || !Array.isArray(data.batches)) {
      console.warn('Batches array not found, initializing...');
      data.batches = [];
      this.saveData(data);
      return { success: false, message: 'No batches found' };
    }
    
    const batchIndex = data.batches.findIndex(batch => batch.id === batchId);
    
    if (batchIndex !== -1) {
      data.batches[batchIndex].status = newStatus;
      if (location) {
        data.batches[batchIndex].current_location = location;
      }
      data.batches[batchIndex].updated_at = new Date().toISOString();
      this.saveData(data);
      
      return {
        success: true,
        batch: data.batches[batchIndex]
      };
    }
    
    return {
      success: false,
      message: 'Batch not found'
    };
  }

  // Get all batches
  getAllBatches() {
    const data = this.getData();
    // Ensure batches array exists
    if (!data.batches || !Array.isArray(data.batches)) {
      console.warn('Batches array not found, initializing...');
      data.batches = [];
      this.saveData(data);
    }
    return data.batches;
  }

  // Get batch by ID
  getBatchById(batchId) {
    const data = this.getData();
    // Ensure batches array exists
    if (!data.batches || !Array.isArray(data.batches)) {
      console.warn('Batches array not found, initializing...');
      data.batches = [];
      this.saveData(data);
    }
    return data.batches.find(batch => batch.id === batchId);
  }
}

// Create singleton instance
const localDB = new LocalStorageDB();

export default localDB;
