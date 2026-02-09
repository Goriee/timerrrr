import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// MySQL connection pool configuration
const poolConfig: mysql.PoolOptions = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'user',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'test_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: 'Z'
};

// Add SSL configuration if CA certificate is provided
if (process.env.DB_CA_CERT) {
  poolConfig.ssl = {
    ca: process.env.DB_CA_CERT
  };
} else if (process.env.DB_CA_CERT_PATH) {
  poolConfig.ssl = {
    ca: fs.readFileSync(path.resolve(process.env.DB_CA_CERT_PATH))
  };
} else {
  // For development/testing: accept self-signed certificates
  // WARNING: Only use this for local testing, never in production!
  poolConfig.ssl = {
    rejectUnauthorized: false
  };
}

const pool = mysql.createPool(poolConfig);

export default pool;
