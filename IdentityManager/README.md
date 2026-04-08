# Cloobot Authentication System

A complete, production-ready authentication system for SaaS applications supporting both local email/password authentication and Okta SSO integration.

## 🚀 Features

- **Local Authentication**: Email + password signup/login with bcrypt hashing
- **Okta SSO**: OpenID Connect integration with Okta Developer
- **JWT Security**: Secure token-based authentication
- **Modern UI**: Clean, responsive React frontend with TailwindCSS
- **Database Integration**: SQLAlchemy ORM with SQLite (easily configurable for PostgreSQL/MySQL)
- **Production Ready**: Environment variables, error handling, CORS configuration

## 🛠 Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **SQLAlchemy**: ORM for database operations
- **JWT**: Secure token authentication
- **bcrypt**: Password hashing
- **SQLite**: Database (POC, easily replaceable)

### Frontend
- **React**: Modern UI framework with Vite
- **TailwindCSS**: Utility-first CSS framework
- **Axios**: HTTP client with interceptors
- **React Router**: Client-side routing

### Authentication
- **Okta Developer**: Free SSO provider
- **OpenID Connect**: Industry standard protocol
- **JWT**: Stateless authentication

## 📋 Prerequisites

- Node.js 16+ and npm
- Python 3.8+
- Okta Developer Account (free)

## 🚀 Quick Start

### 1. Clone and Setup

```bash
# Navigate to project directory
cd "Okta project CB"

# Backend Setup
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r ../requirements.txt

# Frontend Setup
cd ../frontend
npm install
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
```

### 3. Okta Configuration (Required for SSO)

See detailed Okta setup instructions below.

### 4. Run the Application

```bash
# Terminal 1: Start Backend
cd backend
python main.py

# Terminal 2: Start Frontend
cd frontend
npm run dev
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 🔧 Okta Setup Instructions

### Step 1: Create Okta Developer Account

1. Visit [Okta Developer](https://developer.okta.com/signup/)
2. Sign up for a free developer account
3. Choose your organization URL (e.g., `dev-123456.okta.com`)

### Step 2: Create OIDC Application

1. Log in to your Okta Developer Console
2. Navigate to **Applications** → **Applications**
3. Click **Create App Integration**
4. Select **OIDC - OpenID Connect**
5. Choose **Web Application** as application type
6. Click **Next**

### Step 3: Configure Application Settings

**General Settings:**
- **Application name**: `Cloobot`
- **Logo**: (optional)

**Sign-in redirect URIs:**
- Add: `http://localhost:8000/auth/okta/callback`

**Sign-out redirect URIs:**
- Add: `http://localhost:3000`

**Assignments:**
- Select **Allow everyone in your organization to access**

Click **Save**.

### Step 4: Get Credentials

1. After creation, go to the **Sign On** tab
2. Note down:
   - **Client ID**: `your-okta-client-id`
   - **Client Secret**: `your-okta-client-secret`

3. Your **Okta Domain** is in your console URL:
   - Example: `dev-123456.okta.com`

### Step 5: Update Environment Variables

Edit your `.env` file:

```env
# Okta Configuration
OKTA_DOMAIN=dev-123456.okta.com
OKTA_CLIENT_ID=your-okta-client-id
OKTA_CLIENT_SECRET=your-okta-client-secret
OKTA_REDIRECT_URI=http://localhost:8000/auth/okta/callback
```

### Step 6: Test SSO

1. Start both backend and frontend
2. Go to http://localhost:3000/login
3. Click "Login with Okta"
4. You'll be redirected to Okta login page
5. After successful login, you'll return to the dashboard

## 📁 Project Structure

```
Okta project CB/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── auth_routes.py       # Authentication endpoints
│   ├── models.py            # Database models
│   ├── database.py          # Database configuration
│   └── utils.py             # JWT and password utilities
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── contexts/        # React contexts
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   └── App.jsx          # Main App component
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── requirements.txt         # Python dependencies
├── .env.example            # Environment template
└── README.md               # This file
```

## 🔐 Authentication Flow

### Local Authentication
1. User signs up with email/password
2. Password is hashed using bcrypt
3. JWT token is generated and returned
4. Token stored in localStorage
5. Subsequent requests include token in Authorization header

### Okta SSO Flow
1. User clicks "Login with Okta"
2. Redirected to Okta authorization endpoint
3. User authenticates with Okta
4. Okta redirects to callback with authorization code
5. Backend exchanges code for tokens
6. Backend validates ID token and extracts user info
7. User created/updated in database
8. JWT token generated for our app
9. User redirected to frontend with token

## 🛡 Security Features

- **Password Hashing**: bcrypt with salt
- **JWT Tokens**: Secure, expiring tokens
- **CORS Protection**: Configured for frontend domain
- **Input Validation**: Pydantic models for request validation
- **Error Handling**: Secure error responses
- **State Parameter**: CSRF protection for OAuth flow

## 📊 API Endpoints

### Authentication
- `POST /auth/signup` - Create new user
- `POST /auth/login` - Login with email/password
- `GET /auth/me` - Get current user info
- `GET /auth/okta/login` - Initiate Okta SSO
- `GET /auth/okta/callback` - Handle Okta callback

### Protected
- `GET /dashboard` - Get dashboard data
- `GET /health` - Health check

## 🔄 Environment Variables

```env
# Database
DATABASE_URL=sqlite:///./cloobot.db

# JWT
JWT_SECRET_KEY=your-super-secret-jwt-key
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# Okta
OKTA_DOMAIN=your-okta-domain.okta.com
OKTA_CLIENT_ID=your-okta-client-id
OKTA_CLIENT_SECRET=your-okta-client-secret
OKTA_REDIRECT_URI=http://localhost:8000/auth/okta/callback
```

## 🚀 Deployment Considerations

### Production Database
Replace SQLite with PostgreSQL or MySQL:

```env
# PostgreSQL
DATABASE_URL=postgresql://user:password@localhost/cloobot

# MySQL
DATABASE_URL=mysql://user:password@localhost/cloobot
```

### Security
- Use strong JWT secret keys
- Set appropriate CORS origins
- Enable HTTPS in production
- Use environment-specific configurations

### Frontend Build
```bash
cd frontend
npm run build
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
python -m pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🐛 Troubleshooting

### Common Issues

**CORS Errors:**
- Ensure frontend URL is in CORS origins
- Check if backend is running on correct port

**Okta SSO Not Working:**
- Verify Okta domain and credentials
- Check redirect URI matches exactly
- Ensure application is active in Okta

**JWT Token Issues:**
- Check JWT_SECRET_KEY is set
- Verify token hasn't expired
- Ensure token is sent in Authorization header

**Database Errors:**
- Check DATABASE_URL is correct
- Ensure database file is writable
- Run with proper permissions

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the API documentation at `/docs`
3. Verify environment configuration
4. Test with the provided examples

## 📄 License

This project is provided as a POC/demo. Use as reference for your production implementations.
