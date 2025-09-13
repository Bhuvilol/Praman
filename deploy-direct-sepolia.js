const { ethers } = require("ethers");
const fs = require("fs");
const solc = require("solc");

async function deployToSepolia() {
    console.log("🚀 Direct Sepolia Deployment (No Remix needed)...");
    
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
        
        // Read and compile the contract
        console.log("📦 Reading contract source...");
        const contractSource = fs.readFileSync("PRAMANSupplyChain_Minimal.sol", "utf8");
        
        console.log("🔨 Compiling contract...");
        const input = {
            language: 'Solidity',
            sources: {
                'PRAMANSupplyChain.sol': {
                    content: contractSource
                }
            },
            settings: {
                outputSelection: {
                    '*': {
                        '*': ['*']
                    }
                },
                optimizer: {
                    enabled: true,
                    runs: 200
                },
                viaIR: true
            }
        };
        
        const output = JSON.parse(solc.compile(JSON.stringify(input)));
        
        if (output.errors) {
            console.log("❌ Compilation errors:");
            output.errors.forEach(error => {
                console.log(error.message);
            });
            return;
        }
        
        const contract = output.contracts['PRAMANSupplyChain.sol']['PRAMANSupplyChain'];
        const bytecode = contract.evm.bytecode.object;
        const abi = contract.abi;
        
        console.log("✅ Contract compiled successfully!");
        
        // Deploy the contract
        console.log("📤 Deploying contract to Sepolia...");
        const factory = new ethers.ContractFactory(abi, bytecode, wallet);
        
        const contractInstance = await factory.deploy({
            gasLimit: 5000000 // Set high gas limit for deployment
        });
        
        console.log("⏳ Waiting for deployment...");
        await contractInstance.waitForDeployment();
        
        const contractAddress = await contractInstance.getAddress();
        console.log("✅ Contract deployed successfully!");
        console.log("📍 Contract Address:", contractAddress);
        
        // Save contract details
        const deploymentInfo = {
            contractAddress: contractAddress,
            network: "sepolia",
            chainId: 11155111,
            deployer: wallet.address,
            deployedAt: new Date().toISOString(),
            transactionHash: contractInstance.deploymentTransaction().hash,
            abi: abi
        };
        
        fs.writeFileSync('SEPOLIA_DEPLOYMENT.json', JSON.stringify(deploymentInfo, null, 2));
        fs.writeFileSync('SEPOLIA_CONTRACT_ADDRESS.txt', contractAddress);
        fs.writeFileSync('SEPOLIA_ABI.json', JSON.stringify(abi, null, 2));
        
        console.log("📝 Contract details saved to:");
        console.log("  - SEPOLIA_DEPLOYMENT.json");
        console.log("  - SEPOLIA_CONTRACT_ADDRESS.txt");
        console.log("  - SEPOLIA_ABI.json");
        
        console.log("\n🔗 View on Etherscan:");
        console.log(`https://sepolia.etherscan.io/address/${contractAddress}`);
        
        // Test basic functionality
        console.log("\n🧪 Testing contract functionality...");
        try {
            const batchCount = await contractInstance.getBatchCount();
            const userCount = await contractInstance.getUserCount();
            console.log("✅ Contract is working!");
            console.log("📊 Initial Batch Count:", batchCount.toString());
            console.log("👥 Initial User Count:", userCount.toString());
        } catch (error) {
            console.log("⚠️ Contract deployed but test failed:", error.message);
        }
        
        console.log("\n🎉 Deployment completed successfully!");
        console.log("\n💡 Next steps:");
        console.log("1. Update your frontend with the contract address:", contractAddress);
        console.log("2. Update frontend/src/utils/web3Service.js");
        console.log("3. Update NEW_CONTRACT_ADDRESS.txt");
        console.log("4. Test the frontend on Sepolia!");
        
    } catch (error) {
        console.error("❌ Deployment failed:", error.message);
        if (error.message.includes("insufficient funds")) {
            console.log("💡 Get more Sepolia ETH from: https://sepoliafaucet.com/");
        }
    }
}

deployToSepolia();
