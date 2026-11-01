const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory storage for custom keys & plans (4D Admin panel style)
let customKeys = {
    "PRANAV-PRO-MAX": { plan: "lifetime", expires: "2099-12-31" },
    "MAYA-6MONTH-VIP": { plan: "6months", expires: "2027-06-30" },
    "MAYA-1DAY-PASS": { plan: "1day", expires: "2026-12-31" }
};

// 1. 4D HTML Admin Dashboard (Browser mein kholne par dikhega)
app.get('/', (req, res) => {
    let keysHtml = Object.keys(customKeys).map(k => `
        <tr style="border-bottom: 1px solid #444;">
            <td style="padding: 10px; color: #00ffcc;">${k}</td>
            <td style="padding: 10px; color: #ff00ff;">${customKeys[k].plan}</td>
            <td style="padding: 10px; color: #ffff00;">${customKeys[k].expires}</td>
        </tr>
    `).join('');

    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Maya 4D Admin Panel</title>
            <style>
                body { background: #0b0f19; color: #fff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; }
                .container { max-width: 700px; margin: auto; background: #161b22; padding: 25px; border-radius: 15px; box-shadow: 0 0 20px rgba(0, 255, 204, 0.3); border: 1px solid #30363d; }
                h1 { color: #00ffcc; text-align: center; text-shadow: 0 0 10px rgba(0,255,204,0.5); }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th { background: #21262d; padding: 12px; color: #8b949e; text-align: left; }
                .add-box { margin-top: 20px; background: #21262d; padding: 15px; border-radius: 10px; }
                input, select { padding: 10px; margin: 5px 0; background: #0d1117; border: 1px solid #30363d; color: #fff; border-radius: 5px; width: calc(100% - 22px); }
                button { background: #238636; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-weight: bold; width: 100%; margin-top: 10px; }
                button:hover { background: #2ea043; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>⚡ Maya 4D Admin Dashboard ⚡</h1>
                <p style="text-align: center; color: #8b949e;">Owner: Pranav Ji | Server Status: <span style="color: #3fb950;">ONLINE</span></p>
                
                <h3>Active License Keys</h3>
                <table>
                    <tr><th>License Key</th><th>Plan / Duration</th><th>Expires At</th></tr>
                    ${keysHtml}
                </table>

                <div class="add-box">
                    <h3>Generate New Key</h3>
                    <form action="/add-key" method="POST">
                        <input type="text" name="new_key" placeholder="Enter Custom Key (e.g. PRANAV-VIP)" required>
                        <select name="plan">
                            <option value="1day">1 Day Pass</option>
                            <option value="6months">6 Months VIP</option>
                            <option value="lifetime">Lifetime ProMax</option>
                        </select>
                        <button type="submit">Create Key</button>
                    </form>
                </div>
            </div>
        </body>
        </html>
    `);
});

// 2. Admin se nayi key add karne ka route
app.post('/add-key', (req, res) => {
    const { new_key, plan } = req.body;
    let expires = "2099-12-31";
    if (plan === "1day") expires = "2026-12-31";
    if (plan === "6months") expires = "2027-06-30";
    
    if (new_key) {
        customKeys[new_key] = { plan, expires };
    }
    res.redirect('/');
});

// 3. App Key Verification Endpoint (Har ek plan aur random key ko handle karega)
app.post('/api/license/verify-android', (req, res) => {
    const { license_key, device_id } = req.body;
    console.log(`Key check request: ${license_key} for device: ${device_id}`);
    
    // Agar key database mein hai ya user ne random daali hai, usko active maan lo
    let userPlan = "lifetime";
    let expiryDate = "2099-12-31T23:59:59.000Z";

    if (customKeys[license_key]) {
        userPlan = customKeys[license_key].plan;
        expiryDate = customKeys[license_key].expires + "T23:59:59.000Z";
    }

    res.json({
        success: true,
        message: "License verified successfully!",
        entitlement: "licensed",
        tier: "promax",
        duration: userPlan,
        expires_at: expiryDate
    });
});

// 4. App Bootstrap Endpoint
app.post('/api/android/bootstrap', (req, res) => {
    res.json({
        ok: true,
        entitlement: "licensed",
        tier: "promax",
        subscription: {
            plan: "lifetime",
            status: "active",
            expires_at: "2099-12-31"
        },
        pricing: { promaxLifetime: 0 },
        config: {}
    });
});

// 5. App Heartbeat Endpoint
app.post('/api/android/heartbeat', (req, res) => {
    res.json({
        ok: true,
        action: "none",
        entitlement: "licensed",
        tier: "promax"
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`4D Admin Server is running on port ${PORT}`);
});
