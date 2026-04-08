# 🚀 VS Code Setup Guide - Cloobot Authentication System

This guide will help you set up the Cloobot project in VS Code for optimal development experience.

## 📋 Prerequisites

- **VS Code** installed
- **Python Extension** for VS Code
- **Node.js Extension Pack** for VS Code

## 🛠️ VS Code Setup

### 1. Open Project in VS Code

```bash
# Navigate to project directory
cd "Okta project CB"

# Open in VS Code
code .
```

### 2. Install Recommended Extensions

When you open the project, VS Code will prompt you to install recommended extensions. Click **Install All**.

**Required Extensions:**
- **Python** - Python language support
- **Black Formatter** - Python code formatting
- **Flake8** - Python linting
- **Tailwind CSS IntelliSense** - TailwindCSS support
- **Prettier** - Code formatting
- **ESLint** - JavaScript/TypeScript linting

### 3. Setup Virtual Environment (if not done)

Open terminal in VS Code (`Ctrl+\``) and run:

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r ../requirements.txt
```

### 4. Install Frontend Dependencies

```bash
cd frontend
npm install
```

## 🎯 Running the Application

### Method 1: Using VS Code Tasks (Recommended)

1. **Open Command Palette**: `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
2. **Type**: `Tasks: Run Task`
3. **Choose**:
   - `Start Backend` - Runs the FastAPI server
   - `Start Frontend` - Runs the React dev server
   - `Setup Project` - Installs all dependencies

### Method 2: Using Debug Configuration

1. **Go to Run and Debug panel**: `Ctrl+Shift+D`
2. **Select configuration**:
   - `Run Backend Server` - Debug backend
   - `Run Frontend Dev Server` - Debug frontend
   - `Run Full Stack` - Run both simultaneously

### Method 3: Using Integrated Terminal

1. **Open terminal**: `Ctrl+\``
2. **Split terminal** for backend and frontend

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
python main.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## 🔧 VS Code Features Configured

### ✨ Python Support
- **Auto-completion** for Python code
- **Linting** with Flake8
- **Formatting** with Black (on save)
- **IntelliSense** for better code suggestions
- **Virtual environment** automatically detected

### ✨ JavaScript/React Support
- **TailwindCSS IntelliSense** for CSS classes
- **ESLint** for code quality
- **Prettier** for code formatting
- **Auto-completion** for React components

### ✨ Workspace Configuration
- **File exclusion** for `node_modules`, `venv`, `__pycache__`
- **Search exclusion** for better performance
- **Python interpreter** set to project virtual environment
- **Format on save** enabled

## 🎨 Project Structure in VS Code

```
📁 Okta project CB/
├── 📁 backend/          # Python FastAPI
│   ├── 🐍 main.py        # Main application
│   ├── 🐍 auth_routes.py # Authentication endpoints
│   ├── 🐍 models.py      # Database models
│   ├── 🐍 database.py    # Database config
│   ├── 🐍 utils.py       # JWT & password utils
│   └── 📁 venv/          # Virtual environment
├── 📁 frontend/         # React App
│   ├── 📁 src/
│   │   ├── 📁 components/ # React components
│   │   ├── 📁 contexts/  # Auth context
│   │   ├── 📁 pages/     # Page components
│   │   ├── 📁 services/  # API services
│   │   └── ⚛️ App.jsx    # Main app
│   ├── 📦 package.json
│   └── 📁 node_modules/
├── 📁 .vscode/          # VS Code configuration
│   ├── ⚙️ settings.json
│   ├── 🐛 launch.json
│   ├── 📋 tasks.json
│   └── 📦 extensions.json
├── 📄 requirements.txt   # Python dependencies
├── 📄 .env.example      # Environment template
└── 📄 README.md         # Project documentation
```

## 🚀 Quick Start in VS Code

### 1. Open Project
```bash
code "Okta project CB"
```

### 2. Install Dependencies
- `Ctrl+Shift+P` → `Tasks: Run Task` → `Setup Project`

### 3. Start Development
- `Ctrl+Shift+P` → `Tasks: Run Task` → `Start Backend`
- `Ctrl+Shift+P` → `Tasks: Run Task` → `Start Frontend`

### 4. Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 🐛 Debugging in VS Code

### Backend Debugging
1. Set breakpoints in Python files
2. Go to Run and Debug panel
3. Select `Run Backend Server`
4. Press F5 to start debugging

### Frontend Debugging
1. Set breakpoints in JavaScript/JSX files
2. Go to Run and Debug panel
3. Select `Run Frontend Dev Server`
4. Press F5 to start debugging

## 🔍 Useful VS Code Shortcuts

| Shortcut | Function |
|----------|----------|
| `Ctrl+\`` | Open integrated terminal |
| `Ctrl+Shift+P` | Command palette |
| `Ctrl+Shift+D` | Run and debug |
| `Ctrl+Shift+E` | File explorer |
| `Ctrl+P` | Quick open file |
| `F12` | Go to definition |
| `Shift+F12` | Find references |
| `Ctrl+Shift+X` | Extensions |

## 🎯 Development Workflow

1. **Open project** in VS Code
2. **Run tasks** to start servers
3. **Edit code** with full IntelliSense
4. **Debug** using breakpoints
5. **Format** code automatically on save
6. **Test** changes in browser

## 🆘 Troubleshooting

### Python Interpreter Issues
- Open Command Palette → `Python: Select Interpreter`
- Choose `./backend/venv/bin/python`

### Extension Issues
- Reload VS Code: `Ctrl+Shift+P` → `Developer: Reload Window`
- Check if all recommended extensions are installed

### Task Issues
- Check terminal paths in `tasks.json`
- Ensure virtual environment is activated

### Linting/Formatting Issues
- Restart VS Code after installing extensions
- Check settings in `.vscode/settings.json`

## 🎉 You're Ready!

Your Cloobot authentication system is now fully configured for VS Code development with:
- ✅ Intelligent code completion
- ✅ Automatic formatting
- ✅ Debugging capabilities
- ✅ Task automation
- ✅ Extension support

Happy coding! 🚀
