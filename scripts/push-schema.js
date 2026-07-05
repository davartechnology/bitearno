require('dotenv').config();
const { Pool } = require('pg');

async function pushSchema() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  const schemaSQL = `
-- Users table
CREATE TABLE IF NOT EXISTS "users" (
  id TEXT PRIMARY KEY DEFAULT cuuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password TEXT,
  "emailVerified" TIMESTAMP,
  "verificationToken" TEXT,
  "resetToken" TEXT,
  "resetTokenExpiry" TIMESTAMP,
  "balanceBtc" REAL DEFAULT 0,
  "balanceLtc" REAL DEFAULT 0,
  "balanceDoge" REAL DEFAULT 0,
  "xp" INTEGER DEFAULT 0,
  "level" INTEGER DEFAULT 1,
  "referralCode" TEXT UNIQUE,
  "referredBy" TEXT,
  "isBanned" BOOLEAN DEFAULT false,
  "isSuspended" BOOLEAN DEFAULT false,
  "isVerified" BOOLEAN DEFAULT false,
  "lastIp" TEXT,
  fingerprint TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  "lastLoginAt" TIMESTAMP
);

-- Claims table
CREATE TABLE IF NOT EXISTS "claims" (
  id TEXT PRIMARY KEY DEFAULT cuuid(),
  "userId" TEXT NOT NULL REFERENCES "users"(id),
  amount REAL NOT NULL,
  currency TEXT DEFAULT 'BTC',
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "claimedAt" TIMESTAMP DEFAULT NOW()
);

-- Shortlinks table
CREATE TABLE IF NOT EXISTS "shortlinks" (
  id TEXT PRIMARY KEY DEFAULT cuuid(),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  reward REAL NOT NULL,
  currency TEXT DEFAULT 'BTC',
  "visitsRequired" INTEGER DEFAULT 1,
  "totalVisits" INTEGER DEFAULT 0,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Shortlink visits table
CREATE TABLE IF NOT EXISTS "shortlink_visits" (
  id TEXT PRIMARY KEY DEFAULT cuuid(),
  "userId" TEXT NOT NULL REFERENCES "users"(id),
  "shortlinkId" TEXT NOT NULL REFERENCES "shortlinks"(id),
  "ipAddress" TEXT,
  completed BOOLEAN DEFAULT false,
  "visitedAt" TIMESTAMP DEFAULT NOW()
);

-- Withdrawals table
CREATE TABLE IF NOT EXISTS "withdrawals" (
  id TEXT PRIMARY KEY DEFAULT cuuid(),
  "userId" TEXT NOT NULL REFERENCES "users"(id),
  amount REAL NOT NULL,
  currency TEXT NOT NULL,
  address TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  "txHash" TEXT,
  fee REAL DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "processedAt" TIMESTAMP
);

-- Referral earnings table
CREATE TABLE IF NOT EXISTS "referral_earnings" (
  id TEXT PRIMARY KEY DEFAULT cuuid(),
  "referrerId" TEXT NOT NULL REFERENCES "users"(id),
  "referredId" TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT DEFAULT 'BTC',
  source TEXT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Daily bonuses table
CREATE TABLE IF NOT EXISTS "daily_bonuses" (
  id TEXT PRIMARY KEY DEFAULT cuuid(),
  "userId" TEXT UNIQUE NOT NULL REFERENCES "users"(id),
  streak INTEGER DEFAULT 0,
  "lastClaim" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Fraud flags table
CREATE TABLE IF NOT EXISTS "fraud_flags" (
  id TEXT PRIMARY KEY DEFAULT cuuid(),
  "userId" TEXT NOT NULL REFERENCES "users"(id),
  reason TEXT NOT NULL,
  "ipAddress" TEXT,
  fingerprint TEXT,
  resolved BOOLEAN DEFAULT false,
  "flaggedAt" TIMESTAMP DEFAULT NOW()
);

-- Faucet config table
CREATE TABLE IF NOT EXISTS "faucet_config" (
  id TEXT PRIMARY KEY DEFAULT cuuid(),
  "rewardMin" REAL DEFAULT 0.00000050,
  "rewardMax" REAL DEFAULT 0.00000200,
  "timerMinutes" INTEGER DEFAULT 60,
  currency TEXT DEFAULT 'BTC',
  "isActive" BOOLEAN DEFAULT true,
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Admin logs table
CREATE TABLE IF NOT EXISTS "admin_logs" (
  id TEXT PRIMARY KEY DEFAULT cuuid(),
  "adminId" TEXT NOT NULL,
  action TEXT NOT NULL,
  "targetUserId" TEXT,
  details TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW()
);
  `;

  try {
    await pool.query(schemaSQL);
    console.log('✅ Schema pushed successfully!');
    
    // Verify tables
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('\n📋 Tables created:');
    result.rows.forEach(row => console.log(`  - ${row.table_name}`));
    
  } catch (error) {
    console.error('❌ Error:', error.message || error);
  } finally {
    await pool.end();
  }
}

pushSchema();
