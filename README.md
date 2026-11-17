# Aloka – Web3-Based Education Aid Distribution Platform

Platform distribusi bantuan pendidikan berbasis Web3 untuk meningkatkan transparansi, akuntabilitas, dan keamanan penyaluran dana bantuan pendidikan (Program Indonesia Pintar / PIP) dengan arsitektur **Hybrid Web2–Web3**.

Dana bantuan dikunci dalam **Smart Contract Escrow** on-chain, diverifikasi secara berjenjang oleh pihak sekolah, dan diklaim langsung oleh siswa/wali murid ke wallet Web3 tanpa perantara fisik untuk mengeliminasi pemotongan dana dan pencairan fiktif.

---

## 🏛️ Arsitektur Sistem

Aloka mengintegrasikan smart contract terdesentralisasi dengan backend REST API terproteksi:

- **Smart Contracts (Foundry / Solidity):**
  - Mengelola vault dana bantuan (`AlokaEscrow.sol`).
  - Token reward/dana bantuan simulasi Rupiah (`MockIDR.sol` - ERC-20).
  - Validasi multi-role: Pemerintah (Deployer/Funder), Sekolah (Validator), Siswa (Beneficiary).
- **Backend Service (Express.js / Prisma / Ethers.js v6):**
  - Autentikasi Web3 via **Sign-In with Ethereum (SIWE / EIP-4361)** dengan validasi single-use nonce.
  - Multi-tenant & IDOR protection untuk akses data sekolah dan siswa.
  - Nonce manager (`ethers.NonceManager`) untuk mencegah bentrok nonce transaksi paralel ke blockchain.
  - Background event listener sinkronisasi status on-chain dengan checkpoint block tracking (`EventSyncState`) dan deduplikasi audit logs.
  - Refresh token rotation & server-side token revocation.

---

## 📁 Struktur Repositori

```text
.
├── backend/                        # Backend REST API Service
│   ├── abi/                        # ABI Smart Contract (AlokaEscrow & MockIDR)
│   ├── prisma/                     # Schema database off-chain & seed scripts
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src/
│   │   ├── config/                 # Konfigurasi env, database, & blockchain signers
│   │   ├── controllers/            # Controller HTTP (Auth, Application, School, Blockchain)
│   │   ├── middleware/             # JWT auth, error handler, Zod request validator
│   │   ├── routes/                 # Route definition per domain
│   │   ├── schemas/                # Skema validasi Zod
│   │   ├── services/               # Core business logic & blockchain service
│   │   ├── utils/                  # Logger Winston, response helper, hash utilities
│   │   ├── app.js                  # Express app setup
│   │   └── server.js               # Entry point server & graceful shutdown
│   ├── test/                       # Unit & security slice tests
│   └── package.json
├── src/                            # Solidity Smart Contracts
│   ├── AlokaEscrow.sol             # Smart Contract Escrow utama
│   └── MockIDR.sol                 # Token ERC-20 Mock Rupiah
├── script/                         # Script Deployment Foundry
│   └── DeployAlokaEscrow.s.sol
├── test/                           # Smart Contract Unit Tests (Forge)
│   ├── AlokaEscrow.t.sol
│   └── MockIDR.t.sol
├── foundry.toml                    # Konfigurasi Foundry
├── PRD.md                          # Product Requirements Document
└── README.md
```

---

## ⛓️ Smart Contracts & Deployment

Jaringan Target: **Polygon Amoy Testnet (Chain ID: 80002)**

| Kontrak | Alamat Terverifikasi | Explorer |
| :--- | :--- | :--- |
| **AlokaEscrow** | `0xd938a4d1e8de7bd0eebe7fba0fbff4fc29154601` | [Lihat di Polygonscan](https://amoy.polygonscan.com/address/0xd938a4d1e8de7bd0eebe7fba0fbff4fc29154601) |
| **MockIDR** | `0xf7CDC1cc0a689585B7E9c25E29319Cd4B73e0Ad2` | [Lihat di Polygonscan](https://amoy.polygonscan.com/address/0xf7CDC1cc0a689585B7E9c25E29319Cd4B73e0Ad2) |

### Siklus Status Pengajuan (`AlokaEscrow`)
1. `BelumAda` (0)
2. `MenungguVerifikasi` (1)
3. `Terverifikasi` (2)
4. `Ditolak` (3)
5. `Tersalurkan` (4)

---

## 🚀 Panduan Memulai (Quick Start)

### 1. Prasyarat
- [Node.js](https://nodejs.org/) v18+ & npm
- [Foundry](https://book.getfoundry.sh/getting-started/installation) (opsional, untuk kompilasi contract)
- Database PostgreSQL (lokal atau cloud seperti Supabase)

---

### 2. Setup Smart Contracts (Foundry)

```bash
# Clone repository
git clone https://github.com/WhyNotKumara/Aloka.git
cd Aloka

# Kompilasi smart contract
forge build

# Menjalankan test smart contract
forge test
```

---

### 3. Setup Backend Service

Masuk ke direktori backend:

```bash
cd backend
```

Salin file environment:

```bash
cp .env.example .env
```

Lengkapi konfigurasi di `.env`:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://user:password@localhost:5432/aloka_db?schema=public"

JWT_SECRET="your_jwt_secret"
JWT_REFRESH_SECRET="your_jwt_refresh_secret"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

POLYGON_AMOY_RPC_URL="https://rpc-amoy.polygon.technology"
ESCROW_CONTRACT_ADDRESS="0xd938a4d1e8de7bd0eebe7fba0fbff4fc29154601"
MOCK_IDR_CONTRACT_ADDRESS="0xf7CDC1cc0a689585B7E9c25E29319Cd4B73e0Ad2"

GOVERNMENT_PRIVATE_KEY="0x..."
SCHOOL_PRIVATE_KEY="0x..."
```

Install dependensi & siapkan database:

```bash
# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Sinkronkan skema ke database
npx prisma db push

# (Opsional) Jalankan data seeding
node prisma/seed.js
```

Jalankan server pengembangan:

```bash
npm run dev
```

Server berjalan di `http://localhost:5000`.

---

## 🧪 Testing Backend

Menjalankan security unit test:

```bash
npm test
```

Test mencakup:
- Validasi single-use SIWE nonce (EIP-4361).
- Deterministic hashing untuk refresh token.
- Role-based multi-tenant authorization.

---

## 🛡️ Ringkasan API Endpoints

### 🔐 Authentication (`/api/auth`)
- `GET /api/auth/nonce` - Generate SIWE nonce dengan expiration.
- `POST /api/auth/verify` - Verifikasi signature EIP-4361 & penerbitan token.
- `POST /api/auth/refresh` - Refresh access token dengan rotation token.
- `POST /api/auth/logout` - Revokasi refresh token dari database.
- `GET /api/auth/me` - Ambil profil pengguna terautentikasi.

### 📝 Pengajuan Bantuan (`/api/applications`)
- `POST /api/applications` - Siswa membuat permohonan bantuan.
- `GET /api/applications` - Daftar permohonan (terisolasi per role).
- `GET /api/applications/:id` - Detail permohonan.
- `POST /api/applications/:id/submit-onchain` - Inisiasi pencatatan pengajuan ke smart contract.

### 🏫 Verifikasi Sekolah (`/api/school`)
- `GET /api/school/applications` - Daftar siswa sekolah yang perlu verifikasi.
- `PATCH /api/school/applications/:id/verify` - Verifikasi kelayakan administratif siswa.
- `PATCH /api/school/applications/:id/reject` - Tolak kelayakan siswa dengan catatan alasan.

### ⛓️ Blockchain Operations (`/api/blockchain`)
- `POST /api/blockchain/verify` - Eksekusi verifikasi on-chain oleh signer sekolah.
- `POST /api/blockchain/reject` - Eksekusi penolakan on-chain oleh signer sekolah.
- `POST /api/blockchain/claim` - Eksekusi klaim bantuan on-chain oleh siswa penerima.
- `GET /api/blockchain/status/:applicationId` - Periksa status terkini langsung dari smart contract.

### 🌐 Data Publik & Transparansi (`/api/public`)
- `GET /api/public/summary` - Metrik agregat bantuan tersalurkan, total penerima, dan dana aktif.
- `GET /api/public/schools` - Daftar sekolah terdaftar sebagai validator sah.
- `GET /api/public/ledger` - Log audit publik dan riwayat transaksi on-chain.
