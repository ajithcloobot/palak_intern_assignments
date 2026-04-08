// Google Apps Script for Real-Time Updates
// Copy this code to your Google Sheet: Script Editor

function doGet() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const data = sheet.getDataRange().getValues();
    
    if (!data || data.length === 0) {
      return HtmlService.createHtmlOutput(`
        <h1>📊 Live Event Registrations</h1>
        <p>No registration data found</p>
      `);
    }
    
    // Create HTML table with data
    let html = '<table border="1" cellpadding="10" style="width:100%; border-collapse:collapse; margin:20px;">';
    html += '<tr style="background:#4285f4; color:white; font-weight:bold;">';
    html += '<th>Timestamp</th><th>Name</th><th>Email</th><th>Event</th><th>Status</th><th>Ticket ID</th><th>Approved Date</th><th>Email Sent</th>';
    html += '</tr>';
    
    data.forEach(row => {
      const statusClass = row[4] === 'Approved' ? 'background:#d4edda; color:#155724; font-weight:bold;' : 
                          row[4] === 'Pending' ? 'background:#fff3cd; color:#856404; font-weight:bold;' : 'background:#f8d7da; color:#721c24; font-weight:bold;';
      
      html += '<tr>';
      html += '<td>' + (row[0] || '') + '</td>';
      html += '<td>' + (row[1] || '') + '</td>';
      html += '<td>' + (row[2] || '') + '</td>';
      html += '<td>' + (row[3] || '') + '</td>';
      html += '<td style="' + statusClass + '">' + (row[4] || '') + '</td>';
      html += '<td>' + (row[5] || '') + '</td>';
      html += '<td>' + (row[6] || '') + '</td>';
      html += '<td>' + (row[7] || '') + '</td>';
      html += '</tr>';
    });
    
    html += '</table>';
    
    return HtmlService.createHtmlOutput(`
      <h1>📊 Live Event Registrations</h1>
      <p><strong>Last Updated:</strong> ${new Date().toLocaleString()}</p>
      <p><strong>Total Registrations:</strong> ${data.length}</p>
      ${html}
      
      <script>
        // Auto-refresh every 30 seconds
        setInterval(() => {
          location.reload();
        }, 30000);
      </script>
    `);
  } catch (error) {
    return HtmlService.createHtmlOutput('<p style="color:red;">Error: ' + error.message + '</p>');
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    if (!data || !data.action) {
      return ContentService.createTextOutput('Error: No data received');
    }
    
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const worksheet = sheet.getActiveSheet();
    
    if (data.action === 'new_registration') {
      // Add new registration to Google Sheet
      worksheet.appendRow([data.timestamp, data.name, data.email, data.event, data.status, data.ticketId, data.approvedDate || '', data.emailSent]);
      
      return ContentService.createTextOutput('Success: Registration added');
    }
    
    if (data.action === 'registration_approved') {
      // Update existing registration
      const range = worksheet.getDataRange();
      const values = range.getValues();
      
      for (let i = 0; i < values.length; i++) {
        if (values[i][1] === data.email && values[i][2] === data.event) {
          values[i][4] = data.status;
          values[i][5] = data.approvedDate || '';
          values[i][6] = data.emailSent;
          break;
        }
      }
      
      range.setValues(values);
      
      return ContentService.createTextOutput('Success: Registration updated');
    }
    
    return ContentService.createTextOutput('Error: Unknown action');
  } catch (error) {
    return ContentService.createTextOutput('Error: ' + error.message);
  }
}

// Function to clear existing data (optional)
function clearSheet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const worksheet = sheet.getActiveSheet();
  worksheet.clear();
}
