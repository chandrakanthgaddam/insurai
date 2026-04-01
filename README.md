# InsurAI - Corporate Policy Automation and Intelligence System

An AI-powered system that automates policy understanding, provides insights, ensures compliance, and supports decision-making for corporate insurance policies.

## 🎯 Features

### Core Features
- **User & Admin Management** - JWT-based authentication with role-based access control
- **Policy Upload & Management** - Upload PDF/DOCX policies with intelligent organization
- **AI Policy Analysis** - Automatic extraction of coverage, risks, clauses, and key entities
- **Policy Intelligence & Insights** - Risk scoring, compliance analysis, and recommendations
- **Compliance & Alert System** - Automated expiry alerts and compliance monitoring
- **Policy Comparison** - Compare multiple policies side-by-side
- **AI Chatbot** - RAG-powered chatbot for policy queries
- **Dashboard & Analytics** - Comprehensive reporting and insights

### Advanced Features
- **RAG Pipeline** - Retrieval-Augmented Generation for accurate responses
- **Vector Embeddings** - Semantic search and document similarity
- **Real-time Alerts** - Email notifications for critical events
- **Multi-format Support** - PDF and DOCX document processing

## 🛠 Tech Stack

### Backend
- **Node.js** + **Express.js** - RESTful API server
- **MongoDB** - Document database with Mongoose ODM
- **JWT** - Authentication and authorization
- **Multer** - File upload handling
- **OpenAI API** - AI analysis and embeddings
- **Node-cron** - Scheduled tasks and alerts
- **Nodemailer** - Email notifications

### Frontend
- **React.js** - Modern UI framework
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **React Hook Form** - Form management
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **Lucide React** - Icon library

## 📁 Project Structure

```
INSURAI/
├── backend/
│   ├── controllers/     # API route handlers
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── services/       # Business logic (AI, alerts)
│   ├── middleware/     # Auth, upload, validation
│   ├── utils/          # Helper functions
│   ├── uploads/        # File storage
│   └── server.js       # Main server file
├── frontend/
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Page components
│   │   ├── contexts/   # React contexts
│   │   ├── hooks/      # Custom hooks
│   │   ├── services/   # API services
│   │   └── utils/      # Utility functions
│   └── public/        # Static assets
├── sample-policies/    # Sample policy documents
└── README.md
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- OpenAI API key

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**
   ```env
   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/insurai

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=7d

   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key_here

   # Email Configuration (optional)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password

   # Server Configuration
   PORT=5000
   NODE_ENV=development
   ```

5. **Start the backend server**
   ```bash
   npm run dev
   ```

The backend will be running on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the frontend development server**
   ```bash
   npm start
   ```

The frontend will be running on `http://localhost:3000`

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Policies
- `POST /api/policy/upload` - Upload new policy
- `GET /api/policy` - Get all policies
- `GET /api/policy/:id` - Get specific policy
- `PUT /api/policy/:id` - Update policy
- `DELETE /api/policy/:id` - Delete policy
- `GET /api/policy/:id/download` - Download policy file

### AI Services
- `POST /api/ai/analyze/:policyId` - Analyze policy with AI
- `POST /api/ai/compare` - Compare two policies
- `GET /api/ai/insights/:policyId` - Get policy insights
- `POST /api/ai/embeddings/:policyId` - Regenerate embeddings

### Chat
- `POST /api/chat/start/:policyId` - Start chat session
- `POST /api/chat/message/:chatId` - Send message
- `GET /api/chat` - Get chat history
- `GET /api/chat/:chatId` - Get specific chat

### Dashboard
- `GET /api/dashboard/overview` - Get dashboard overview
- `GET /api/dashboard/analytics` - Get analytics data
- `GET /api/dashboard/alerts` - Get alerts

## 🤖 AI Features

### Policy Analysis
The system uses OpenAI's GPT-4 to analyze insurance policies and extract:
- Policy summary
- Coverage details
- Risk factors
- Important clauses
- Exclusions and conditions
- Named entities (people, organizations, dates, amounts)
- Risk and compliance scores

### RAG Pipeline
1. **Document Processing** - Extract text from PDF/DOCX files
2. **Text Chunking** - Split documents into manageable chunks
3. **Embedding Generation** - Create vector embeddings using OpenAI
4. **Vector Storage** - Store embeddings in MongoDB
5. **Semantic Search** - Find relevant chunks for queries
6. **Response Generation** - Use retrieved context for accurate answers

### Alert System
Automated alerts for:
- Policy expiry (30, 7, 1 day warnings)
- Low compliance scores
- High risk policies
- Payment reminders

## 👥 User Roles

### Admin
- Manage all users and policies
- Access system-wide analytics
- Configure system settings
- View all company policies

### User
- Upload and manage own policies
- Access personal dashboard
- Use AI chatbot
- View personal analytics

## 🔧 Development

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Building for Production
```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run build
```

## 📝 Environment Variables

### Required
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `OPENAI_API_KEY` - OpenAI API key

### Optional
- `EMAIL_HOST` - SMTP server for email alerts
- `EMAIL_USER` - Email username
- `EMAIL_PASS` - Email password
- `FRONTEND_URL` - Frontend application URL

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in .env file
   - Verify network connectivity

2. **OpenAI API Error**
   - Verify API key is valid
   - Check API quota and billing
   - Ensure correct API endpoint

3. **File Upload Error**
   - Check file size limits (max 10MB)
   - Verify file format (PDF/DOCX only)
   - Ensure uploads directory exists

4. **Authentication Issues**
   - Clear browser localStorage
   - Check JWT secret configuration
   - Verify token expiration

### Debug Mode
Set `NODE_ENV=development` to enable:
- Detailed error messages
- API request logging
- Enhanced debugging information

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Install production dependencies
3. Start with `npm start`
4. Configure reverse proxy (nginx/Apache)
5. Set up SSL certificate

### Frontend Deployment
1. Build with `npm run build`
2. Deploy build folder to web server
3. Configure routing for SPA
4. Set up environment variables

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Email: support@insurai.com
- Documentation: [docs.insurai.com](https://docs.insurai.com)

---

**Built with ❤️ by the InsurAI Team**
#   i n s u r a i  
 