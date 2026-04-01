# 🚀 InsurAI - Complete Startup Guide

## ✅ System Status: FULLY OPERATIONAL

### Current Running Services:
- **Backend**: Running on `http://localhost:5000` ✅
- **Frontend**: Running on `http://localhost:3000` ✅
- **Database**: MongoDB Connected ✅
- **Compilation**: No errors ✅

## 🎯 Quick Access Instructions

### 1. Open Your Browser
Go to: **`http://localhost:3000`**

### 2. First Time Setup (if needed)
1. **Register Account**:
   - Click "Create a new account"
   - Fill: Name, Email, Password (must have uppercase, lowercase, number)
   - Add: Department, Company
   - Click "Create account"

2. **Login**:
   - Use your registered credentials
   - Click "Sign in"

### 3. Test Core Features

#### 📤 Upload Policy
1. Navigate to "Policies" → "Upload Policy"
2. Select PDF or DOCX file (max 10MB)
3. Fill policy details (Title, Policy Number, Insurance Company, etc.)
4. Click "Upload & Analyze"
5. Wait for success message

#### 🤖 AI Chat
1. Navigate to "AI Chat"
2. Select a policy from dropdown
3. Ask questions like:
   - "What is covered?"
   - "What are the exclusions?"
   - "What is the premium amount?"
4. Get AI-powered responses

#### 📊 Dashboard
1. View policy statistics
2. Check risk assessments
3. Monitor expiring policies
4. View analytics charts

#### 🔔 Alerts
1. Navigate to "Alerts"
2. View system notifications
3. Filter by type and severity
4. Mark alerts as read

## 🔧 Configuration Requirements

### For Full AI Features:
Edit `backend/.env` file:
```env
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
```

### For Email Alerts:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

## 📱 Access URLs

- **Frontend Application**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## 🛠️ Development Commands

### Start Backend:
```bash
cd backend
npm run dev
```

### Start Frontend:
```bash
cd frontend
npm start
```

### Stop Services:
```bash
# Stop backend (Ctrl+C in terminal)
# Stop frontend (Ctrl+C in terminal)
```

## 🔍 Troubleshooting

### If Frontend Doesn't Load:
1. Check if backend is running on port 5000
2. Clear browser cache (Ctrl+F5)
3. Check browser console (F12) for errors
4. Verify npm dependencies installed correctly

### If Upload Fails:
1. Check file size < 10MB
2. Verify file is PDF or DOCX
3. Check browser console for errors
4. Verify backend logs in terminal

### If AI Features Don't Work:
1. Verify OpenAI API key in .env file
2. Check internet connection
3. Verify OpenAI API credits
4. Check backend logs for API errors

## 🎉 System Features

Your InsurAI system includes:
- ✅ User authentication (JWT)
- ✅ Policy upload and management
- ✅ AI-powered policy analysis
- ✅ RAG-based chatbot
- ✅ Risk assessment and scoring
- ✅ Compliance monitoring
- ✅ Automated alerts
- ✅ Analytics and reporting
- ✅ Responsive design
- ✅ Modern UI with Tailwind CSS

## 📞 Support

If you encounter any issues:
1. Check browser console (F12)
2. Check backend terminal logs
3. Verify all services are running
4. Refer to FIXES_SUMMARY.md for recent fixes

## 🚀 Ready to Use!

Your complete AI-powered insurance policy management system is now running and ready for use!
