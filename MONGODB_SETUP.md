# MongoDB Local Setup Guide for Windows

## Option 1: Install via MongoDB Installer (Recommended)

### Step 1: Download MongoDB
1. Go to: https://www.mongodb.com/try/download/community
2. Select:
   - Version: 7.0.x (latest)
   - Platform: Windows
   - Package: MSI
3. Click **Download**

### Step 2: Install MongoDB
1. Run the downloaded `.msi` file
2. Choose **Complete** installation
3. **Important**: Check "Install MongoDB as a Service"
   - Service Name: MongoDB
   - Data Directory: `C:\Program Files\MongoDB\Server\7.0\data`
   - Log Directory: `C:\Program Files\MongoDB\Server\7.0\log`
4. **Optional**: Install MongoDB Compass (GUI tool)
5. Complete installation

### Step 3: Verify Installation
Open PowerShell as Administrator:
```powershell
# Check if MongoDB service is running
Get-Service MongoDB

# Should show:
# Status   Name               DisplayName
# ------   ----               -----------
# Running  MongoDB            MongoDB Server
```

### Step 4: Test Connection
```powershell
# Open MongoDB Shell
mongosh

# You should see:
# Current Mongosh Log ID: xxx
# Connecting to: mongodb://127.0.0.1:27017
# Using MongoDB: 7.0.x
# test>

# Test command
show dbs

# Exit
exit
```

---

## Option 2: Install via Chocolatey (Quick)

### Step 1: Install Chocolatey (if not installed)
Open PowerShell as Administrator:
```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

### Step 2: Install MongoDB
```powershell
choco install mongodb -y
```

### Step 3: Start MongoDB Service
```powershell
net start MongoDB
```

---

## Option 3: Install via Scoop

### Step 1: Install Scoop (if not installed)
```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex
```

### Step 2: Install MongoDB
```powershell
scoop install mongodb
```

### Step 3: Start MongoDB
```powershell
mongod --dbpath C:\data\db
```

---

## Common Commands

### Service Management
```powershell
# Start MongoDB
net start MongoDB

# Stop MongoDB
net stop MongoDB

# Restart MongoDB
net stop MongoDB
net start MongoDB

# Check status
Get-Service MongoDB
```

### MongoDB Shell (mongosh)
```bash
# Connect to local MongoDB
mongosh

# Connect to specific database
mongosh mongodb://localhost:27017/cheezybite

# Show all databases
show dbs

# Use specific database
use cheezybite

# Show collections
show collections

# View all documents
db.pizzas.find()
db.users.find()
db.orders.find()

# Count documents
db.pizzas.countDocuments()

# Drop database (careful!)
use cheezybite
db.dropDatabase()
```

---

## MongoDB Compass (GUI)

### Installation
If not installed with MongoDB, download separately:
https://www.mongodb.com/try/download/compass

### Connect to Local MongoDB
1. Open MongoDB Compass
2. Connection String: `mongodb://localhost:27017`
3. Click **Connect**
4. Browse `cheezybite` database
5. View collections: pizzas, users, orders, toppings, admins

---

## CheezyBite Database Setup

### After MongoDB is Running

1. **Navigate to project**
```powershell
cd "e:\New folder (8)\cheezybite"
```

2. **Verify MongoDB connection**
```powershell
# Test with health check after starting Next.js
npm run dev
# Visit http://localhost:3000/api/health
```

3. **Seed the database**
```powershell
npm run seed
```

Expected output:
```
🌱 Starting database seeding...
✅ Connected to MongoDB

👤 Seeding admin users...
   ✅ Created 2 admin users
   📝 Default credentials:
      - admin / Admin@123
      - manager / Manager@123

🍕 Seeding pizzas...
   ✅ Created 25 pizzas

🧀 Seeding toppings...
   ✅ Created 8 toppings

👥 Seeding test user...
   ✅ Created test user
   📝 Test credentials: test@cheezybite.lk / test123

🎉 Database seeding completed!

📊 Summary:
   - Admins: 2
   - Pizzas: 25
   - Toppings: 8
   - Users: 1
   - Orders: 0
```

4. **Verify in MongoDB Compass**
- Open Compass
- Connect to `mongodb://localhost:27017`
- View `cheezybite` database
- Check collections have data

---

## Troubleshooting

### Issue: "MongoDB service not found"
**Solution**:
```powershell
# Reinstall MongoDB with service option checked
# Or start manually:
mongod --dbpath C:\data\db
```

### Issue: "Data directory not found"
**Solution**:
```powershell
# Create data directory
mkdir C:\data\db

# Start MongoDB
mongod --dbpath C:\data\db
```

### Issue: "Port 27017 already in use"
**Solution**:
```powershell
# Check what's using port 27017
netstat -ano | findstr :27017

# Kill the process
taskkill /PID <PID> /F
```

### Issue: "Access denied"
**Solution**:
Run PowerShell as Administrator

### Issue: "Connection timeout"
**Solution**:
```powershell
# Check if MongoDB is running
Get-Service MongoDB

# If stopped, start it
net start MongoDB

# Check firewall settings
```

---

## MongoDB Atlas (Cloud Alternative)

If you prefer cloud hosting:

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create free cluster (M0)
4. Create database user
5. Allow access from anywhere (0.0.0.0/0) for development
6. Get connection string
7. Update `.env.local`:
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cheezybite?retryWrites=true&w=majority
```

---

## Database Backup & Restore

### Backup
```powershell
# Backup entire database
mongodump --db cheezybite --out C:\backups\cheezybite

# Backup specific collection
mongodump --db cheezybite --collection pizzas --out C:\backups
```

### Restore
```powershell
# Restore entire database
mongorestore --db cheezybite C:\backups\cheezybite\cheezybite

# Restore specific collection
mongorestore --db cheezybite --collection pizzas C:\backups\cheezybite\pizzas.bson
```

---

## Next Steps

After MongoDB is installed and running:

1. ✅ MongoDB installed and running
2. ✅ Database seeded with initial data
3. ✅ Verify health check: http://localhost:3000/api/health
4. 📝 Test API endpoints (see API_TESTING.md)
5. 🔄 Enable backend mode: Set `NEXT_PUBLIC_USE_API_BACKEND=true` in `.env.local`
6. 🚀 Ready for full-stack development!
