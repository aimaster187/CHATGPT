const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory database to store generated keys & revoked list
let database = {
    keys: {
        "PRANAV-PRO-MAX": { deviceId: "", plan: "VIP", expires: "2099-12-31T23:59:59.000Z", status: "ACTIVE" }
    },
    revoked: []
};

// 1. 4D Admin Dashboard UI
app.get('/', (req, res) => {
    let totalKeys = Object.keys(database.keys).length;
    let activeKeys = Object.values(database.keys).filter(k => k.status === "ACTIVE").length;
    let expiredKeys = Object.values(database.keys).filter(k => k.status === "EXPIRED").length;
    let revokedKeys = database.revoked.length;

    let keysHtml = Object.keys(database.keys).map(k => `
        <tr style="border-bottom: 1px solid #30363d;">
            <td style="padding: 10px; color: #00ffcc; font-family: monospace;">${database.keys[k].plan}</td>
            <td style="padding: 10px; color: #ff00ff; font-family: monospace;">${k}</td>
            <td style="padding: 10px; color: #ffff00;">${database.keys[k].expires}</td>
            <td style="padding: 10px;"><span style="color: ${database.keys[k].status === 'ACTIVE' ? '#3fb950' : '#f85149'};">${database.keys[k].status}</span></td>
            <td style="padding: 10px;"><a href="/revoke?key=${k}" style="color: #f85149; text-decoration: none; font-weight: bold;">Revoke</a></td>
        </tr>
    `).join('');

    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>PRANAV SHORT KEY PANEL</title>
            <style>
                body { background: #0b0f19; color: #fff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 15px; margin: 0; }
                .container { max-width: 600px; margin: auto; background: #161b22; padding: 20px; border-radius: 15px; box-shadow: 0 0 25px rgba(0, 255, 204, 0.2); border: 1px solid #30363d; }
                h1 { color: #00ffcc; text-align: center; font-size: 22px; text-shadow: 0 0 10px rgba(0,255,204,0.4); }
                .stats { display: flex; justify-content: space-between; margin: 15px 0; gap: 5px; }
                .stat-box { background: #21262d; flex: 1; padding: 10px; text-align: center; border-radius: 8px; border: 1px solid #30363d; }
                .stat-box h3 { margin: 0; font-size: 18px; color: #00ffcc; }
                .stat-box p { margin: 5px 0 0; font-size: 11px; color: #8b949e; }
                table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px; }
                th { background: #21262d; padding: 10px; color: #8b949e; text-align: left; }
                .form-box { margin-top: 20px; background: #21262d; padding: 15px; border-radius: 10px; border: 1px solid #30363d; }
                input, select { padding: 10px; margin: 6px 0; background: #0d1117; border: 1px solid #30363d; color: #fff; border-radius: 6px; width: 100%; box-sizing: border-box; }
                button { background: linear-gradient(45deg, #00ffcc, #0099ff); color: #000; border: none; padding: 12px; border-radius: 6px; cursor: pointer; font-weight: bold; width: 100%; margin-top: 10px; font-size: 15px; }
                button:hover { opacity: 0.9; }
                .warning { background: #382b01; border: 1px solid #9e6a03; color: #f0883e; padding: 10px; border-radius: 6px; font-size: 12px; margin-bottom: 15px; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>⚡ PRANAV SHORT KEY PANEL ⚡</h1>
                <div class="warning">⚠️ Keep this panel link PRIVATE. Delete se key band nahi hoti — Revoke dabao aur app me online check lagao.</div>
                
                <div class="stats">
                    <div class="stat-box"><h3>${totalKeys}</h3><p>TOTAL KEYS</p></div>
                    <div class="stat-box"><h3 style="color:#3fb950;">${activeKeys}</h3><p>ACTIVE</p></div>
                    <div class="stat-box"><h3 style="color:#f85149;">${expiredKeys}</h3><p>EXPIRED</p></div>
                    <div class="stat-box"><h3 style="color:#ff7b72;">${revokedKeys}</h3><p>REVOKED</p></div>
                </div>

                <div class="form-box">
                    <h3 style="margin-top:0; color:#00ffcc;">🔑 Generate Key</h3>
                    <form action="/generate" method="POST">
                        <input type="text" name="device_id" placeholder="Buyer's Device ID (Optional)">
                        <input type="text" name="custom_key" placeholder="Custom Key (leave blank for random)">
                        <select name="plan">
                            <option value="1day">1 Day Pass</option>
                            <option value="7days">7 Days Pass</option>
                            <option value="30days">30 Days Pass</option>
                            <option value="6months">6 Months VIP</option>
                            <option value="lifetime">LIFETIME (10 Years)</option>
                        </select>
                        <button type="submit">GENERATE KEY</button>
                    </form>
                </div>

                <h3 style="margin-top:20px;">📋 All Keys</h3>
                <div style="overflow-x: auto;">
                    <table>
                        <tr><th>Plan</th><th>Key</th><th>Expires</th><th>Status</th><th>Action</th></tr>
                        ${keysHtml}
                    </table>
                </div>
            </div>
        </body>
        </html>
    `);
});

// 2. Generate Key Logic
app.post('/generate', (req, res) => {
    let { device_id, custom_key, plan } = req.body;
    let keyName = custom_key ? custom_key.trim() : "PRANAV-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    
    let expiryDate = new Date();
    if (plan === "1day") expiryDate.setDate(expiryDate.getDate() + 1);
    else if (plan === "7days") expiryDate.setDate(expiryDate.getDate() + 7);
    else if (plan === "30days") expiryDate.setDate(expiryDate.getDate() + 30);
    else if (plan === "6months") expiryDate.setMonth(expiryDate.getMonth() + 6);
    else if (plan === "lifetime") expiryDate.setFullYear(expiryDate.getFullYear() + 10);

    database.keys[keyName] = {
        deviceId: device_id || "",
        plan: plan.toUpperCase(),
        expires: expiryDate.toISOString(),
        status: "ACTIVE"
    };

    res.redirect('/');
});

// 3. Revoke Key Route
app.get('/revoke', (req, res) => {
    let keyToRevoke = req.query.key;
    if (database.keys[keyToRevoke]) {
        database.keys[keyToRevoke].status = "EXPIRED";
        database.revoked.push(keyToRevoke);
    }
    res.redirect('/');
});

// 4. App License Verification API (Jo app check karegi)
app.post('/api/license/verify-android', (req, res) => {
    const { license_key, device_id } = req.body;
    console.log(`Verify Request -> Key: ${license_key}, Device: ${device_id}`);

    let keyData = database.keys[license_key];

    // Agar key database mein exist karti hai aur active hai
    if (keyData && keyData.status === "ACTIVE") {
        // Check if expired by date
        if (new Date() > new Date(keyData.expires)) {
            keyData.status = "EXPIRED";
            return res.json({ success: false, message: "Key expired ho chuki hai!" });
        }

        return res.json({
            success: true,
            message: "Key verified successfully!",
            entitlement: "licensed",
            tier: "promax",
            expires_at: keyData.expires
        });
    }

    // Agar admin ne revoke kar di ya key galat hai
    res.json({
        success: false,
        message: "Invalid or revoked key!"
    });
});

// 5. App Bootstrap & Heartbeat Endpoints
app.post('/api/android/bootstrap', (req, res) => {
    res.json({
        ok: true,
        entitlement: "licensed",
        tier: "promax",
        subscription: { plan: "VIP", status: "active", expires_at: "2099-12-31" },
        pricing: { promaxLifetime: 0 },
        config: {}
    });
});

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
    console.log(`PRANAV Panel Server is running on port ${PORT}`);
});
