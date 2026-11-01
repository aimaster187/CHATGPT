const express = require('express');
const app = express();

app.use(express.json());

// Server check karne ke liye root route
app.get('/', (req, res) => {
    res.send('Maya License Server is Running Live & 4D!');
});

// 1. License Verify Endpoint
app.post('/api/license/verify-android', (req, res) => {
    const { license_key, device_id } = req.body;
    console.log(`Key check request aayi hai: ${license_key} for device: ${device_id}`);
    
    res.json({
        success: true,
        message: "Key ekdum valid hai, bhai!",
        entitlement: "licensed",
        tier: "promax"
    });
});

// 2. App Bootstrap Endpoint
app.post('/api/android/bootstrap', (req, res) => {
    res.json({
        ok: true,
        entitlement: "licensed",
        tier: "promax",
        pricing: {
            promaxLifetime: 0
        },
        config: {}
    });
});

// 3. Heartbeat Endpoint
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
    console.log(`Server is running on port ${PORT}`);
});
