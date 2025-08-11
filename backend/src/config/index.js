import 'dotenv/config';

const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 8000,
  
  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },

  blockchain: {
    nodeUrl: process.env.BLOCKCHAIN_NODE_URL || 'http://127.0.0.1:8545',
    privateKey: process.env.BACKEND_WALLET_PRIVATE_KEY,
    contractAddress: process.env.CONTRACT_ADDRESS,
  },
};

export default config;