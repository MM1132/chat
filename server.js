const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const dateAndTime = require('date-and-time')
const sqlite3 = require('sqlite3')//.verbose()

/* db.run(`
CREATE TABLE IF NOT EXISTS messages
(
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    date DATE NOT NULL, 
    message TEXT NOT NULL
)
`) */

const insertMessage = (message) => {
    return new Promise((resolve, reject) => {
        // Open the DB
        const db = new sqlite3.Database('./storage.db', sqlite3.OPEN_READWRITE, err => {
            if(err) return reject(err.message)
        })

        // Insert message
        db.run(
            `INSERT INTO messages (date, message) VALUES(datetime(), ?)`, 
            [ message ], 
            err => {
                if(err) {
                    return reject(err.message)
                }
                return resolve()
            }
        )

        // Close DB
        db.close(err => {
            if(err) return reject(err.message)
        })
    })
}

const sendRecentMessages = (socket, number) => {
    return new Promise((resolve, reject) => {
        // Open the DB
        const db = new sqlite3.Database('./storage.db', sqlite3.OPEN_READWRITE, err => {
            if(err) return reject(err.message)
        })

        // Get messages
        db.all(`SELECT * FROM (SELECT date, message FROM messages ORDER BY date DESC LIMIT ?) ORDER BY date ASC`, [ number ], (err, rows) => {
            if(err) return reject(err.message)
            rows.forEach(data => {
                socket.emit('message', data)
            })
            // Once all the data has been emitted
            return resolve()
        })

        // Close DB
        db.close(err => {
            if(err) return reject(err.message)
        })
    })
}

const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.use(express.static(path.join(__dirname, 'public')))

// New connection
io.on('connection', socket => {
    // Update the user with the 100 latest messages
    sendRecentMessages(socket, 100)
    .catch(err => {
        console.log(err)
    })

    socket.on('message', message => {
        insertMessage(message)
        .then(_ => {
            sendRecentMessages(io, 1)
        })
        .catch(err => {
            console.log(err)
        })
        .catch(err => {
            console.log(err)
        })

        // Update all the users with the very latest message sent
        //sendRecentMessages(io, 1)
    })
})

const PORT = 8080
server.listen(PORT, _ => {
    console.log(`Chat server started at port ${PORT}`)
})