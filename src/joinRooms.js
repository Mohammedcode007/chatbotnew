

const { loadRooms, saveRooms, saveUserLanguage } = require('./fileUtils');
const WebSocket = require('ws');
const { getUserLanguage } = require('./fileUtils'); // ✅ استيراد دالة اللغة
const {
    createRoomMessage
} = require('./messageUtils');
const { addToList, removeFromList, blockUser, blockRoom, addVerifiedUser, removeVerifiedUser, unblockUser, unblockRoom } = require('./handlers/manageLists'); // استيراد الدوال الجديدة
const { disableWelcomeMessage, enableWelcomeMessage, setWelcomeMessage } = require('./handlers/handleWelocome');

// الآن يمكنك استخدام الدوال في الكود الخاص بك

const joinRooms = (socket, username) => {

    const rooms = loadRooms(); // استخدام الدالة لتحميل الغرف

    if (rooms.length > 0) {
        console.log('Rooms from JSON:', rooms);

        rooms.forEach((room) => {
            const { username: roomUsername, password, roomName } = room;
            const { master, users } = room;

            // إرسال طلب تسجيل الدخول
            const loginMessage = {
                handler: 'login',
                username: roomUsername,
                password: password,
                session: 'PQodgiKBfujFZfvJTnmM',
                sdk: '25',
                ver: '332',
                id: 'xOEVOVDfdSwVCjYqzmTT'
            };

            // إرسال رسالة تسجيل الدخول عبر WebSocket
            socket.send(JSON.stringify(loginMessage));
            console.log(`🔐 Login request sent for ${roomUsername}`);

            socket.on('message', (event) => {
                const data = JSON.parse(event);
                console.log('📩 Message received:', data);
                let senderName = data.from
                const currentLanguage = getUserLanguage(senderName) || 'en'; // الحصول على لغة المستخدم الحالية

                if (data.handler === 'login_event' && data.type === 'success') {
                    console.log(`✅ Login successful for ${roomUsername}`);

                    // إرسال طلب الانضمام إلى الغرفة بعد نجاح تسجيل الدخول
                    const joinRoomMessage = {
                        handler: 'room_join',
                        id: 'QvyHpdnSQpEqJtVbHbFY', // استبدل بـ ID الغرفة الفعلي
                        name: roomName
                    };

                    socket.send(JSON.stringify(joinRoomMessage));
                    console.log(`✅ Auto joined room: ${roomName}`);
                } else {
                    console.log(`❌ Login failed for ${roomUsername}`);
                }

                if (data.handler === 'room_event' && data.body && data.body.startsWith('ver@')) {
                    const targetUsername = data.body.split('@')[1];
                    let RoomName = data.room
                    addVerifiedUser(targetUsername, socket, data.from, RoomName);
                }

                // ✅ إزالة التوثيق من مستخدم
                if (data.handler === 'room_event' && data.body && data.body.startsWith('unver@')) {
                    let RoomName = data.room

                    const targetUsername = data.body.split('@')[1];
                    removeVerifiedUser(targetUsername, socket, data.from, RoomName);
                }                // التحقق إذا كانت الكلمة هي "addmas@username"
                if (data.handler === 'room_event' && data.body && data.body.startsWith('addmas@')) {
                    const targetUsername = data.body.split('@')[1]; // الحصول على اسم المستخدم بعد addmas@

                    // التحقق إذا كان الشخص الذي يرسل الرسالة هو ماستر الغرفة
                    if (master === senderName) {
                        console.log(`🔄 Adding ${targetUsername} to master list in room: ${roomName}`);

                        // إضافة المستخدم إلى "masterList" الخاصة بالغرفة فقط إذا لم يكن موجودًا
                        const updatedRooms = rooms.map(r => {
                            if (r.roomName === roomName) {
                                // إذا لم تكن هناك خاصية masterList، قم بإنشائها
                                if (!r.masterList) {
                                    r.masterList = []; // قائمة الماستر
                                }

                                // تحقق من أن المستخدم ليس موجودًا في "masterList" قبل إضافته
                                if (!r.masterList.includes(targetUsername)) {
                                    r.masterList.push(targetUsername);
                                    console.log(`✅ Added ${targetUsername} to masterList in room "${roomName}"`);

                                    // إرسال رسالة تأكيد للمستخدم باستخدام createRoomMessage
                                    const message = currentLanguage === 'ar'
                                        ? `✅ تم إضافة ${targetUsername} إلى قائمة الماستر في الغرفة "${roomName}".`
                                        : `✅ ${targetUsername} has been added to the master list in room "${roomName}".`;

                                    // لوج للتحقق من الرسالة
                                    console.log('Confirmation Message:', message);

                                    const confirmationMessage = createRoomMessage(roomName, message);
                                    console.log('Sending Confirmation Message:', confirmationMessage); // لوج لرسالة التأكيد
                                    socket.send(JSON.stringify(confirmationMessage));
                                } else {
                                    console.log(`❌ ${targetUsername} is already in the master list.`);

                                    // إرسال رسالة تحذيرية إذا كان المستخدم موجودًا بالفعل في القائمة
                                    const warningMessage = currentLanguage === 'ar'
                                        ? `❌ ${targetUsername} موجود بالفعل في قائمة الماستر.`
                                        : `❌ ${targetUsername} is already in the master list.`;

                                    const errorMessage = createRoomMessage(roomName, warningMessage);
                                    console.log('Sending Warning Message:', errorMessage); // لوج لرسالة التحذير
                                    socket.send(JSON.stringify(errorMessage));
                                }
                            }
                            return r;
                        });

                        saveRooms(updatedRooms); // حفظ التحديثات في ملف الغرف
                    } else {
                        console.log(`❌ You are not the master of the room and cannot add users to the master list.`);

                        // إرسال رسالة تحذيرية باستخدام createRoomMessage
                        const warningMessage = currentLanguage === 'ar'
                            ? '❌ أنت لست ماستر الغرفة ولا يمكنك إضافة المستخدمين إلى قائمة الماستر.'
                            : '❌ You are not the master of the room and cannot add users to the master list.';

                        const errorMessage = createRoomMessage(roomName, warningMessage);
                        socket.send(JSON.stringify(errorMessage));
                    }
                }


                if (data.handler === 'room_event' && data.body && data.body.startsWith('removemas@')) {
                    const targetUsername = data.body.split('@')[1]; // الحصول على اسم المستخدم بعد removemas@

                    // التحقق إذا كان الشخص الذي يرسل الرسالة هو ماستر الغرفة
                    if (master === senderName) {
                        console.log(`🔄 Removing ${targetUsername} from master list in room: ${roomName}`);

                        // حذف المستخدم من "masterList" فقط إذا كان موجودًا
                        const updatedRooms = rooms.map(r => {
                            if (r.roomName === roomName) {
                                // إذا كانت هناك خاصية masterList، قم بإزالتها
                                if (r.masterList) {
                                    // تحقق من وجود المستخدم في "masterList" قبل الحذف
                                    if (r.masterList.includes(targetUsername)) {
                                        r.masterList = r.masterList.filter(user => user !== targetUsername);
                                        console.log(`✅ Removed ${targetUsername} from masterList in room "${roomName}"`);

                                        // إرسال رسالة تأكيد باستخدام createRoomMessage
                                        const message = currentLanguage === 'ar'
                                            ? `✅ تم إزالة ${targetUsername} من قائمة الماستر في الغرفة "${roomName}".`
                                            : `✅ ${targetUsername} has been removed from the master list in room "${roomName}".`;

                                        const confirmationMessage = createRoomMessage(roomName, message);
                                        socket.send(JSON.stringify(confirmationMessage));
                                    } else {
                                        console.log(`❌ ${targetUsername} is not in the master list.`);

                                        // إرسال رسالة تحذيرية إذا كان المستخدم غير موجود في القائمة
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

                        saveRooms(updatedRooms); // حفظ التحديثات في ملف الغرف
                    } else {
                        console.log(`❌ You are not the master of the room and cannot remove users from the master list.`);

                        // إرسال رسالة تحذيرية باستخدام createRoomMessage
                        const warningMessage = currentLanguage === 'ar'
                            ? '❌ أنت لست ماستر الغرفة ولا يمكنك إزالة المستخدمين من قائمة الماستر.'
                            : '❌ You are not the master of the room and cannot remove users from the master list.';

                        const errorMessage = createRoomMessage(roomName, warningMessage);
                        socket.send(JSON.stringify(errorMessage));
                    }
                }


                if (data.handler === 'room_event' && data.body) {
                    setWelcomeMessage(data, master, senderName, roomName, rooms, currentLanguage, socket);
                    enableWelcomeMessage(data, master, senderName, roomName, rooms, currentLanguage, socket);
                    disableWelcomeMessage(data, master, senderName, roomName, rooms, currentLanguage, socket);
                }





                if (data.handler === 'room_event' && data.type === 'you_joined') {
                    const usersList = data.users || [];
                    const updatedUsers = usersList.map(user => ({
                        username: user.username,
                        role: user.role
                    }));

                    // تحديث الغرفة التي تطابق اسم الغرفة
                    const updatedRooms = rooms.map(room => {
                        if (room.roomName === roomName) {
                            return { ...room, users: updatedUsers }; // استبدال قائمة المستخدمين
                        }
                        return room;
                    });

                    saveRooms(updatedRooms); // حفظ التحديثات في ملف الغرف
                    console.log(`✅ Users updated in room "${roomName}" in rooms.json`);
                }
                else if (data.handler === 'room_event' && data.type === 'user_left') {
                    const usernameLeft = data.username;

                    // تحديث قائمة الغرف بدون التأثير على باقي الخصائص
                    const updatedRooms = rooms.map(room => {
                        if (room.roomName === roomName) {
                            // تحديث قائمة المستخدمين بعد إزالة المستخدم الذي غادر
                            const filteredUsers = room.users?.filter(user => user.username !== usernameLeft) || [];

                            // إعادة الغرفة مع تحديث قائمة المستخدمين فقط
                            return {
                                ...room,
                                users: filteredUsers // الحفاظ على باقي الخصائص كما هي
                            };
                        }
                        return room;
                    });

                    saveRooms(updatedRooms);
                    console.log(`🛑 User "${usernameLeft}" removed from room "${roomName}"`);
                }




                else if (data.handler === 'room_event' && data.type === 'user_joined') {
                    const newUser = { username: data.username, role: data.role };

                    const updatedRooms = rooms.map(room => {
                        if (room.roomName === roomName) {
                            const userExists = room.users?.some(user => user.username === data.username);
                            const updatedUsers = userExists
                                ? room.users
                                : [...(room.users || []), newUser];

                            // التحقق إذا كانت خاصية الترحيب مفعلة
                            if (room.welcomeEnabled && room.welcomeMessage) {
                                // استبدال $ باسم المستخدم في رسالة الترحيب إذا كانت تحتوي على $ 
                                let welcomeMessage = room.welcomeMessage;
                                if (welcomeMessage.includes('$')) {
                                    welcomeMessage = welcomeMessage.replace('$', data.username);
                                }

                                // إرسال رسالة الترحيب
                                const welcomeMessageObject = createRoomMessage(roomName, welcomeMessage);
                                socket.send(JSON.stringify(welcomeMessageObject));
                                console.log(`🎉 Sent welcome message to ${data.username} in room "${roomName}"`);
                            }

                            return { ...room, users: updatedUsers };
                        }
                        return room;
                    });

                    saveRooms(updatedRooms);
                    console.log(`➕ User "${data.username}" joined room "${roomName}"`);
                }

            });
        });
    } else {
        console.log('⚠️ No rooms found.');
    }
};

module.exports = joinRooms;

