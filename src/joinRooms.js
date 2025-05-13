

const WebSocket = require('ws');
const path = require('path');
const { loadRooms, saveRooms } = require('./fileUtils'); // تأكد من وجود دالة loadRooms و saveRooms
const { createRoomMessage } = require('./messageUtils'); // تأكد من وجود دالة createRoomMessage
const { addToList, removeFromList, blockUser, blockRoom, addVerifiedUser, removeVerifiedUser, unblockUser, unblockRoom } = require('./handlers/manageLists'); // استيراد الدوال الجديدة
const { disableWelcomeMessage, enableWelcomeMessage, setWelcomeMessage } = require('./handlers/handleWelocome');
const { sendHelpInformation } = require('./handlers/sendHelpInformation')
const { handleUserCommands } = require('./handlers/handleUserCommands.')
const { getUserLanguage } = require('./fileUtils'); // ✅ استيراد دالة اللغة

function joinRooms() {
    const rooms = loadRooms(path.join(__dirname, 'rooms.json'));

    rooms.forEach(room => {
        const socket = new WebSocket('wss://chatp.net:5333/server');
        const { master, users } = room;

        // حفظ معلومات الغرفة في الـ socket
        socket.roomInfo = room;
        socket._processedAddMas = new Set(); // لتجنب التكرار في التعامل مع addmas@

        socket.on('open', () => {
            // إرسال طلب تسجيل الدخول
            const loginMessage = {
                handler: 'login',
                username: room.username,
                password: room.password,
                session: 'PQodgiKBfujFZfvJTnmM',
                sdk: '25',
                ver: '332',
                id: 'xOEVOVDfdSwVCjYqzmTT'
            };
            socket.send(JSON.stringify(loginMessage));
            console.log(`🔐 Login sent for ${room.username}`);
        });

        socket.on('message', (event) => {
            const data = JSON.parse(event);
            let senderName = data.from
            let roomName = data.room
            const currentLanguage = getUserLanguage(senderName) || 'en'; // الحصول على لغة المستخدم الحالية

            // ✅ عند تسجيل الدخول بنجاح، قم بالانضمام إلى الغرفة
            if (data.handler === 'login_event' && data.type === 'success') {
                // الانضمام للغرفة باستخدام الـ roomName الخاص بكل غرفة
                const joinRoomMessage = {
                    handler: 'room_join',
                    id: 'QvyHpdnSQpEqJtVbHbFY', // أو يمكن تغيير هذا إلى المعرف الصحيح للغرفة
                    name: room.roomName // استخدم اسم الغرفة الموجود في الـ room
                };
                socket.send(JSON.stringify(joinRoomMessage));
                console.log(`🚪 Sent join request to room: ${room.roomName}`);
                return;
            }

            // التعامل مع أوامر إضافية مثل addmas@
            if (data.handler === 'room_event' && data.body && data.body.startsWith('addmas@')) {
                const targetUsername = data.body.split('@')[1];  // الحصول على اسم المستخدم بعد addmas@
                if (master === senderName) {
                    console.log(`🔄 Adding ${targetUsername} to master list in room: ${data.room}`);
                    const targetRoomIndex = rooms.findIndex(room => room.roomName === data.room);
                    if (targetRoomIndex !== -1) {
                        const targetRoom = rooms[targetRoomIndex];
                        if (!targetRoom.masterList) {
                            targetRoom.masterList = [];
                        }
                        if (!targetRoom.masterList.includes(targetUsername)) {
                            targetRoom.masterList.push(targetUsername);
                            console.log(`✅ Added ${targetUsername} to masterList in room "${data.room}"`);
                            const message = currentLanguage === 'ar'
                                ? `✅ تم إضافة ${targetUsername} إلى قائمة الماستر في الغرفة "${data.room}".`
                                : `✅ ${targetUsername} has been added to the master list in room "${data.room}".`;
                            const confirmationMessage = createRoomMessage(data.room, message);
                            socket.send(JSON.stringify(confirmationMessage));
                        } else {
                            const warningMessage = currentLanguage === 'ar'
                                ? `❌ ${targetUsername} موجود بالفعل في قائمة الماستر.`
                                : `❌ ${targetUsername} is already in the master list.`;
                            const errorMessage = createRoomMessage(data.room, warningMessage);
                            socket.send(JSON.stringify(errorMessage));
                        }
                    }
                    saveRooms(rooms);
                } else {
                    const warningMessage = currentLanguage === 'ar'
                        ? '❌ أنت لست ماستر الغرفة ولا يمكنك إضافة المستخدمين إلى قائمة الماستر.'
                        : '❌ You are not the master of the room and cannot add users to the master list.';
                    const errorMessage = createRoomMessage(data.room, warningMessage);
                    socket.send(JSON.stringify(errorMessage));
                }
            }
            if (data.handler === 'room_event' && data.body && data.body.startsWith('removemas@')) {
                const targetUsername = data.body.split('@')[1];
                if (master === senderName) {
                    console.log(`🔄 Removing ${targetUsername} from master list in room: ${roomName}`);
                    const updatedRooms = rooms.map(r => {
                        if (r.roomName === roomName) {
                            if (r.masterList) {
                                if (r.masterList.includes(targetUsername)) {
                                    r.masterList = r.masterList.filter(user => user !== targetUsername);
                                    console.log(`✅ Removed ${targetUsername} from masterList in room "${roomName}"`);
                                    const message = currentLanguage === 'ar'
                                        ? `✅ تم إزالة ${targetUsername} من قائمة الماستر في الغرفة "${roomName}".`
                                        : `✅ ${targetUsername} has been removed from the master list in room "${roomName}".`;
                                    const confirmationMessage = createRoomMessage(roomName, message);
                                    socket.send(JSON.stringify(confirmationMessage));
                                } else {
                                    const warningMessage = currentLanguage === 'ar'
                                        ? `❌ ${targetUsername} غير موجود في قائمة الماستر.`
                                        : `❌ ${targetUsername} is not in the master list.`;
                                    const errorMessage = createRoomMessage(roomName, warningMessage);
                                    socket.send(JSON.stringify(errorMessage));
                                }
                            }
                        }
                        return r;
                    });
                    saveRooms(updatedRooms);
                } else {
                    const warningMessage = currentLanguage === 'ar'
                        ? '❌ أنت لست ماستر الغرفة ولا يمكنك إزالة المستخدمين من قائمة الماستر.'
                        : '❌ You are not the master of the room and cannot remove users from the master list.';
                    const errorMessage = createRoomMessage(roomName, warningMessage);
                    socket.send(JSON.stringify(errorMessage));
                }
            }

            if (data.handler === 'room_event' && data.body && data.body.startsWith('ver@')) {
                const targetUsername = data.body.split('@')[1];
                let RoomName = data.room;
                addVerifiedUser(targetUsername, socket, data.from, RoomName);
            }
            if (data.handler === 'room_event' && data.body && data.body.startsWith('unver@')) {
                let RoomName = data.room;
                const targetUsername = data.body.split('@')[1];
                removeVerifiedUser(targetUsername, socket, data.from, RoomName);
            }
            if (data.handler === 'room_event' && data.body) {
                const body = data.body.trim();

                if (body.startsWith('setmsg@')) {
                    setWelcomeMessage(data, master, senderName, roomName, rooms, currentLanguage, socket);
                } else if (body === 'wec@on') {
                    enableWelcomeMessage(data, master, senderName, roomName, rooms, currentLanguage, socket);
                } else if (body === 'wec@off') {
                    disableWelcomeMessage(data, master, senderName, roomName, rooms, currentLanguage, socket);
                } else if (body === 'info@1') {
                    sendHelpInformation(data, roomName, socket, currentLanguage);
                } else if (
                    body.startsWith('o@') || body.startsWith('owner@') ||
                    body.startsWith('a@') ||
                    body.startsWith('m@') || body.startsWith('member@') ||
                    body.startsWith('n@') || body.startsWith('none@') ||
                    body.startsWith('b@') || body.startsWith('ban@') ||
                    body.startsWith('k@') || body.startsWith('kick@')
                ) {
                    handleUserCommands(data, senderName, master, roomName, rooms, socket, currentLanguage);
                }
            }
            if (data.handler === 'room_event' && data.type === 'you_joined') {
                const roomName = data.name; // إضافة هذا السطر إذا كنت بحاجة إلى تعريف roomName

                const usersList = data.users || [];
                const updatedUsers = usersList.map(user => ({
                    username: user.username,
                    role: user.role
                }));

                const updatedRooms = rooms.map(room => {
                    if (room.roomName === roomName) {
                        return { ...room, users: updatedUsers };
                    }
                    return room;
                });

                saveRooms(updatedRooms);
                console.log(`✅ Users updated in room "${roomName}" in rooms.json`);
            } else if (data.handler === 'room_event' && data.type === 'user_left') {
                const roomName = data.name; // إضافة هذا السطر إذا كنت بحاجة إلى تعريف roomName

                const usernameLeft = data.username;

                const updatedRooms = rooms.map(room => {
                    if (room.roomName === roomName) {
                        const filteredUsers = room.users?.filter(user => user.username !== usernameLeft) || [];
                        return { ...room, users: filteredUsers };
                    }
                    return room;
                });

                saveRooms(updatedRooms);
                console.log(`🛑 User "${usernameLeft}" removed from room "${roomName}"`);
            } else if (data.handler === 'room_event' && data.type === 'user_joined') {
                const roomName = data.name; // إضافة هذا السطر إذا كنت بحاجة إلى تعريف roomName
                console.log(data, '789798798798');

                const newUser = { username: data.username, role: data.role };
                const targetRoom = rooms.find(room => room.roomName === roomName);
                if (targetRoom) {
                    const userExists = targetRoom.users?.some(user => user.username === data.username);
                    if (!userExists) {
                        targetRoom.users = [...(targetRoom.users || []), newUser];
                    }

                    if (targetRoom.welcomeEnabled && targetRoom.welcomeMessage) {
                        let welcomeMessage = targetRoom.welcomeMessage;
                        if (welcomeMessage.includes('$')) {
                            welcomeMessage = welcomeMessage.replace(/\$/g, data.username);
                        }

                        const welcomeMessageObject = createRoomMessage(roomName, welcomeMessage);
                        socket.send(JSON.stringify(welcomeMessageObject));
                        console.log(`🎉 Sent welcome message to ${data.username} in room "${roomName}"`);
                    }

                    console.log(`➕ User "${data.username}" joined room "${roomName}"`);
                    saveRooms(rooms);
                }
            }



        });

        socket.on('close', () => {
            console.log(`❌ Connection closed for room: ${room.roomName}`);
        });

        socket.on('error', (error) => {
            console.error(`💥 Error in room ${room.roomName}:`, error);
        });
    });
}

module.exports = { joinRooms };
