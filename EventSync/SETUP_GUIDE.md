# Google Apps Script Event Registration System

## 🎯 Complete Automation Workflow

This system provides an end-to-end event registration automation using Google Forms, Google Sheets, and Gmail with Google Apps Script.

## 📋 System Overview

1. **User Registration** → Google Form submission
2. **Data Storage** → Automatic Google Sheets entry
3. **Admin Approval** → Dashboard or manual sheet update
4. **Email Notification** → Automated Gmail with ticket details
5. **Ticket Generation** → Unique ticket ID creation

## 🚀 Quick Setup Guide

### Step 1: Create Google Form

1. Go to [Google Forms](https://forms.google.com)
2. Create a new form with these fields:
   - Name (Short answer - Required)
   - Email (Short answer - Required)
   - Event Name (Multiple choice or Short answer - Required)
3. Click "Responses" tab
4. Click the Google Sheets icon (green)
5. Create a new spreadsheet named "Event Registrations"
6. Copy the Form ID from the URL: `forms.google.com/forms/[FORM_ID]/edit`

### Step 2: Setup Google Apps Script

1. Open the created Google Sheet
2. Click **Extensions** → **Apps Script**
3. Delete any existing code
4. Copy and paste the entire `Code.gs` content
5. Save the project (Ctrl/Cmd + S)

### Step 3: Create HTML Dashboard

1. In Apps Script editor, click **+** → **HTML**
2. Name the file `Dashboard`
3. Copy and paste the entire `Dashboard.html` content
4. Save the file

### Step 4: Configure System

1. In `Code.gs`, update the configuration:
   ```javascript
   const CONFIG = {
     SHEET_NAME: "Event Registrations",        // Match your sheet name
     FORM_ID: "YOUR_GOOGLE_FORM_ID",           // Replace with actual form ID
     ADMIN_EMAIL: "admin@example.com",         // Replace with your email
     TICKET_PREFIX: "EVT-",
     LOG_SHEET: "System Logs"
   };
   ```

2. Run the `setup()` function:
   - Select `setup` from the function dropdown
   - Click **Run**
   - Grant permissions when prompted

### Step 5: Deploy Web App

1. Click **Deploy** → **New deployment**
2. Choose **Web app**
3. Configuration:
   - Description: "Event Registration Dashboard"
   - Execute as: "Me"
   - Who has access: "Anyone with Google account" (or your domain)
4. Click **Deploy**
5. Copy the Web app URL for dashboard access

### Step 6: Set Up Triggers

1. Click **Triggers** (clock icon) on the left
2. Click **Add Trigger**
3. **Form Submission Trigger:**
   - Function: `onFormSubmit`
   - Event source: "From spreadsheet"
   - Event type: "On form submit"
4. **Edit Trigger:**
   - Function: `onEdit`
   - Event source: "From spreadsheet"
   - Event type: "On edit"

## 🎮 Using the System

### For Users:
1. Fill out the Google Form
2. Receive "Pending" status
3. Wait for admin approval
4. Get approval email with ticket details

### For Admins:
1. **Dashboard Access**: Use the Web app URL from Step 5
2. **Sheet Management**: Directly update status in Google Sheets
3. **Approvals**: Click "Approve" buttons in dashboard
4. **Monitoring**: View statistics and logs

### Play Button Simulation:
1. Open the dashboard
2. Click **"▶️ Play Simulation"**
3. System adds mock data and auto-approves first entry
4. Demonstrates complete workflow

## 📱 Mobile & Desktop Views

The dashboard automatically adapts:

- **Desktop View**: Full table with all features
- **Mobile View**: Card-based layout for touch devices
- **Responsive Design**: Works on tablets and phones

## 🎫 Features Included

### ✅ Core Functionality
- Google Form integration
- Automatic data capture
- Status management (Pending/Approved/Rejected)
- Unique ticket ID generation
- Email notifications with HTML templates
- Admin approval workflow

### ✅ Dashboard Features
- Real-time statistics
- Registration management
- Bulk operations
- Data export (CSV)
- Mobile-responsive design
- Play button simulation

### ✅ Advanced Features
- System logging
- Error handling
- Duplicate prevention
- Custom email templates
- Data validation
- Security controls

## 🔧 Customization Options

### Modify Email Template
Edit the `sendApprovalEmail()` function in `Code.gs` to customize:
- Email design
- Content and branding
- Additional fields
- Attachments

### Add New Form Fields
1. Add fields to Google Form
2. Update column indices in `COLUMNS` object
3. Modify email template accordingly

### Custom Workflows
Add new status options by:
1. Updating data validation in `setup()` function
2. Adding new CSS classes for status badges
3. Implementing custom logic

## 📊 Sheet Structure

Your Google Sheet will have these columns:

| Column | Purpose | Example |
|--------|---------|---------|
| Timestamp | Registration time | "3/31/2026 20:56:00" |
| Name | User's full name | "John Doe" |
| Email | User's email | "john@example.com" |
| Event Name | Selected event | "Tech Summit 2024" |
| Status | Approval status | "Pending/Approved/Rejected" |
| Ticket ID | Unique ticket | "EVT-abc123-XYZ789" |
| Approved Date | Approval timestamp | "3/31/2026 20:58:00" |
| Email Sent | Email status | "Yes/No" |

## 🔒 Security & Permissions

### Required Permissions:
- **Spreadsheet**: Read/write access to registration sheets
- **Gmail**: Send emails on your behalf
- **Script**: Execute functions and manage triggers

### Security Best Practices:
- Deploy with appropriate access levels
- Use domain-specific access for organizations
- Regularly review trigger permissions
- Monitor system logs for unusual activity

## 🚨 Troubleshooting

### Common Issues:

**"Form submission not working"**
- Check Form ID in CONFIG
- Verify form is linked to correct sheet
- Ensure triggers are properly set

**"Email not sending"**
- Verify Gmail permissions
- Check recipient email addresses
- Review system logs for errors

**"Dashboard not loading"**
- Check web app deployment
- Verify function permissions
- Clear browser cache

**"Approval not working"**
- Check column indices in COLUMNS object
- Verify sheet structure matches expected format
- Review onEdit trigger configuration

### Debug Mode:
1. Open Apps Script editor
2. Click **Executions** to see function runs
3. Check **System Logs** sheet for detailed logs
4. Use `Logger.log()` for additional debugging

## 📈 Monitoring & Analytics

### System Logs:
- All activities logged to "System Logs" sheet
- Includes timestamps, types, and messages
- Useful for auditing and troubleshooting

### Statistics:
- Total registrations
- Pending vs approved ratios
- Email delivery rates
- Event popularity

## 🔄 Maintenance

### Regular Tasks:
1. **Weekly**: Review system logs
2. **Monthly**: Clean up old data if needed
3. **Quarterly**: Update email templates
4. **Annually**: Review and renew permissions

### Backup Strategy:
- Google Sheets automatically versioned
- Export data regularly using dashboard
- Keep backup of Apps Script code

## 🎯 Success Metrics

Track these KPIs:
- Registration completion rate
- Approval turnaround time
- Email delivery success rate
- User satisfaction scores
- System uptime

## 🆘 Support

For issues:
1. Check system logs first
2. Review this troubleshooting guide
3. Test with Play button simulation
4. Verify all configurations

---

**🎉 Your Event Registration System is now ready!**

The system will automatically handle registrations, approvals, and email notifications while providing a professional dashboard for management.
