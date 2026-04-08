# 📱 Screen Configuration Guide

## 🔧 How to Add/Edit Screens

### Method 1: Universal Flow Engine (Easiest)
1. Visit: `http://localhost:8080/16-universal-flow-engine.html`
2. Click "+ Add Screen" button
3. Enter:
   - Screen name: "Your Screen Name"
   - Screen type: "form/dashboard/payment/etc"
   - Triggers: "trigger1,trigger2,trigger3"
   - Icon: "📱"
4. Click "Add Screen"

### Method 2: Intelligent Flow Engine
1. Visit: `http://localhost:8080/15-intelligent-flow-engine.html`
2. Check/uncheck screens in "Available Screens"
3. Add user behaviors
4. Generate flow

### Method 3: Edit Code (Advanced)

#### Adding Screens to Intelligent Engine
Edit `15-intelligent-flow-engine.html`:

```javascript
const screenConfigs = {
    'screen-forms': { name: 'Google Forms', icon: '📝', triggers: ['form', 'input', 'submit'] },
    'screen-excel': { name: 'Excel Sheet', icon: '📊', triggers: ['data', 'sync', 'export'] },
    'screen-gmail': { name: 'Gmail', icon: '📧', triggers: ['email', 'notification', 'send'] },
    // ADD NEW SCREEN HERE:
    'screen-payment': { 
        name: 'Payment Gateway', 
        icon: '💳', 
        triggers: ['payment', 'checkout', 'billing', 'transaction'] 
    },
    'screen-api': { 
        name: 'API Dashboard', 
        icon: '🔌', 
        triggers: ['api', 'endpoint', 'integration', 'webhook'] 
    }
};
```

#### Adding Screens to Universal Engine
The Universal Engine works dynamically - no code changes needed!

## 🎯 Screen Examples

### E-commerce Screens:
- **Product Catalog** - triggers: ["product", "browse", "shop"]
- **Shopping Cart** - triggers: ["cart", "add", "remove"]
- **Checkout** - triggers: ["checkout", "address", "shipping"]
- **Payment** - triggers: ["payment", "card", "billing"]

### SaaS Screens:
- **Landing Page** - triggers: ["landing", "home", "visit"]
- **Signup Form** - triggers: ["signup", "register", "create"]
- **Dashboard** - triggers: ["dashboard", "analytics", "metrics"]
- **Settings** - triggers: ["settings", "config", "preferences"]

### Social Media Screens:
- **Feed** - triggers: ["feed", "scroll", "posts"]
- **Profile** - triggers: ["profile", "user", "account"]
- **Messages** - triggers: ["message", "chat", "dm"]
- **Notifications** - triggers: ["notification", "alert", "update"]

## 🔍 Trigger Keywords

### Form-related:
- "form", "input", "submit", "register", "signup", "enter"

### Data-related:
- "data", "sync", "save", "export", "import", "backup"

### Communication:
- "email", "message", "notification", "send", "notify"

### Management:
- "admin", "manage", "approve", "review", "control"

### Payment:
- "payment", "checkout", "billing", "transaction", "purchase"

## 🚀 Quick Setup Examples

### E-commerce Flow:
1. Product: "E-commerce Platform"
2. Screens: Product Catalog, Shopping Cart, Checkout, Payment, Order Confirmation
3. Journey: "Browse products", "Add to cart", "View cart", "Enter payment", "Complete purchase"

### SaaS Flow:
1. Product: "SaaS Platform"
2. Screens: Landing Page, Signup Form, Dashboard, Settings, Billing
3. Journey: "Visit website", "Create account", "Access dashboard", "Configure settings", "Subscribe"

### Social App Flow:
1. Product: "Social Media App"
2. Screens: Feed, Profile, Messages, Notifications, Settings
3. Journey: "Scroll feed", "View profile", "Send message", "Check notifications", "Update settings"

## 💡 Pro Tips

1. **Use specific triggers** - More keywords = better matching
2. **Test different combinations** - See what flows work best
3. **Use auto-detect** - Let the engine find patterns automatically
4. **Save configurations** - Use the save feature for reuse

## 🎬 Video Integration

After adding screens:
1. Generate the flow
2. Click "Watch Professional Video Demo"
3. See your custom screens in action

## 📞 Need Help?

- Check the browser console for errors
- Test with simple screens first
- Use the auto-detect feature for inspiration
- Refer to the examples above
