const express = require('express');
const app = express();

app.use(express.json());

// Server check karne ke liye root route
app.get('/', (req, res) => {
    res.send('Maya License Server is Running Live & 4D!');
});

// Key verification endpoint
app.post('/api/license/verify-android', (req, res) => {
    const { license_key, device_id } = req.body;
    console.log(`Key check request aayi hai: ${license_key} for device: ${device_id}`);
    
    res.json({
        success: true,
        message: "Key ekdum valid hai, Pranav ji!",
        entitlement: "licensed",
        tier: "promax"
    });
});

// App Bootstrap Endpoint
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

// App Heartbeat Endpoint
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
