const { ethers } = require("ethers");

async function deployToSepolia() {
  console.log("🚀 Direct Sepolia Deployment...");
  
  // Your configuration
  const privateKey = "0793017b71117f3fb1f39ee1e12d2903b2ab5fa724569fe0a4b4cdbf41781d0e";
  const rpcUrl = "https://eth-sepolia.g.alchemy.com/v2/DJUiC4SBERpSdIXNvIzuC";
  
  try {
    // Create provider and wallet
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    
    console.log("📝 Deploying with account:", wallet.address);
    
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    console.log("💰 Balance:", ethers.formatEther(balance), "ETH");
    
    if (balance < ethers.parseEther("0.005")) {
      console.log("⚠️ Low balance! Get Sepolia ETH from faucet.");
      return;
    }
    
    // Contract bytecode and ABI (you'll need to compile first)
    console.log("📦 Deploying contract...");
    
    // For now, let's just test the connection
    const blockNumber = await provider.getBlockNumber();
    console.log("✅ Connected to Sepolia! Current block:", blockNumber);
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

deployToSepolia();
