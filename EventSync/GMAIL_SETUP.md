# 📧 Real Gmail Setup Guide

## 🎯 Get Real Emails Sent to Your Inbox!

Follow these steps to receive **actual Gmail emails** when you approve registrations.

### 📋 Step 1: Get Gmail App Password

1. **Enable 2-Factor Authentication** on your Gmail account
2. Go to: https://myaccount.google.com/apppasswords
3. Select **"Select app"** → "Other (Custom name)"
4. Enter app name: `Event Registration System`
5. Click **"Generate"**
6. **Copy the 16-character password** (not your regular Gmail password!)

### 🔧 Step 2: Update Server Configuration

Open the file: `server.js` (line 49-51)

Replace this:
```javascript
user: 'YOUR_GMAIL@gmail.com', // 👈 REPLACE WITH YOUR GMAIL
pass: 'YOUR_APP_PASSWORD'     // 👈 REPLACE WITH GMAIL APP PASSWORD
```

With this:
```javascript
user: 'your-actual-gmail@gmail.com',  // Your real Gmail
pass: 'xxxx-xxxx-xxxx-xxxx',        // The 16-char app password you got
```

### 💻 Step 3: Restart Server

1. Stop current server (Ctrl+C in terminal)
2. Run: `node server.js`
3. Check for this message:
   ```
   🚀 Event Registration System running on http://localhost:3001
   ```

### 🧪 Step 4: Test Real Email

1. **Fill Registration Form**: `http://localhost:3001`
   - Use your real email address
   - Name: Test User
   - Email: `your-actual-gmail@gmail.com`
   - Event: Tech Summit 2024

2. **Approve Registration**: `http://localhost:3001/admin`
   - Click "✅ Approve" button

3. **Check Your Gmail Inbox!**
   - You should receive a professional ticket email
   - Subject: "🎉 Your Registration is Approved!"
   - Beautiful HTML design with ticket details

### 📧 What You'll Receive:

✅ **Professional HTML email** with event ticket
✅ **Ticket details** (Event, Name, Ticket ID, Date)
✅ **Important instructions** for the event
✅ **Branded design** with Event Registration System
✅ **Mobile responsive** layout

### 🔒 Security Notes:

- **Never share** your App Password
- **Use different** App Passwords for different apps
- **Revoke** old App Passwords if needed
- **Keep 2FA enabled** on your Gmail account

### 🚨 Troubleshooting:

**If email doesn't send:**
1. Check Gmail App Password is correct
2. Ensure 2FA is enabled
3. Check terminal for error messages
4. Try a different Gmail address

**Common errors:**
- "Invalid credentials" → Wrong App Password
- "Too many login attempts" → Wait a few minutes
- "Authentication failed" → Check 2FA settings

### 🎯 Once Setup is Complete:

You'll get **real emails in your Gmail inbox** within seconds of approving registrations!

The system will show:
```
🎉 REAL EMAIL SENT TO your-email@gmail.com! Check your inbox!
📧 If you don't see it, check your spam folder.
```

**Ready to receive real event registration emails!** 📧🎉
