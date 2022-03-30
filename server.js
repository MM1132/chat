const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.use(express.static(path.join(__dirname, 'public')))

// When client connects
io.on('connection', socket => {
    console.log('New websocket connection')

    socket.on('message', message => {
        io.emit('message', message)
    })
})

const PORT = 8080
server.listen(PORT, _ => {
    console.log(`Chat server started at port ${PORT}`)
})