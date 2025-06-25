// index.js
const WebSocket = require('ws'); // استيراد مكتبة WebSocket
const loginToSocket = require('./src/LoginSocket');
const {joinRooms} = require('./src/joinRooms'); // استيراد دالة joinRooms
const {processImageAndUpload} = require('./src/handlers/processImageAndUpload'); // استيراد دالة joinRooms

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


const imageUrl = 'https://images.ctfassets.net/hrltx12pl8hq/28ECAQiPJZ78hxatLTa7Ts/2f695d869736ae3b0de3e56ceaca3958/free-nature-images.jpg?fit=fill&w=1200&h=630';
// const imgbbKey = 'f00c125d8886eadb1fa054fcfa76c040';

// processImageAndUpload(imageUrl, imgbbKey).then(url => {
//   if (url) {
//     console.log('✅ Image uploaded:', url);
//     // يمكنك الآن إرسال الرابط في الغرفة كهدية
//   } else {
//     console.log('❌ فشل المعالجة أو الرفع.');
//   }
// });
