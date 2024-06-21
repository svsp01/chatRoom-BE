const express = require('express')
const app = express()
const socketIo = require('socket.io')
const server = require('http').createServer(app);
const bodyParser = require('body-parser')
const cors = require('cors')
const io = socketIo(server, {
    cors: {
        origin: 'http://localhost:3000'
    }
})

const users = new Map()

app.use(cors())
app.use(bodyParser.json())
app.post('/login', (req, res) => {
    try {
        const { username } = req.body
        // if (!username) {
        //     return res.status(400).json({ error: 'Username is required' })
        // }
        const userId = Math.random().toString(36)
        users.set(userId, username)
        res.json({ userId, username })
    } catch (error) {
        console.error('Login error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

io.on('connection', (socket) => {
    
    socket.on('join', ({ userId }) => {
        const username = users.get(userId)
        if (username) {
            socket.username = username
            console.log(`User ${username} joined with ID: ${socket.id}`)
            io.emit('message', {
                id: 'system',
                message: `${username} has joined the chat`
            })
        }
    })
    
    console.log('client connected:', socket.username)
    socket.on('chatMessage', (msg) => {
        console.log('Message received:', msg)
        io.emit('message', {
            id:`${socket.id}`,
            username: socket.username,
            message:msg
        })
    })

    socket.on('disconnect', (reason) => {
        console.log(reason)
        io.emit('message', `User disconnected: ${socket.username}`)
    })
})

server.listen(8000, err => {
    if (err) console.log(err)
    console.log('Server running on Port ', 8000)
})