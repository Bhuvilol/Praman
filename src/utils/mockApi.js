// Mock API for Database-Free Operation
import localDB from './localStorage.js';

// Simulate API endpoints using local storage
const mockApi = {
  // Check if user exists
  async checkUser(walletAddress) {
    try {
      console.log(`Checking user existence for wallet: ${walletAddress}`);
      const result = localDB.checkUserExists(walletAddress);
      console.log(`User exists: ${result.exists}`);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return {
        exists: result.exists,
        user: result.user
      };
    } catch (error) {
      console.error('Error checking user:', error);
      throw error;
    }
  },

  // Get user count by role
  async getUserCount(roleId) {
    try {
      console.log(`Getting user count for role: ${roleId}`);
      const count = localDB.getUserCount(roleId);
      console.log(`User count for ${roleId}: ${count}`);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      return { count };
    } catch (error) {
      console.error('Error getting user count:', error);
      throw error;
    }
  },

  // Register new user
  async registerUser(userData) {
    try {
      console.log(`Registering new user: ${userData.name} (${userData.role})`);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const result = localDB.registerUser(userData);
      console.log(`User registered successfully: ${result.user.regd_no}`);
      
      return result;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  },

  // Get all users (for admin/testing)
  async getAllUsers() {
    try {
      const users = localDB.getAllUsers();
      await new Promise(resolve => setTimeout(resolve, 200));
      return { users };
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  },

  // Clear all data
  async clearAllData() {
    try {
      localDB.clearAllData();
      await new Promise(resolve => setTimeout(resolve, 100));
      return { success: true, message: 'All data cleared' };
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  },

  // Export data
  async exportData() {
    try {
      const data = localDB.exportData();
      return { success: true, data };
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  },

  // Import data
  async importData(data) {
    try {
      localDB.importData(data);
      return { success: true, message: 'Data imported successfully' };
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  },

  // Batch Management
  // Get user batches
  async getUserBatches(userId) {
    try {
      const batches = localDB.getUserBatches(userId);
      await new Promise(resolve => setTimeout(resolve, 200));
      return { success: true, batches };
    } catch (error) {
      console.error('Error getting user batches:', error);
      throw error;
    }
  },

  // Create new batch
  async createBatch(batchData) {
    try {
      const result = localDB.createBatch(batchData);
      await new Promise(resolve => setTimeout(resolve, 300));
      return result;
    } catch (error) {
      console.error('Error creating batch:', error);
      throw error;
    }
  },

  // Update batch status
  async updateBatchStatus(batchId, newStatus, location = null) {
    try {
      const result = localDB.updateBatchStatus(batchId, newStatus, location);
      await new Promise(resolve => setTimeout(resolve, 200));
      return result;
    } catch (error) {
      console.error('Error updating batch status:', error);
      throw error;
    }
  }
};

// Intercept fetch requests for our mock API endpoints
const originalFetch = window.fetch;
window.fetch = async (url, options) => {
  // Handle our API endpoints
  if (url.startsWith('/api/users/check/')) {
    const walletAddress = url.split('/').pop();
    const result = await mockApi.checkUser(walletAddress);
    return new Response(JSON.stringify(result), { status: 200 });
  } 
  else if (url.startsWith('/api/users/count/')) {
    const roleId = url.split('/').pop();
    const result = await mockApi.getUserCount(roleId);
    return new Response(JSON.stringify(result), { status: 200 });
  } 
  else if (url === '/api/users/register') {
    const userData = JSON.parse(options.body);
    const result = await mockApi.registerUser(userData);
    return new Response(JSON.stringify(result), { status: 201 });
  }
  else if (url === '/api/users/all') {
    const result = await mockApi.getAllUsers();
    return new Response(JSON.stringify(result), { status: 200 });
  }
  else if (url === '/api/users/clear') {
    const result = await mockApi.clearAllData();
    return new Response(JSON.stringify(result), { status: 200 });
  }
  else if (url === '/api/users/export') {
    const result = await mockApi.exportData();
    return new Response(JSON.stringify(result), { status: 200 });
  }
  else if (url === '/api/users/import') {
    const data = JSON.parse(options.body);
    const result = await mockApi.importData(data);
    return new Response(JSON.stringify(result), { status: 200 });
  }
  else if (url.startsWith('/api/batches/user/')) {
    const userId = url.split('/').pop();
    const result = await mockApi.getUserBatches(userId);
    return new Response(JSON.stringify(result), { status: 200 });
  }
  else if (url === '/api/batches/create') {
    const batchData = JSON.parse(options.body);
    const result = await mockApi.createBatch(batchData);
    return new Response(JSON.stringify(result), { status: 201 });
  }
  else if (url.startsWith('/api/batches/update/')) {
    const batchId = url.split('/').pop();
    const { status, location } = JSON.parse(options.body);
    const result = await mockApi.updateBatchStatus(batchId, status, location);
    return new Response(JSON.stringify(result), { status: 200 });
  }
  
  // For any other requests, use the original fetch
  return originalFetch(url, options);
};

console.log('🗄️ Local Storage Database loaded. No external database required!');

export default mockApi;
