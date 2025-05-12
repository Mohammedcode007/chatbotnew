const { loadRooms, saveRooms, roomExists, addRoom } = require('../fileUtils');
const {
    createRoomMessage
} = require('../messageUtils');
// دالة إيقاف رسالة الترحيب
function disableWelcomeMessage(data, master, senderName, roomName, rooms, currentLanguage, socket) {
    if (data.body.startsWith('wec@off')) {
        if (master === senderName) {
            console.log(`✅ Disabling welcome message for room: ${roomName}`);

            // فقط تغيير حالة الترحيب دون تعديل رسالة الترحيب نفسها
            const updatedRooms = rooms.map(r => {
                if (r.roomName === roomName) {
                    return { ...r, welcomeEnabled: false }; // إيقاف خاصية الترحيب
                }
                return r;
            });


            const confirmation = currentLanguage === 'ar'
                ? `✅ تم إيقاف رسالة الترحيب للغرفة "${roomName}".`
                : `✅ Welcome message has been disabled for room "${roomName}".`;

            const confirmMessage = createRoomMessage(roomName, confirmation);
            socket.send(JSON.stringify(confirmMessage));
            console.log('✅ Welcome message disabled.');
            saveRooms(updatedRooms);

        } else {
            const errorText = currentLanguage === 'ar'
                ? '❌ أنت لست ماستر الغرفة ولا يمكنك إيقاف رسالة الترحيب.'
                : '❌ You are not the master of the room and cannot disable the welcome message.';

            const errorMessage = createRoomMessage(roomName, errorText);
            socket.send(JSON.stringify(errorMessage));
            console.log('❌ Unauthorized attempt to disable welcome message.');
        }
    }
}

// دالة تفعيل رسالة الترحيب
function enableWelcomeMessage(data, master, senderName, roomName, rooms, currentLanguage, socket) {
    if (data.body.startsWith('wec@on')) {
        if (master === senderName) {
            console.log(`✅ Enabling welcome message for room: ${roomName}`);

            // فقط تغيير حالة الترحيب دون تعديل رسالة الترحيب نفسها
            const updatedRooms = rooms.map(r => {
                if (r.roomName === roomName) {
                    return { ...r, welcomeEnabled: true }; // تفعيل خاصية الترحيب
                }
                return r;
            });

            saveRooms(updatedRooms);

            const confirmation = currentLanguage === 'ar'
                ? `✅ تم تفعيل رسالة الترحيب للغرفة "${roomName}".`
                : `✅ Welcome message has been enabled for room "${roomName}".`;

            const confirmMessage = createRoomMessage(roomName, confirmation);
            socket.send(JSON.stringify(confirmMessage));
            console.log('✅ Welcome message enabled.');
        } else {
            const errorText = currentLanguage === 'ar'
                ? '❌ أنت لست ماستر الغرفة ولا يمكنك تفعيل رسالة الترحيب.'
                : '❌ You are not the master of the room and cannot enable the welcome message.';

            const errorMessage = createRoomMessage(roomName, errorText);
            socket.send(JSON.stringify(errorMessage));
            console.log('❌ Unauthorized attempt to enable welcome message.');
        }
    }
}

// دالة تعيين رسالة الترحيب
function setWelcomeMessage(data, master, senderName, roomName, rooms, currentLanguage, socket) {
    if (data.body.startsWith('setmsg@')) {
        const message = data.body.split('@')[1]; // استخراج الرسالة بعد setmsg@

        if (message) {
            let welcomeMessage = message; // رسالة الترحيب من المستخدم

            // إذا كانت الرسالة تحتوي على $، نضيف اسم المستخدم
            if (welcomeMessage.includes('$')) {
                const username = data.username;  // اسم المستخدم المرسل
                welcomeMessage = welcomeMessage.replace('$', username); // استبدال $ باسم المستخدم
            }

            // تحقق إذا كان المرسل هو ماستر الغرفة
            if (master === senderName) {
                console.log(`📝 Setting welcome message in room: ${roomName}`);

                // تحديث قائمة الغرف وحفظ الرسالة الجديدة
                const updatedRooms = rooms.map(r => {
                    if (r.roomName === roomName) {
                        return { ...r, welcomeMessage }; // حفظ الرسالة في خاصية "welcomeMessage"
                    }
                    return r;
                });

                saveRooms(updatedRooms);

                const confirmation = currentLanguage === 'ar'
                    ? `✅ تم تعيين رسالة الترحيب للغرفة "${roomName}".`
                    : `✅ Welcome message has been set for room "${roomName}".`;

                const confirmMessage = createRoomMessage(roomName, confirmation);
                socket.send(JSON.stringify(confirmMessage));
                console.log('✅ Welcome message saved and confirmation sent.');
            } else {
                const errorText = currentLanguage === 'ar'
                    ? '❌ أنت لست ماستر الغرفة ولا يمكنك تعيين رسالة ترحيب.'
                    : '❌ You are not the master of the room and cannot set the welcome message.';

                const errorMessage = createRoomMessage(roomName, errorText);
                socket.send(JSON.stringify(errorMessage));
                console.log('❌ Unauthorized attempt to set welcome message.');
            }
        }
    }
}


module.exports = {
    setWelcomeMessage,
    enableWelcomeMessage,
    disableWelcomeMessage
}