// src/loginToSocket.js
const WebSocket = require('ws');
const { WEBSOCKET_URL, DEFAULT_SESSION, DEFAULT_SDK, DEFAULT_VER, DEFAULT_ID } = require('./constants');
const handleLoginCommand = require('./handlers/handleLoginCommand');
const handleJoinCommand = require('./handlers/handleJoinCommand');
const handleInfoCommand = require('./handlers/handleInfoCommand');
const handleLanguageCommand = require('./handlers/handleLanguageCommand');

const loginToSocket = ({ username, password, joinRoom }) => {
    const socket = new WebSocket(WEBSOCKET_URL);

    socket.onopen = () => {
        console.log(`✅ Connected to WebSocket for ${username}`);

        const loginMessage = {
            handler: 'login',
            username,
            password,
            session: DEFAULT_SESSION,
            sdk: DEFAULT_SDK,
            ver: DEFAULT_VER,
            id: DEFAULT_ID
        };

        socket.send(JSON.stringify(loginMessage));
        console.log('🔐 Login message sent.');
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('📩 Message received:5', data);

        if (data.handler === 'chat_message' && data.body) {
            const body = data.body.trim();

            if (body.startsWith('login#')) {
                handleLoginCommand(body, data.from, socket);
            }

            if (body.startsWith('join@')) {
                handleJoinCommand(body, data.from, socket);
            }


            // إضافة معالجة لـ info
            if (data.body === 'info') {
                handleInfoCommand(data.body, data.from, socket);
            }
            if (data.body.startsWith('lang@')) {
                handleLanguageCommand(data.body, data.from, socket);
            }
        }
    };

    socket.onerror = (err) => {
        console.error('❌ WebSocket error:', err);
    };
};

module.exports = loginToSocket;
