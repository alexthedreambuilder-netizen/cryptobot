# Crypto Bambozl'd - Invest with us!

A strategic idle investment platform where users earn returns through:
- **Patience**: The longer you don't modify your balance, the higher your bonus grows (max 2%)
- **Referral**: Invite friends for permanent bonuses
- **Daily Challenge**: Complete mini-games to unlock daily returns

## 🚀 Deploy on Railway

### 1. Create Railway Account
- Go to [railway.app](https://railway.app)
- Create account or login
- Connect your GitHub account

### 2. Create New Project
- Click "New Project"
- Choose "Deploy from GitHub repo"
- Select your repository

### 3. Add PostgreSQL
- In project dashboard, click "New"
- Select "Database" → "Add PostgreSQL"
- Railway will auto-generate `DATABASE_URL`

### 4. Configure Environment Variables
- Click on Next.js service
- Go to "Variables" tab
- Add:
```
DATABASE_URL=${{Postgres.DATABASE_URL}}  # Auto-filled
JWT_SECRET=your-super-secret-random-string-minimum-32-characters
```

### 5. Deploy
- Railway auto-deploys on every push to main
- Or click "Deploy" in dashboard

### 6. Admin Setup
After first deploy:
1. Visit `https://<app-url>/setup`
2. Admin is created **AUTOMATICALLY** with credentials:
   - **Username:** `bamboleo1121`
   - **Password:** `bamboleo1212`
3. Login at `https://<app-url>/login`

---

## 🎮 Features

### Investment Levels
| Level | Balance | Active Referrals | Return/Day |
|-------|---------|------------------|------------|
| 0     | $0      | 0                | 0%         |
| 1     | $1      | 0                | 3.4%       |
| 2     | $250    | 2                | 5.1%       |
| 3     | $500    | 4                | 5.8%       |
| 4     | $1,200  | 6                | 6.3%       |

### Referral Bonus (per active referral)
- LvL 1: +0.05%
- LvL 2: +0.07%
- LvL 3: +0.08%
- LvL 4: +0.10%
- **Max 10 active referrals** for bonus

### Mini-Games (Daily Challenge)
1. **Memory**: Find matching pairs
2. **Sequence**: Memorize and repeat
3. **Math**: Simple calculations (+, -, *)
4. **Pattern**: Complete the sequence
5. **Reaction**: Click the right color

---

## 🏗️ Project Structure

```
app/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── api/               # Backend API routes
│   │   │   ├── auth/          # Login & Register
│   │   │   ├── user/          # Dashboard & History
│   │   │   ├── admin/         # Admin panel
│   │   │   └── challenge/     # Daily mini-games
│   │   ├── page.tsx           # Landing page
│   │   ├── login/
│   │   ├── register/
│   │   ├── dashboard/
│   │   ├── admin/
│   │   ├── challenge/
│   │   ├── how-it-works/      # How it works page
│   │   └── setup/             # Admin setup (auto)
│   └── lib/
│       ├── prisma.ts          # Database client
│       ├── auth.ts            # JWT & bcrypt
│       ├── level.ts           # Level system logic
│       ├── games.ts           # Mini-game generators
│       └── middleware.ts      # Auth middleware
├── package.json
├── next.config.ts             # Configured for Railway
├── railway.json               # Railway deployment config
└── Dockerfile
```

---

## 💻 Local Development

### Requirements
- Node.js 18+
- PostgreSQL (local or Docker)

### Setup

```bash
# 1. Enter project directory
cd "joc prieteni/app"

# 2. Install dependencies
npm install

# 3. Configure environment variables
copy .env.example .env
# Edit .env with:
# DATABASE_URL="postgresql://user:pass@localhost:5432/crypto_bambozld"
# JWT_SECRET="a-long-random-secret"

# 4. Generate Prisma client
npx prisma generate

# 5. Run migrations
npx prisma migrate dev

# 6. Start development server
npm run dev

# 7. Open http://localhost:3000/setup to create admin
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |

### User (requires auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/dashboard` | Dashboard data |
| GET | `/api/user/history` | Transaction history |

### Challenge (requires auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/challenge` | Get today's challenge |
| POST | `/api/challenge` | Submit game result |

### Admin (requires admin role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List users |
| POST | `/api/admin/points` | Add/Remove balance |
| GET | `/api/admin/setup` | Check if admin exists |
| POST | `/api/admin/setup` | Create admin (once) |

---

## 🎨 User Flow

1. **Register**: Create account with username, password and optional Referrer ID
2. **Dashboard**: View balance, level, bonuses and daily challenge status
3. **Daily Challenge**: Complete 3 mini-games to unlock returns
4. **Referral**: Copy your unique ID and invite friends
5. **Growth**: Wait for patience bonus to grow or bring referrals

---

## 🛡️ Important Rules

- **No negative balance**: System prevents going below 0
- **Fixed referral**: Cannot change after registration
- **Max 10 referrals**: Only first 10 active referrals give bonus
- **Max 2% patience bonus**: Grows 0.1% per day
- **Bonus reset**: Only resets when admin modifies balance
- **Claim after challenge**: Must complete daily challenge

---

## 📱 Technologies

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Next.js API Routes (Node.js)
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT + bcrypt
- **Deploy**: Railway

---

## 📝 Note for Admin

To add balance to a user:
1. Login at `/login` with `bamboleo1121` / `bamboleo1212`
2. Go to `/admin`
3. Search user in list
4. Click "Edit" and add/remove balance
5. User's patience bonus will reset automatically

---

**Crypto Bambozl'd - Invest with us!**
