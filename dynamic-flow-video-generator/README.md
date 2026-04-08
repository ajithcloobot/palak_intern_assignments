# EventSync Presentation Package

Complete visual presentation package for the EventSync event registration management system.

## 📁 File Structure

```
EventSync-Presentation/
├── 01-user-journey-flowchart.html      # 4-step user flow diagram
├── 02-wireframe-registration-form.html # Mobile + Desktop form mockups
├── 03-wireframe-admin-dashboard.html   # Admin approval interface
├── 04-wireframe-google-sheets.html   # Google Sheets integration view
├── 05-benefits-section.html            # 4-column benefits grid
├── 06-tech-stack.html                  # Technology stack display
├── presentation.html                   # Combined interactive presentation
└── README.md                           # This file
```

## 🎨 Design System

- **Primary Color:** #667eea (Purple)
- **Secondary Color:** #764ba2 (Dark Purple)
- **Background:** #f5f7fa (Light Gray)
- **Typography:** System fonts (Inter/Roboto fallback)
- **Style:** Modern, minimal, professional

## 🚀 Viewing the Presentation

### Option 1: Interactive Presentation (Recommended)
Open `presentation.html` in a browser for a complete scrollable presentation with all sections.

### Option 2: Individual Wireframes
Open each HTML file separately to view specific wireframes at full resolution.

### Option 3: Local Server
```bash
cd EventSync-Presentation
python3 -m http.server 8080
```
Then visit: http://localhost:8080/presentation.html

## 📸 Generating PNG Exports

To convert HTML wireframes to PNG images:

### Using Browser Screenshot:
1. Open each HTML file in Chrome/Firefox
2. Press F12 → Toggle device toolbar (Ctrl+Shift+M)
3. Set resolution to 1440x900 or desired size
4. Right-click → Screenshot → Capture full size

### Using Playwright (automated):
```bash
npm install playwright
npx playwright install chromium
node screenshot.js
```

## 📋 Deliverables Summary

| File | Description |
|------|-------------|
| 01-user-journey-flowchart | 4-step visual flow: Registration → Sync → Review → Email |
| 02-wireframe-registration-form | Responsive form (mobile 300px + desktop 480px) |
| 03-wireframe-admin-dashboard | List view with approve/reject actions |
| 04-wireframe-google-sheets | Google Sheets UI mock with sample data |
| 05-benefits-section | 4-column feature grid with icons |
| 06-tech-stack | 5-item technology stack display |
| presentation.html | Combined interactive version |

## 🎯 EventSync Overview

**EventSync** is a real-time event registration system featuring:
- User registration form with instant Google Sheets sync
- Admin dashboard for one-click approve/reject
- Automatic email ticket delivery
- Mobile-responsive design
- Google Apps Script integration

---

**Ready for stakeholder review!**
