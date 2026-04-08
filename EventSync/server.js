const express = require('express');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const nodemailer = require('nodemailer');
const https = require('https');
const app = express();
const PORT = 3001;

// Google Apps Script webhook URL
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwKlgjZbNk1Uz4ZJTlN8LlIsVkB-q30NlTj0aZ_pAlUuXi_JPNCEnSfu5Xlm42Xd0g4cw/exec';

// Function to send data to Google Apps Script using https
function sendToGoogleAppsScript(data) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(data);
        
        const options = {
            hostname: 'script.google.com',
            path: '/macros/s/AKfycbwKlgjZbNk1Uz4ZJTlN8LlIsVkB-q30NlTj0aZ_pAlUuXi_JPNCEnSfu5Xlm42Xd0g4cw/exec',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };
        
        const req = https.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                console.log('✅ Google Apps Script response:', responseData);
                resolve(true);
            });
        });
        
        req.on('error', (error) => {
            console.error('❌ Failed to send to Google Apps Script:', error.message);
            resolve(false); // Don't reject, just resolve with false
        });
        
        req.write(postData);
        req.end();
    });
}

// Function to update Google Sheets in real-time via webhook
async function updateGoogleSheets(registration) {
    try {
        const data = {
            action: 'new_registration',
            timestamp: registration.timestamp,
            name: registration.name,
            email: registration.email,
            event: registration.event,
            status: registration.status,
            ticketId: registration.ticketId,
            approvedDate: registration.approvedDate || '',
            emailSent: registration.emailSent
        };
        
        return await sendToGoogleAppsScript(data);
    } catch (error) {
        console.error('❌ Failed to update Google Sheets:', error.message);
        return false;
    }
}

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Data storage (in production, use a proper database)
const DATA_FILE = path.join(__dirname, 'registrations.json');
const EXCEL_FILE = path.join(__dirname, 'registrations.csv');

// Initialize data files
function initializeFiles() {
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify([]));
    }
    
    if (!fs.existsSync(EXCEL_FILE)) {
        const headers = 'Timestamp,Name,Email,Event,Status,TicketID,ApprovedDate,EmailSent\n';
        fs.writeFileSync(EXCEL_FILE, headers);
    }
}

// Helper functions
function generateTicketId() {
    return 'TKT-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
}

function updateExcelFile(data) {
    const csvContent = data.map(reg => 
        `"${reg.timestamp}","${reg.name}","${reg.email}","${reg.event}","${reg.status}","${reg.ticketId}","${reg.approvedDate || ''}","${reg.emailSent}"`
    ).join('\n');
    
    const headers = 'Timestamp,Name,Email,Event,Status,TicketID,ApprovedDate,EmailSent\n';
    fs.writeFileSync(EXCEL_FILE, headers + csvContent);
}

// Email configuration
function sendEmail(to, subject, body) {
    return new Promise((resolve, reject) => {
        // Real Gmail configuration - UPDATE WITH YOUR EMAIL
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'palakugupta@gmail.com', // 👈 REPLACE WITH YOUR GMAIL
                pass: 'njqklfsvxkfumbhs'     // 👈 REPLACE WITH GMAIL APP PASSWORD
            }
        });

        const mailOptions = {
            from: `"Event Registration" <${transporter.options.auth.user}>`,
            to: to,
            subject: subject,
            html: body
        };

        transporter.sendMail(mailOptions)
            .then(info => {
                console.log('📧 REAL Email sent successfully!');
                console.log('📧 Message ID:', info.messageId);
                console.log('📧 Email sent to:', to);
                console.log('📧 Subject:', subject);
                
                // Save email info for demo
                const emailLog = {
                    to, subject, body, 
                    timestamp: new Date().toISOString(),
                    messageId: info.messageId,
                    sent: true
                };
                fs.appendFileSync(path.join(__dirname, 'email_log.json'), JSON.stringify(emailLog) + '\n');
                
                console.log(`\n🎉 REAL EMAIL SENT TO ${to}! Check your inbox!`);
                console.log(`📧 If you don't see it, check your spam folder.`);
                
                resolve(true);
            })
            .catch(error => {
                console.error('Real email sending failed:', error);
                
                // Fallback: save to file
                const emailLog = {
                    to, subject, body, 
                    timestamp: new Date().toISOString(),
                    error: error.message,
                    sent: false
                };
                fs.appendFileSync(path.join(__dirname, 'email_log.json'), JSON.stringify(emailLog) + '\n');
                
                console.log(`\n❌ Email failed to send. Error: ${error.message}`);
                
                resolve(false);
            });
    });
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/api/registrations', (req, res) => {
    const data = fs.readFileSync(DATA_FILE);
    res.json(JSON.parse(data));
});

app.post('/api/register', async (req, res) => {
    try {
        const { name, email, event } = req.body;
        
        if (!name || !email || !event) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        
        const registrations = JSON.parse(fs.readFileSync(DATA_FILE));
        const newRegistration = {
            id: Date.now(),
            timestamp: new Date().toLocaleString(),
            name,
            email,
            event,
            status: 'Pending',
            ticketId: generateTicketId(),
            approvedDate: '',
            emailSent: 'No'
        };
        
        registrations.push(newRegistration);
        fs.writeFileSync(DATA_FILE, JSON.stringify(registrations, null, 2));
        updateExcelFile(registrations);
        
        // Send to Google Apps Script for real-time updates - AWAIT IT!
        console.log('📤 Sending to Google Apps Script:', newRegistration.name);
        const sentToSheets = await sendToGoogleAppsScript({
            timestamp: newRegistration.timestamp,
            name: newRegistration.name,
            email: newRegistration.email,
            event: newRegistration.event,
            status: newRegistration.status,
            ticketId: newRegistration.ticketId,
            approvedDate: newRegistration.approvedDate,
            emailSent: newRegistration.emailSent
        });
        
        if (sentToSheets) {
            console.log('✅ Data sent to Google Sheets successfully');
        } else {
            console.log('⚠️ Failed to send to Google Sheets, but registration saved');
        }
        
        res.json({ 
            success: true, 
            message: 'Registration successful!',
            registration: newRegistration
        });
        
    } catch (error) {
        console.error('❌ Registration error:', error.message);
        res.status(500).json({ error: 'Registration failed' });
    }
});

app.post('/api/approve/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const registrations = JSON.parse(fs.readFileSync(DATA_FILE));
        
        const registration = registrations.find(r => r.id == id);
        if (!registration) {
            return res.status(404).json({ error: 'Registration not found' });
        }
        
        if (registration.status !== 'Pending') {
            return res.status(400).json({ error: 'Registration already processed' });
        }
        
        // Update registration
        registration.status = 'Approved';
        registration.approvedDate = new Date().toLocaleString();
        registration.emailSent = 'Yes';
        
        fs.writeFileSync(DATA_FILE, JSON.stringify(registrations, null, 2));
        updateExcelFile(registrations);
        
        // Send email
        const emailSubject = ' Your Registration is Approved!';
        const emailSubject2 = '🎉 Your Registration is Approved!';
        const emailBody = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">🎫 Event Registration Approved!</h1>
        <p style="margin: 10px 0 0; opacity: 0.9;">Your ticket is ready</p>
    </div>
    
    <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
        <h2 style="color: #333; margin-bottom: 20px;">Hello ${registration.name},</h2>
        <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            Congratulations! Your registration for <strong>${registration.event}</strong> has been approved. 
            Your ticket details are below. Please save this email for your records.
        </p>
        
        <div style="background: white; padding: 25px; border-radius: 8px; border: 2px solid #667eea; margin: 20px 0;">
            <h3 style="color: #667eea; margin-top: 0;">🎫 Ticket Details</h3>
            <div style="display: grid; grid-template-columns: 120px 1fr; gap: 10px; margin: 15px 0;">
                <strong style="color: #333;">Event:</strong>
                <span style="color: #666;">${registration.event}</span>
                <strong style="color: #333;">Name:</strong>
                <span style="color: #666;">${registration.name}</span>
                <strong style="color: #333;">Ticket ID:</strong>
                <span style="color: #666; font-family: monospace; font-size: 16px; background: #f0f0f0; padding: 4px 8px; border-radius: 4px;">${registration.ticketId}</span>
                <strong style="color: #333;">Date:</strong>
                <span style="color: #666;">${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
        </div>
        
        <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; border-left: 4px solid #4caf50; margin: 20px 0;">
            <h4 style="color: #2e7d32; margin-top: 0;">📍 Important Information</h4>
            <ul style="color: #666; line-height: 1.6; margin: 10px 0;">
                <li>Please present this ticket at the event entrance</li>
                <li>Bring a valid ID for verification</li>
                <li>Arrive 30 minutes before the event starts</li>
            </ul>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
            <p style="color: #999; font-size: 14px; margin: 0;">
                Best regards,<br>
                Event Registration Team
            </p>
        </div>
    </div>
</div>
        `;
        
        const emailSent = await sendEmail(registration.email, emailSubject, emailBody);
        
        // Send to Google Apps Script for real-time updates
        const googleAppsScriptData = {
            action: 'registration_approved',
            data: {
                ...registration,
                status: 'Approved',
                emailSent: emailSent ? 'Yes' : 'No',
                approvedDate: new Date().toLocaleString()
            }
        };
        sendToGoogleAppsScript(googleAppsScriptData);
        
        // Update Google Sheets in real-time
        const googleSheetsUpdated = await updateGoogleSheets({
            ...registration,
            status: 'Approved',
            emailSent: emailSent ? 'Yes' : 'No'
        });
        
        if (googleSheetsUpdated) {
            console.log(' Google Sheets updated in real-time');
        }
        
        res.json({ 
            success: true, 
            message: 'Registration approved and email sent!',
            registration,
            googleSheetsUpdated: googleSheetsUpdated
        });
        
    } catch (error) {
        res.status(500).json({ error: 'Approval failed' });
    }
});

app.post('/api/reject/:id', (req, res) => {
    try {
        const { id } = req.params;
        const registrations = JSON.parse(fs.readFileSync(DATA_FILE));
        
        const registration = registrations.find(r => r.id == id);
        if (!registration) {
            return res.status(404).json({ error: 'Registration not found' });
        }
        
        registration.status = 'Rejected';
        registration.approvedDate = new Date().toLocaleString();
        
        fs.writeFileSync(DATA_FILE, JSON.stringify(registrations, null, 2));
        updateExcelFile(registrations);
        
        res.json({ 
            success: true, 
            message: 'Registration rejected',
            registration
        });
        
    } catch (error) {
        res.status(500).json({ error: 'Rejection failed' });
    }
});

app.get('/api/excel', (req, res) => {
    res.redirect('/api/live-google-sheet');
});

app.get('/api/open-excel', (req, res) => {
    res.redirect('/api/live-google-sheet');
});

app.get('/api/test-data', (req, res) => {
    try {
        const registrations = JSON.parse(fs.readFileSync(DATA_FILE));
        console.log('📊 Test endpoint - registrations loaded:', registrations.length);
        
        res.json({
            success: true,
            message: 'Data loaded successfully',
            count: registrations.length,
            registrations: registrations.slice(0, 3) // Return first 3 for testing
        });
    } catch (error) {
        console.error('❌ Test endpoint error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to load data: ' + error.message
        });
    }
});

app.get('/api/live-google-sheet', (req, res) => {
    try {
        console.log('📊 Loading registrations for Live Google Sheet...');
        const registrations = JSON.parse(fs.readFileSync(DATA_FILE));
        
        console.log(`📊 Found ${registrations.length} registrations:`, registrations);
        
        // Create a simple HTML page with instructions
        const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <title>Google Sheet Access Instructions</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            background: #f5f5f5; 
            padding: 20px;
            line-height: 1.6;
        }
        .container { 
            max-width: 800px; 
            margin: 0 auto; 
            background: white; 
            padding: 30px; 
            border-radius: 10px; 
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        .header { 
            background: #4285f4; 
            color: white; 
            padding: 20px; 
            text-align: center; 
            border-radius: 10px 10px 0 0;
            margin-bottom: 30px;
        }
        .instructions { 
            background: #e8f5e8; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 20px 0;
        }
        .step { 
            background: #f8f9fa; 
            padding: 15px; 
            margin: 10px 0; 
            border-left: 4px solid #4285f4;
        }
        .step-number { 
            display: inline-block; 
            width: 30px; 
            height: 30px; 
            background: #4285f4; 
            color: white; 
            text-align: center; 
            border-radius: 50%; 
            font-weight: bold;
        }
        .link-button { 
            display: inline-block; 
            background: #4285f4; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 6px; 
            margin: 10px 5px;
            cursor: pointer;
            font-weight: 600;
        }
        .link-button:hover { 
            background: #357ae8;
        }
        .data-preview { 
            background: #f8f9fa; 
            padding: 15px; 
            border-radius: 8px; 
            margin: 20px 0;
            font-family: monospace;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>� Google Sheet Access Required</h1>
            <p>Your Google Sheet is not publicly accessible</p>
        </div>
        
        <div class="instructions">
            <h2>📋 To Make Your Google Sheet Public:</h2>
            
            <div class="step">
                <div class="step-number">1</div>
                <div>
                    <strong>Open your Google Sheet:</strong><br>
                    <a href="https://docs.google.com/spreadsheets/d/1_hPPspvMNL8542pfAbdNcJHsAmRKY4a7PFyjw8LrbO4/edit" target="_blank" class="link-button">Open Google Sheet</a>
                </div>
            </div>
            
            <div class="step">
                <div class="step-number">2</div>
                <div>
                    <strong>Click "Share" button:</strong><br>
                    Top right corner → "Share" → "Publish to web"
                </div>
            </div>
            
            <div class="step">
                <div class="step-number">3</div>
                <div>
                    <strong>Set permissions:</strong><br>
                    "Anyone with the link" → "Viewer" (or "Commenter" if you want)
                </div>
            </div>
            
            <div class="step">
                <div class="step-number">4</div>
                <div>
                    <strong>Copy the shareable link:</strong><br>
                    Use this link for public access
                </div>
            </div>
        </div>
        
        <div class="data-preview">
            <h3>📊 Current Registration Data (${registrations.length} entries):</h3>
            <pre>${JSON.stringify(registrations, null, 2)}</pre>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
            <p style="color: #666; font-size: 14px;">
                <strong>⚠️ Note:</strong> The Live Google Sheet view requires your sheet to be publicly accessible.<br>
                Follow the steps above to make it public.
            </p>
        </div>
    </div>
</body>
</html>`;
        
        res.setHeader('Content-Type', 'text/html');
        res.send(htmlContent);
        
    } catch (error) {
        console.error('❌ Failed to create Google Sheet access page:', error.message);
        res.status(500).json({ error: 'Failed to create Google Sheet access page: ' + error.message });
    }
});

// Serve live data HTML page (MUST come before /:filename route)
app.get('/live-data', (req, res) => {
    try {
        const registrations = JSON.parse(fs.readFileSync(DATA_FILE));
        
        let html = `<!DOCTYPE html>
<html>
<head>
    <title>Live Event Registrations</title>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
        h1 { color: #4285f4; text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background: #4285f4; color: white; }
        .status-approved { background: #d4edda; color: #155724; padding: 4px 8px; border-radius: 4px; }
        .status-pending { background: #fff3cd; color: #856404; padding: 4px 8px; border-radius: 4px; }
        .info { background: #e8f5e8; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <h1>📊 Live Event Registrations</h1>
        <div class="info">
            <strong>Total:</strong> ${registrations.length} | 
            <strong>Pending:</strong> ${registrations.filter(r => r.status === 'Pending').length} | 
            <strong>Approved:</strong> ${registrations.filter(r => r.status === 'Approved').length} | 
            <strong>Last Updated:</strong> ${new Date().toLocaleString()}
        </div>
        <table>
            <tr><th>Timestamp</th><th>Name</th><th>Email</th><th>Event</th><th>Status</th><th>Ticket ID</th><th>Approved Date</th><th>Email Sent</th></tr>`;
        
        registrations.forEach(reg => {
            const statusClass = reg.status === 'Approved' ? 'status-approved' : 'status-pending';
            html += `<tr>
                <td>${reg.timestamp}</td>
                <td>${reg.name}</td>
                <td>${reg.email}</td>
                <td>${reg.event}</td>
                <td><span class="${statusClass}">${reg.status}</span></td>
                <td>${reg.ticketId}</td>
                <td>${reg.approvedDate || ''}</td>
                <td>${reg.emailSent}</td>
            </tr>`;
        });
        
        html += `</table></div></body></html>`;
        
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load data: ' + error.message });
    }
});

// Sync all data to Google Sheet
app.get('/api/sync-to-sheets', async (req, res) => {
    try {
        const registrations = JSON.parse(fs.readFileSync(DATA_FILE));
        let successCount = 0;
        
        for (const reg of registrations) {
            const data = {
                action: 'new_registration',
                timestamp: reg.timestamp,
                name: reg.name,
                email: reg.email,
                event: reg.event,
                status: reg.status,
                ticketId: reg.ticketId,
                approvedDate: reg.approvedDate || '',
                emailSent: reg.emailSent
            };
            
            try {
                const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                if (response.ok) {
                    successCount++;
                    console.log(`✅ Synced: ${reg.name} - ${reg.event}`);
                }
            } catch (error) {
                console.error(`❌ Failed to sync: ${reg.name}`, error.message);
            }
        }
        
        res.json({ 
            success: true, 
            message: `Synced ${successCount} of ${registrations.length} registrations to Google Sheet`,
            synced: successCount,
            total: registrations.length
        });
        
    } catch (error) {
        res.status(500).json({ error: 'Sync failed: ' + error.message });
    }
});

// Serve CSV file for download
app.get('/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, filename);
    
    if (fs.existsSync(filePath)) {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        const fileContent = fs.readFileSync(filePath);
        res.send(fileContent);
    } else {
        res.status(404).json({ error: 'File not found' });
    }
});

// Initialize and start server
initializeFiles();

app.listen(PORT, () => {
    console.log(`🚀 Event Registration System running on http://localhost:${PORT}`);
    console.log(`📝 Registration Form: http://localhost:${PORT}`);
    console.log(`👤 Admin Dashboard: http://localhost:${PORT}/admin`);
    console.log(`📊 Excel File: ${EXCEL_FILE}`);
    console.log('\n🎯 System Ready!');
    console.log('1. Fill form at: http://localhost:3001');
    console.log('2. Check Excel file for registrations');
    console.log('3. Approve/reject in admin dashboard');
    console.log('4. Tickets sent automatically to users');
});
