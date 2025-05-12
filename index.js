// index.js
const WebSocket = require('ws'); // استيراد مكتبة WebSocket
const loginToSocket = require('./src/LoginSocket');
const joinRooms = require('./src/joinRooms'); // استيراد دالة joinRooms

loginToSocket({
    username: 'test-bott',
    password: '12345678'
});

// تشغيل joinRooms مباشرة بعد تسجيل الدخول أو عند الحاجة
const socket = new WebSocket('wss://chatp.net:5333/server');

socket.on('open', () => {
    console.log('✅ Connected to WebSocket for joining rooms');

    // استدعاء دالة joinRooms عند الاتصال بالـ WebSocket
    joinRooms(socket);
});

socket.on('error', (error) => {
    console.error('⚠️ WebSocket error:', error);
});
