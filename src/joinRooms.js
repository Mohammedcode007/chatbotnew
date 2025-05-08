const fs = require('fs');
const WebSocket = require('ws');
const roomsFilePath = './rooms.json';

const joinRooms = (socket, username) => {
    if (fs.existsSync(roomsFilePath)) {
        const roomsData = fs.readFileSync(roomsFilePath);
        const rooms = JSON.parse(roomsData);
        console.log('Rooms from JSON:', rooms);

        rooms.forEach((room) => {
            const { username, password, roomName } = room;

            // إرسال طلب تسجيل الدخول
            const loginMessage = {
                handler: 'login',
                username: username,
                password: password,
                session: 'PQodgiKBfujFZfvJTnmM',
                sdk: '25',
                ver: '332',
                id: 'xOEVOVDfdSwVCjYqzmTT'
            };

            // إرسال رسالة تسجيل الدخول عبر WebSocket
            socket.send(JSON.stringify(loginMessage));
            console.log(`🔐 Login request sent for ${username}`);

            socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                console.log('📩 Message received:', data);

                if (data.handler === 'login_event' && data.type === 'success') {
                    console.log(`✅ Login successful for ${username}`);

                    // إرسال طلب الانضمام إلى الغرفة بعد نجاح تسجيل الدخول
                    const joinRoomMessage = {
                        handler: 'room_join',
                        id: 'QvyHpdnSQpEqJtVbHbFY', // استبدل بـ ID الغرفة الفعلي
                        name: roomName
                    };

                    socket.send(JSON.stringify(joinRoomMessage));
                    console.log(`✅ Auto joined room: ${roomName}`);
                } else {
                    console.log(`❌ Login failed for ${username}`);
                }
            };
        });
    } else {
        console.log('⚠️ No rooms.json found.');
    }
};

module.exports = joinRooms;
