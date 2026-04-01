# 🚀 InsurAI Project Setup Guide

Follow these steps to get the complete InsurAI system running on your machine.

## 📋 Prerequisites

Before you start, make sure you have:

1. **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
2. **MongoDB** (local installation or cloud account) - [Download here](https://www.mongodb.com/try/download/community)
3. **OpenAI API Key** - Get from [OpenAI Platform](https://platform.openai.com/api-keys)
4. **Git** (optional) - [Download here](https://git-scm.com/)

---

## 🗂️ Step 1: Navigate to Project Directory

Open your terminal/command prompt and navigate to the project folder:

```bash
cd c:\Users\Chandrakanth\Downloads\INSURAI
```

---

## 🔧 Step 2: Backend Setup

### 2.1 Navigate to Backend Directory
```bash
cd backend
```

### 2.2 Install Backend Dependencies
```bash
npm install
```

### 2.3 Create Environment File
```bash
copy .env.example .env
```

### 2.4 Configure Environment Variables
Open the `.env` file in a text editor and configure:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/insurai

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_this_to_something_secure
JWT_EXPIRE=7d

# OpenAI Configuration (REQUIRED)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Email Configuration (Optional - for alerts)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

**Important:**
- Replace `your_super_secret_jwt_key_here` with a secure random string
- Replace `sk-your-openai-api-key-here` with your actual OpenAI API key
- For email alerts, you'll need to configure SMTP settings (optional)

---

## 🎨 Step 3: Frontend Setup

### 3.1 Navigate to Frontend Directory
```bash
cd ..\frontend
```

### 3.2 Install Frontend Dependencies
```bash
npm install
```

### 3.3 Create Tailwind CSS Configuration
The Tailwind config is already included, but if you need to regenerate:
```bash
npx tailwindcss init -p
```

---

## 🗄️ Step 4: Database Setup

### Option A: Local MongoDB (Recommended for Development)

1. **Install MongoDB Community Server** on your Windows machine
2. **Start MongoDB Service**:
   - Open Services in Windows
   - Find "MongoDB" and start the service
   - Or run: `net start MongoDB`

3. **Verify MongoDB is running**:
   ```bash
   mongosh
   ```
   You should see the MongoDB shell.

### Option B: MongoDB Atlas (Cloud)

1. **Create a free account** at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. **Create a free cluster**
3. **Get your connection string** from the Atlas dashboard
4. **Update your .env file**:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/insurai
   ```

---

## 🤖 Step 5: OpenAI API Setup

1. **Get OpenAI API Key**:
   - Go to [OpenAI Platform](https://platform.openai.com/api-keys)
   - Sign up or login
   - Create a new API key
   - Copy the key (starts with `sk-`)

2. **Add to .env file**:
   ```env
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

3. **Test API Key** (optional):
   ```bash
   curl -H "Authorization: Bearer sk-your-key" https://api.openai.com/v1/models
   ```

---

## 🚀 Step 6: Start the Applications

### 6.1 Start Backend Server

Open a **new terminal window** and run:

```bash
cd c:\Users\Chandrakanth\Downloads\INSURAI\backend
npm run dev
```

You should see:
```
🚀 InsurAI Backend running on port 5000
✅ Connected to MongoDB
📊 Dashboard: http://localhost:5000/api/health
```

### 6.2 Start Frontend Application

Open **another new terminal window** and run:

```bash
cd c:\Users\Chandrakanth\Downloads\INSURAI\frontend
npm start
```

The browser should automatically open to `http://localhost:3000`

---

## ✅ Step 7: Verify Everything is Working

### 7.1 Check Backend Health
Open in browser: `http://localhost:5000/api/health`

You should see:
```json
{
  "status": "OK",
  "message": "InsurAI Backend is running",
  "timestamp": "2024-03-31T..."
}
```

### 7.2 Check Frontend
Go to `http://localhost:3000` - you should see the InsurAI login page.

### 7.3 Test Registration
1. Click "Create a new account"
2. Fill in the registration form
3. Submit and verify you can login

---

## 🎯 Step 8: First Time Usage

### 8.1 Upload Your First Policy
1. Login to the application
2. Go to "Policies" → "Upload Policy"
3. Fill in the policy details
4. Upload a PDF or DOCX file
5. Wait for AI analysis to complete

### 8.2 Test AI Chat
1. Go to "AI Chat"
2. Select your uploaded policy
3. Ask questions like:
   - "What is covered?"
   - "What are the exclusions?"
   - "What is the premium amount?"

---

## 🔧 Troubleshooting

### Common Issues & Solutions:

**Issue: "MongoDB connection failed"**
```bash
# Check if MongoDB is running
net start MongoDB

# Or use mongosh to test connection
mongosh --eval "db.adminCommand('ismaster')"
```

**Issue: "OpenAI API key invalid"**
- Verify your API key is correct
- Check if you have credits in your OpenAI account
- Ensure the key doesn't have spaces

**Issue: "Port already in use"**
```bash
# Find what's using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID)
taskkill /PID <PID> /F
```

**Issue: "Frontend not loading"**
- Clear browser cache
- Check if backend is running on port 5000
- Verify proxy settings in package.json

**Issue: "File upload fails"**
- Check file size (max 10MB)
- Verify file format (PDF/DOCX only)
- Ensure uploads folder exists and has write permissions

---

## 📱 Demo Credentials (Optional)

If you want to skip registration, you can create a demo user:

```bash
# In backend terminal, run this to create admin user:
node -e "
const User = require('./models/User');
const bcrypt = require('bcryptjs');
bcrypt.hash('Admin123', 12).then(hash => {
  new User({
    name: 'Demo Admin',
    email: 'admin@insurai.com',
    password: hash,
    role: 'admin',
    department: 'IT',
    company: 'Demo Corp'
  }).save().then(() => console.log('Demo user created'));
});
"
```

Login with:
- Email: `admin@insurai.com`
- Password: `Admin123`

---

## 🎉 You're All Set!

Your InsurAI system is now running! You can:

1. ✅ Upload and analyze insurance policies
2. ✅ Chat with AI about your policies
3. ✅ View dashboard analytics
4. ✅ Receive alerts for expiring policies
5. ✅ Compare different policies

### Next Steps:
- Upload some sample policies from the `sample-policies` folder
- Explore all the features in the dashboard
- Test the AI chatbot capabilities
- Set up email alerts if desired

---

## 🆘 Need Help?

If you encounter any issues:

1. **Check the logs** in both backend and frontend terminals
2. **Verify environment variables** in the .env file
3. **Ensure all dependencies are installed** correctly
4. **Check MongoDB and OpenAI connectivity**

For additional support, refer to the main README.md file or create an issue in the project repository.

---

**Happy Policy Management! 🎯**
