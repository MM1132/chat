const socket = io()

const chatForm = document.querySelector('#chat-form')
chatForm.addEventListener('submit', e => {
    // Make it not actually make a request the default way
    e.preventDefault()

    // Get the input element
    const inputElement = document.querySelector('#msg')

    // Get the text and trim in just in case
    let message = inputElement.value.trim()
    // If the field was empty, do nothing
    if(!message) return

    // Clear the input field
    inputElement.value = ''

    // Emit the socket thing, essentially send the message to the server
    socket.emit('message', message)
})

const chatMessages = document.querySelector('.chat-messages')
socket.on('message', message => {
    // Message container
    let msgElement = document.createElement('div')
    msgElement.classList.add('message-container')
    
    // Date
    let dateElement = document.createElement('div')
    dateElement.classList.add('message-date')
    dateElement.textContent = 'Today'
    msgElement.appendChild(dateElement)

    // Author
    let authorElement = document.createElement('div')
    authorElement.classList.add('message-author')
    authorElement.textContent = 'Stranger'
    msgElement.appendChild(authorElement)

    // Text
    let textElement = document.createElement('div')
    textElement.classList.add('message-text')
    textElement.textContent = message
    msgElement.appendChild(textElement)

    chatMessages.appendChild(msgElement)
})