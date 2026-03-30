# Q-Chain: Quantum-Resistant Blockchain

A cutting-edge blockchain application built with post-quantum cryptography, featuring CRYSTALS-Dilithium (ML-DSA-65) signatures, AES-256-GCM encryption, and SHA3-512 block hashing.

## 🔐 Features

### Post-Quantum Cryptography
- **Dilithium3 (ML-DSA-65)**: Digital signature algorithm resistant to quantum computer attacks
- **SHA3-512**: Cryptographic hashing for block validation
- **AES-256-GCM**: Symmetric encryption for transaction data privacy

### Blockchain Features
- **Proof-of-Work (PoW)**: Difficulty-3 mining with SHA3-512 hashing
- **Automatic Key Generation**: Users receive auto-generated Dilithium keypairs on registration
- **Transaction Signing**: All transactions signed with Dilithium3
- **Encrypted Transactions**: Optional transaction notes encrypted end-to-end
- **Chain Validation**: Full blockchain validation with cryptographic verification

### User Experience
- **Session-Based Authentication**: Secure login with bcrypt password hashing
- **Token System**: Start with 100 QDLT tokens, earn 10 QDLT per block mined
- **User Balances**: Real-time balance tracking stored in PostgreSQL
- **Transaction Explorer**: View all transactions in the blockchain
- **Mining Pool**: Participate in securing the network and earning rewards

## 🏗️ Architecture

```
/artifacts
  ├── api-server/              # Express.js backend
  │   └── src/
  │       ├── routes/
  │       │   ├── auth.ts      # Authentication (register/login/logout)
  │       │   ├── blockchain.ts # Blockchain & mining endpoints
  │       │   └── users.ts     # User lookup & balance endpoints
  │       └── lib/
  │           └── dilithium.ts # Post-quantum crypto utilities
  └── quantum-blockchain/      # React + Vite frontend
      └── src/
          ├── pages/
          │   ├── home.tsx        # Landing page
          │   ├── auth.tsx        # Login/Register
          │   ├── dashboard.tsx   # Network status
          │   ├── wallet.tsx      # Send tokens
          │   ├── key-generator.tsx # View keys & activity
          │   ├── explorer.tsx    # Blockchain explorer
          │   └── mining.tsx      # Mining interface
          ├── context/
          │   └── auth-context.tsx # User session state
          └── components/         # UI components
```

## 🚀 Getting Started

### Prerequisites
- Node.js 24+
- pnpm (package manager)
- PostgreSQL database

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
# Create .env file with DATABASE_URL and SESSION_SECRET

# Start the development server
pnpm dev
```

### Running Services
The application consists of three services:

1. **API Server** (Express)
   ```bash
   pnpm --filter @workspace/api-server run dev
   ```

2. **Frontend** (React + Vite)
   ```bash
   pnpm --filter @workspace/quantum-blockchain run dev
   ```

3. **Component Preview** (Design System)
   ```bash
   pnpm --filter @workspace/mockup-sandbox run dev
   ```

## 📋 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  public_key TEXT NOT NULL,
  public_key_hash TEXT UNIQUE,  -- SHA-256 fingerprint for indexing
  private_key TEXT NOT NULL,
  balance NUMERIC(18,6) DEFAULT 100,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Blocks Table
```sql
CREATE TABLE blocks (
  id SERIAL PRIMARY KEY,
  index INTEGER NOT NULL UNIQUE,
  hash TEXT NOT NULL,
  previous_hash TEXT NOT NULL,
  nonce INTEGER NOT NULL,
  miner_address TEXT NOT NULL,
  miner_username TEXT,
  transactions JSONB NOT NULL,
  timestamp TIMESTAMP NOT NULL
);
```

### Pending Transactions Table
```sql
CREATE TABLE pending_transactions (
  id TEXT PRIMARY KEY,
  sender TEXT NOT NULL,
  sender_username TEXT,
  recipient TEXT NOT NULL,
  recipient_username TEXT,
  amount TEXT NOT NULL,
  signature TEXT NOT NULL,
  encrypted_data TEXT,
  timestamp TIMESTAMP NOT NULL,
  verified INTEGER DEFAULT 1
);
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Sign in with username/password
- `POST /api/auth/logout` - Sign out and destroy session
- `GET /api/auth/me` - Get current user profile

### Blockchain
- `GET /api/blockchain` - Get full chain
- `GET /api/blockchain/validate` - Validate chain integrity
- `POST /api/blockchain/mine` - Mine a new block (requires auth)

### Transactions
- `GET /api/transactions/pending` - View pending transaction pool
- `POST /api/transactions/submit` - Submit new transaction (requires auth)

### Users
- `GET /api/users` - List all users with balances
- `GET /api/users/:publicKey/balance` - Get specific user balance

## 💻 Frontend Pages

### Home
- Landing page with blockchain description
- Login and Sign Up buttons
- Feature overview and how it works guide

### Login / Register
- Cyberpunk-themed authentication forms
- Username validation (3-32 chars, alphanumeric + underscore)
- Password requirements (minimum 6 chars)
- Auto-redirects to dashboard on success

### Dashboard
- Network status overview
- Block height and pending transactions
- Current user balance and operator identifier
- Chain validation button
- Dilithium security information

### Send QDLT
- Recipient selection from user list
- Amount and optional note input
- Real-time balance updates
- Transaction ID confirmation

### My Wallet
- Display public key (Dilithium3)
- Current balance
- Recent transaction history
- Quantum core visualization

### Blockchain Explorer
- Complete blockchain view
- Transaction details with sender/recipient names
- Block hash and proof-of-work verification
- Chronological transaction history

### Mining Pool
- Mempool status (pending transactions count)
- Mining reward display (10 QDLT)
- Real-time PoW solver simulation
- Block result terminal output

## 🔐 Security Features

1. **Password Security**: bcrypt hashing (12 rounds)
2. **Session Management**: Express-session with PostgreSQL store
3. **Cryptocurrency**: Post-quantum Dilithium3 signatures
4. **Encryption**: AES-256-GCM for transaction metadata
5. **Deterministic Hashing**: Stable JSON stringify for consistent block validation
6. **Public Key Fingerprinting**: SHA-256 indexes for fast user lookups

## 📊 Technology Stack

- **Frontend**: React 18, Vite, TailwindCSS, Framer Motion
- **Backend**: Express.js, Drizzle ORM
- **Cryptography**: dilithium-crystals-js, crypto (Node.js)
- **Database**: PostgreSQL
- **API Generation**: Orval (OpenAPI → React Query)
- **State Management**: React Query, React Context

## 🧮 Cryptographic Parameters

| Parameter | Value |
|-----------|-------|
| Signature Algorithm | CRYSTALS-Dilithium3 (ML-DSA-65) |
| Hash Algorithm | SHA3-512 |
| Block Encryption | AES-256-GCM |
| Password Hashing | bcrypt (12 rounds) |
| Mining Difficulty | 3 leading zeros |
| Mining Reward | 10 QDLT |
| Initial Balance | 100 QDLT |
| Key Exchange | Session-based (bcrypt verified) |

## 🎯 User Flow

1. **Registration**
   - User provides username and password
   - Dilithium3 keypair auto-generated
   - Account created with 100 QDLT starting balance
   - Private key stored encrypted in database

2. **Token Transfer**
   - Sender selects recipient from user list
   - Amount and optional note specified
   - Transaction payload built and Dilithium-signed
   - Note encrypted with AES-256-GCM
   - Transaction added to pending pool

3. **Mining**
   - Miner collects pending transactions
   - Includes coinbase reward transaction (10 QDLT)
   - Performs PoW: incrementing nonce until hash meets difficulty
   - Block appended to chain
   - Pending transactions cleared
   - Miner receives 10 QDLT reward
   - All recipient balances updated

4. **Validation**
   - Each block hash verified (SHA3-512)
   - Previous hash pointer validated
   - All transaction signatures verified (Dilithium3)
   - PoW target confirmed (3 leading zeros)

## 📝 Environment Variables

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/qchain
SESSION_SECRET=your-secret-key-here
NODE_ENV=development
```

## 🧪 Testing

### Full End-to-End Test
```bash
# Register two users (alice, bob)
# Alice sends 25 QDLT to Bob
# Bob mines block confirming transaction
# Check balances are updated correctly
# Validate blockchain passes cryptographic verification
```

## 🚀 Deployment

The application is ready for production deployment:

1. **Build**
   ```bash
   pnpm build
   ```

2. **Environment Setup**
   - Set DATABASE_URL in production environment
   - Generate secure SESSION_SECRET
   - Configure CORS if needed

3. **Database**
   - PostgreSQL with proper backups
   - Enable SSL connections
   - Regular maintenance

## ⚠️ Important Notes

- **Quantum Future-Ready**: Dilithium3 is NIST-standardized (FIPS 204) for quantum resistance
- **Not for Production Transactions**: This is an educational blockchain demonstrating post-quantum cryptography
- **Private Key Storage**: Private keys are stored in database (encrypted by bcrypt). Consider key management solutions for production
- **Hash Determinism**: Blockchain hashing uses stable JSON stringification to ensure validation consistency

## 📚 References

- [CRYSTALS-Dilithium Specification](https://pq-crystals.org/dilithium/)
- [NIST Post-Quantum Cryptography](https://csrc.nist.gov/projects/post-quantum-cryptography/)
- [SHA-3 Standard](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.202.pdf)
- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)

## 📄 License

MIT License - feel free to use, modify, and distribute

## 🤝 Contributing

Contributions welcome! Please follow these guidelines:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request with clear descriptions

---

**Built with quantum-resistant cryptography for a post-quantum secure future.** 🔐⚛️
