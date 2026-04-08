# 🚀 Setup Guide - Cloobot Authentication System

This guide provides step-by-step instructions to get the Cloobot authentication system running locally.

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js 16+** with npm
- **Python 3.8+** with pip
- **Git** (for version control)
- **Code Editor** (VS Code recommended)
- **Okta Developer Account** (free signup)

## 🗂 Step 1: Project Setup

### Navigate to Project Directory
```bash
cd "Okta project CB"
ls -la
```

You should see:
- `backend/` folder
- `frontend/` folder  
- `requirements.txt`
- `.env.example`
- `README.md`

## 🐍 Step 2: Backend Setup

### Create Virtual Environment
```bash
cd backend
python -m venv venv

# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate
```

### Install Dependencies
```bash
pip install -r ../requirements.txt
```

### Configure Environment
```bash
cd ..
cp .env.example .env
```

Edit `.env` file with your configuration:

```env
# Database (SQLite is fine for local)
DATABASE_URL=sqlite:///./cloobot.db

# JWT (use a strong secret in production)
JWT_SECRET_KEY=your-super-secret-jwt-key-change-this-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# Okta (leave empty for now, we'll set this up later)
OKTA_DOMAIN=
OKTA_CLIENT_ID=
OKTA_CLIENT_SECRET=
OKTA_REDIRECT_URI=http://localhost:8000/auth/okta/callback
```

### Test Backend
```bash
cd backend
python main.py
```

You should see:
```
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

Test the API:
```bash
curl http://localhost:8000/
# Should return: {"message": "Cloobot Auth API is running"}
```

## ⚛️ Step 3: Frontend Setup

### Install Dependencies
```bash
cd ../frontend
npm install
```

### Test Frontend
```bash
npm run dev
```

You should see:
```
  VITE v5.0.8  ready in 321 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

## 🔐 Step 4: Okta SSO Setup

### 4.1 Create Okta Developer Account

1. Go to [https://developer.okta.com/signup/](https://developer.okta.com/signup/)
2. Fill in your details:
   - **First Name**: Your first name
   - **Last Name**: Your last name  
   - **Email**: Your email
   - **Company**: (optional)
   - **Country**: Your country
3. Click **Get Started**
4. Check your email for verification
5. Set a password for your Okta account

### 4.2 Create OIDC Application

1. After logging in, you'll see your Okta Dashboard
2. In the left sidebar, click **Applications** → **Applications**
3. Click the **Create App Integration** button
4. Select **OIDC - OpenID Connect**
5. Choose **Web Application**
6. Click **Next**

### 4.3 Configure Application

**General Settings:**
- **Application name**: `Cloobot`
- **Logo**: (optional, you can skip)

**Sign-in redirect URIs:**
```
http://localhost:8000/auth/okta/callback
```

**Sign-out redirect URIs:**
```
http://localhost:3000
```

**Assignments:**
- ✅ **Allow everyone in your organization to access**

Click **Save**.

### 4.4 Get Your Credentials

After saving, you'll be on the application page. Click the **Sign On** tab.

You'll see:
- **Client ID**: `0oaxxxxxxx` (copy this)
- **Client Secret**: Click **Show** to reveal and copy

Your **Okta Domain** is in your browser URL:
- Example: `dev-123456.okta.com`

### 4.5 Update Environment Variables

Edit your `.env` file:

```env
# Okta Configuration
OKTA_DOMAIN=dev-123456.okta.com
OKTA_CLIENT_ID=0oaxxxxxxx
OKTA_CLIENT_SECRET=your-client-secret-here
OKTA_REDIRECT_URI=http://localhost:8000/auth/okta/callback
```

## 🧪 Step 5: Test the Complete System

### Start Both Services

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
python main.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Test Local Authentication

1. Open http://localhost:3000
2. Click "Sign up"
3. Enter email and password
4. You should be redirected to dashboard

### Test Okta SSO

1. Logout from dashboard
2. Go to http://localhost:3000/login
3. Click "Login with Okta"
4. You'll be redirected to Okta login page
5. Enter your Okta credentials
6. After successful login, you'll return to dashboard

## 🔍 Step 6: Verify Everything Works

### Check Dashboard Features

In the dashboard, you should see:
- Your email address
- Authentication provider (local or okta)
- Member since date
- Authentication status indicators

### Test API Endpoints

```bash
# Health check
curl http://localhost:8000/health

# Get current user (requires JWT token)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:8000/auth/me
```

### Test Database

Check if database file was created:
```bash
ls -la backend/cloobot.db
```

## 🐛 Common Issues & Solutions

### Issue: CORS Errors
**Symptom**: Browser shows CORS policy errors
**Solution**: Ensure backend is running and CORS is configured correctly

### Issue: Okta Callback Fails
**Symptom**: "Error communicating with Okta"
**Solution**: 
- Verify OKTA_DOMAIN is correct
- Check Client ID and Secret
- Ensure redirect URI matches exactly

### Issue: JWT Token Not Working
**Symptom**: 401 Unauthorized errors
**Solution**: 
- Check JWT_SECRET_KEY is set
- Verify token hasn't expired (24 hours default)

### Issue: Frontend Not Loading
**Symptom**: Blank page or errors
**Solution**: 
- Check npm install completed successfully
- Verify Vite dev server started on port 3000

## 📱 Next Steps

Once everything is working:

1. **Explore the codebase** - Understand the flow
2. **Modify the UI** - Customize the design
3. **Add features** - Extend the functionality
4. **Deploy** - Consider production deployment

## 🆘 Need Help?

If you encounter issues:

1. Check the terminal logs for error messages
2. Verify all environment variables are set correctly
3. Ensure both services are running
4. Review the troubleshooting section in README.md

## 🎉 Success!

You now have a fully working authentication system with:
- ✅ Local email/password authentication
- ✅ Okta SSO integration  
- ✅ JWT token security
- ✅ Modern React UI
- ✅ Database persistence

Congratulations! You're ready to build your SaaS application on this foundation.
