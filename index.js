const express = require('express');

const app = express();

const PORT = process.env.PORT || 5000;

app.get('/api', (req, res) => {
    res.json({ message: 'Welcome to my 2fa project' })
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
