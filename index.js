const express = require('express')
const speakeasy = require('speakeasy')
const uuid = require('uuid')
const { JsonDB } = require('node-json-db')
const { Config } = require('node-json-db/dist/lib/JsonDBConfig')

const app = express()
app.use(express.json())
const PORT = process.env.PORT || 5000

// Database
const db = new JsonDB(new Config('myDatabase', true, true, '/'))

/*
* Section: Routes
*/
app.get('/api', (req, res) => {
    res.json({ message: 'Welcome to my 2fa project' })
})

// Register user
app.post('/api/register', (req, res) => {
    // Generate uuid (jsondb doesn't do this on its own)
    const id = uuid.v4()
    const path = `/user/${id}`

    try {
        const tempSecret = speakeasy.generateSecret()
        db.push(path, { id, tempSecret })
        res.json({ id, tempSecret: tempSecret.base32 }) // normally you'd send username/pass here too
    } catch (e) {
        console.log(e)
        res.status(500).json({ message: 'Error registering user' })
    }
})

// Verify auth token and make secret permanent
app.post('/api/verify', (req, res) => {
    const { userId, token } = req.body

    try {
        const path = `/user/${userId}`
        user = db.getData(path)
        console.log(user)
        const { base32:userSecret } = user.tempSecret

        verified = speakeasy.totp.verify({
            secret: userSecret,
            encoding: 'base32',
            token
        })

        if (verified) {
            db.push(path, { id: userId, secret: user.tempSecret })
            res.json({ verified: true })
        } else {
            res.json({ verified: false }) // you could use this response in the front-end
        }
    } catch (e) {
        console.log(e)
        res.status(500).json({ message: 'Error verifying token' })
    }
}) 

/* 
* End section: Routes
*/

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
