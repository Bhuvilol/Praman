# Vercel Deployment Guide

## Prerequisites
- GitHub repository with your code pushed
- Vercel account (free tier available)

## Deployment Steps

### 1. Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign in with your GitHub account
3. Click "New Project"
4. Import your GitHub repository

### 2. Configure Build Settings
Vercel will auto-detect this as a Vite project. Use these settings:

- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3. Environment Variables (Optional)
If you want to make the contract address configurable, add these in Vercel dashboard:

```
VITE_CONTRACT_ADDRESS=0x507067CCA9941B9A8E42aB237a7797600aDA0358
VITE_NETWORK_NAME=Sepolia Testnet
VITE_NETWORK_ID=11155111
```

### 4. Deploy
Click "Deploy" and wait for the build to complete.

## Important Notes

### Contract Configuration
- Your contract is deployed at: `0x507067CCA9941B9A8E42aB237a7797600aDA0358`
- Network: Sepolia Testnet
- Users need MetaMask connected to Sepolia to interact

### RPC Endpoints
The app uses these public RPC endpoints:
- `https://ethereum-sepolia.publicnode.com`
- `https://sepolia.drpc.org`
- `https://rpc.sepolia.org`

### User Requirements
- Users must have MetaMask installed
- Users must be connected to Sepolia testnet
- Users need Sepolia ETH for gas fees

## Testing the Deployment
1. Visit your Vercel URL
2. Connect MetaMask to Sepolia
3. Try registering a user
4. Test the supply chain functionality

## Troubleshooting
- If build fails, check the build logs in Vercel dashboard
- Ensure all dependencies are in package.json
- Check that the frontend directory structure is correct
