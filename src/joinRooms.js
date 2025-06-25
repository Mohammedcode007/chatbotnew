

// const WebSocket = require('ws');
// const path = require('path');
// const { loadRooms, saveRooms, incrementRoomMessageCount } = require('./fileUtils'); // تأكد من وجود دالة loadRooms و saveRooms
// const { createRoomMessage } = require('./messageUtils'); // تأكد من وجود دالة createRoomMessage
// const { addToList, removeFromList, blockUser, blockRoom, addVerifiedUser, removeVerifiedUser, unblockUser, unblockRoom } = require('./handlers/manageLists'); // استيراد الدوال الجديدة
// const { disableWelcomeMessage, enableWelcomeMessage, setWelcomeMessage } = require('./handlers/handleWelocome');
// const { sendHelpInformation } = require('./handlers/sendHelpInformation')
// const { handleUserCommands } = require('./handlers/handleUserCommands.')
// const { getUserLanguage } = require('./fileUtils'); // ✅ استيراد دالة اللغة

// const { handleGiftCommand, handleImageGift, handleGiftListRequest, handleGiftSelection } = require('./handlers/giftManager');

// const { handleTradeKeywords } = require('./handlers/handleTradeKeywords'); // أضف هذا
// const { handleMessage } = require('./handlers/userListHandler'); // استيراد الدالة
// const { handlePlayCommand, handleSongReaction, handleSongShare } = require('./handlers/searchSoundCloud'); // استيراد الدالة

// const { handleShowImageCommand } = require('./handlers/imagesSearch'); // استيراد الدالة



// const { handleDrugKeywords } = require('./handlers/handleDrugKeywords'); // أضف هذا
// const { handleBrideRequest, handleBrideCommands } = require('./handlers/handleBrideRequest'); // أضف هذا
// const { handleGroomRequest,
//     handleGroomCommands } = require('./handlers/groomHandler'); // أضف هذا
// const { handleInRoomCommand } = require('./handlers/handleInRoomCommand'); // أضف هذا
// const { handleTopRoomsCommand } = require('./handlers/handleTopRoomsCommand'); // أضف هذا




// const { startPikachuEvent, handleFireCommand, startQuranBroadcast } = require('./handlers/pikachuEvent'); // أضف هذا
// const keywords = [
//     'بورصة', 'تداول', 'شراء', 'بيع', 'تحليل', 'مضاربة', 'هبوط', 'صعود',
//     'اشاعة', 'توصية', 'استثمار', 'حظ', 'سوق', 'مخاطرة', 'أرباح',
//     // كلمات جديدة عربية
//     'صيد', 'فرصة',
//     // كلمات إنجليزية مقابلة
//     'stock', 'trade', 'buy', 'sell', 'analysis', 'speculation', 'drop', 'rise',
//     'rumor', 'recommendation', 'investment', 'luck', 'market', 'risk', 'profit',
//     'catch', 'opportunity'
// ];
// function joinRooms() {
//     const rooms = loadRooms(path.join(__dirname, 'rooms.json'));
//     const ioSockets = {}; // 🧠 لتخزين جميع الـ sockets حسب اسم الغرفة

//     rooms.forEach(room => {
//         const socket = new WebSocket('wss://chatp.net:5333/server');
//         ioSockets[room.roomName] = socket; // ✅ تخزين السوكيت مع اسم الغرفة

//         const { master, users } = room;
//         socket.roomInfo = room;


//         // حفظ معلومات الغرفة في الـ socket
//         socket.roomInfo = room;
//         socket._processedAddMas = new Set(); // لتجنب التكرار في التعامل مع addmas@

//         socket.on('open', () => {
//             // إرسال طلب تسجيل الدخول
//             const loginMessage = {
//                 handler: 'login',
//                 username: room.username,
//                 password: room.password,
//                 session: 'PQodgiKBfujFZfvJTnmM',
//                 sdk: '25',
//                 ver: '332',
//                 id: 'xOEVOVDfdSwVCjYqzmTT'
//             };
//             socket.send(JSON.stringify(loginMessage));
//             console.log(`🔐 Login sent for ${room.username}`);
//         });

//         socket.on('message', (event) => {
//             const data = JSON.parse(event);
//             let senderName = data.from
//             let roomName = data.room
//             const currentLanguage = getUserLanguage(senderName) || 'en'; // الحصول على لغة المستخدم الحالية

//             // ✅ عند تسجيل الدخول بنجاح، قم بالانضمام إلى الغرفة
//             if (data.handler === 'login_event' && data.type === 'success') {
//                 // الانضمام للغرفة باستخدام الـ roomName الخاص بكل غرفة
//                 const joinRoomMessage = {
//                     handler: 'room_join',
//                     id: 'QvyHpdnSQpEqJtVbHbFY', // أو يمكن تغيير هذا إلى المعرف الصحيح للغرفة
//                     name: room.roomName // استخدم اسم الغرفة الموجود في الـ room
//                 };
//                 socket.send(JSON.stringify(joinRoomMessage));
//                 console.log(`🚪 Sent join request to room: ${room.roomName}`);

//                 const statusText = `<p style="color: #2196F3; font-family: 'Arial', sans-serif; font-size: 16px; font-weight: bold;">[Master: ${room.master}] - [Room: ${room.roomName}]</p>`;

//                 const updateStatusMessage = {
//                     handler: 'profile_update',
//                     id: 'iQGlQEghwwsXRhvVqCND', // إذا كان هناك معرف ثابت لكل حساب يمكن تغييره
//                     type: 'status',
//                     value: statusText
//                 };
//                 socket.send(JSON.stringify(updateStatusMessage));
//                 console.log(`💬 Status updated for ${room.username}`);
//                 return;
//             }

//             // التعامل مع أوامر إضافية مثل addmas@
//             if (data.handler === 'room_event' && data.body && data.body.startsWith('addmas@')) {
//                 const targetUsername = data.body.split('@')[1];  // الحصول على اسم المستخدم بعد addmas@
//                 if (master === senderName) {
//                     console.log(`🔄 Adding ${targetUsername} to master list in room: ${data.room}`);
//                     const targetRoomIndex = rooms.findIndex(room => room.roomName === data.room);
//                     if (targetRoomIndex !== -1) {
//                         const targetRoom = rooms[targetRoomIndex];
//                         if (!targetRoom.masterList) {
//                             targetRoom.masterList = [];
//                         }
//                         if (!targetRoom.masterList.includes(targetUsername)) {
//                             targetRoom.masterList.push(targetUsername);
//                             console.log(`✅ Added ${targetUsername} to masterList in room "${data.room}"`);
//                             const message = currentLanguage === 'ar'
//                                 ? `✅ تم إضافة ${targetUsername} إلى قائمة الماستر في الغرفة "${data.room}".`
//                                 : `✅ ${targetUsername} has been added to the master list in room "${data.room}".`;
//                             const confirmationMessage = createRoomMessage(data.room, message);
//                             socket.send(JSON.stringify(confirmationMessage));
//                         } else {
//                             const warningMessage = currentLanguage === 'ar'
//                                 ? `❌ ${targetUsername} موجود بالفعل في قائمة الماستر.`
//                                 : `❌ ${targetUsername} is already in the master list.`;
//                             const errorMessage = createRoomMessage(data.room, warningMessage);
//                             socket.send(JSON.stringify(errorMessage));
//                         }
//                     }
//                     saveRooms(rooms);
//                 } else {
//                     const warningMessage = currentLanguage === 'ar'
//                         ? '❌ أنت لست ماستر الغرفة ولا يمكنك إضافة المستخدمين إلى قائمة الماستر.'
//                         : '❌ You are not the master of the room and cannot add users to the master list.';
//                     const errorMessage = createRoomMessage(data.room, warningMessage);
//                     socket.send(JSON.stringify(errorMessage));
//                 }
//             }
//             if (data.handler === 'room_event' && data.body && data.body.startsWith('removemas@')) {
//                 const targetUsername = data.body.split('@')[1];
//                 if (master === senderName) {
//                     console.log(`🔄 Removing ${targetUsername} from master list in room: ${roomName}`);
//                     const updatedRooms = rooms.map(r => {
//                         if (r.roomName === roomName) {
//                             if (r.masterList) {
//                                 if (r.masterList.includes(targetUsername)) {
//                                     r.masterList = r.masterList.filter(user => user !== targetUsername);
//                                     console.log(`✅ Removed ${targetUsername} from masterList in room "${roomName}"`);
//                                     const message = currentLanguage === 'ar'
//                                         ? `✅ تم إزالة ${targetUsername} من قائمة الماستر في الغرفة "${roomName}".`
//                                         : `✅ ${targetUsername} has been removed from the master list in room "${roomName}".`;
//                                     const confirmationMessage = createRoomMessage(roomName, message);
//                                     socket.send(JSON.stringify(confirmationMessage));
//                                 } else {
//                                     const warningMessage = currentLanguage === 'ar'
//                                         ? `❌ ${targetUsername} غير موجود في قائمة الماستر.`
//                                         : `❌ ${targetUsername} is not in the master list.`;
//                                     const errorMessage = createRoomMessage(roomName, warningMessage);
//                                     socket.send(JSON.stringify(errorMessage));
//                                 }
//                             }
//                         }
//                         return r;
//                     });
//                     saveRooms(updatedRooms);
//                 } else {
//                     const warningMessage = currentLanguage === 'ar'
//                         ? '❌ أنت لست ماستر الغرفة ولا يمكنك إزالة المستخدمين من قائمة الماستر.'
//                         : '❌ You are not the master of the room and cannot remove users from the master list.';
//                     const errorMessage = createRoomMessage(roomName, warningMessage);
//                     socket.send(JSON.stringify(errorMessage));
//                 }
//             }

//             if (data.handler === 'room_event' && data.body && data.body.startsWith('ver@')) {
//                 const targetUsername = data.body.split('@')[1];
//                 let RoomName = data.room;
//                 addVerifiedUser(targetUsername, socket, data.from, RoomName);
//             }
//             if (data.body && (data.body.startsWith('svip@'))) {
//                 handleGiftCommand(data, socket, senderName);
//             } else if (data.type === 'image') {
//                 handleImageGift(data, senderName, ioSockets);
//             } else if (data.body && data.body === 'gfg') { // إضافة شرط للتحقق من أمر gfg
//                 handleGiftListRequest(data, socket, senderName);  // دالة جديدة لإرسال قائمة الهدايا
//             } else if (data.body && data.body.startsWith('gfg@')) {
//                 handleGiftSelection(data, senderName, ioSockets);
//             } else if (data.body && (data.body.startsWith('play ') || data.body.startsWith('تشغيل '))) {
//                 handlePlayCommand(data, socket, senderName); // ✅ الأمر الجديد لتشغيل أغنية
//             } else if (data.body && data.body.startsWith('like@')) {
//                 handleSongReaction(data, 'like', socket);
//             } else if (data.body && data.body.startsWith('dislike@')) {
//                 handleSongReaction(data, 'dislike', socket);
//             } else if (data.body && data.body.startsWith('com@')) {
//                 handleSongReaction(data, 'comment', socket);
//             } else if (data.body && (data.body.startsWith('gift@') || data.body.startsWith('share@'))) {
//                 handleSongShare(data, socket);
//             } else if (data.body && (data.body.startsWith('image ') || data.body.startsWith('صورة '))) {
//                 handleShowImageCommand(data, socket, senderName); // أمر عرض صورة
//             }



//             if (data.handler === 'room_event' && data.body && data.body.startsWith('unver@')) {
//                 let RoomName = data.room;
//                 const targetUsername = data.body.split('@')[1];
//                 removeVerifiedUser(targetUsername, socket, data.from, RoomName);
//             }
//             if (data.handler === 'room_event' && data.body) {
//                 if (data.body === 'fire' || data.body === 'فاير') {
//                     handleFireCommand(data, socket, rooms, ioSockets);
//                 }
//                 if (data.body === '.list') {
//                     // استدعاء دالة عرض المستخدمين المرتبة
//                     handleMessage(data, socket);
//                 }

//                 if (keywords.includes(data.body.trim().toLowerCase())) {
//                     handleTradeKeywords(data, socket);
//                 }


//                 if (['هيروين', 'تامول', 'شابو', 'بانجو', 'استروكس', 'حقن', 'مخدرات'].includes(data.body.trim())) {
//                     handleDrugKeywords(data, socket);
//                 }

//             }

//             if (data.handler === 'room_event' && data.body &&
//                 (data.body.startsWith('in@') || data.body === '.nx' || data.body.startsWith('fuck@'))) {
//                 // نمرر رسالة المستخدم، اسم المرسل، الغرفة، ومصفوفة مداخل الـ WebSocket
//                 handleInRoomCommand(data.body, data.username, data.room, ioSockets);
//             }
//             if (data.body && data.body === "top@room") {
//                 handleTopRoomsCommand(data, senderName, data.room, ioSockets);
//             }
//             if (data.handler === 'room_event') {
//                 incrementRoomMessageCount(data.room); // زيادة عداد الرسائل
//             }


//             if (data.handler === 'room_event' && data.body) {
//                 const body = data.body.trim();

//                 if (body.startsWith('setmsg@')) {
//                     setWelcomeMessage(data, master, senderName, roomName, rooms, currentLanguage, socket);
//                 } else if (body === 'wec@on') {
//                     enableWelcomeMessage(data, master, senderName, roomName, rooms, currentLanguage, socket);
//                 }
//                 else if (body === 'عروستي') {
//                     handleBrideRequest(data, socket, senderName);
//                 } else if (body.startsWith('woman@')) {
//                     handleBrideCommands(data, socket, senderName);

//                 }

//                 else if (body === 'عريسي') {
//                     handleGroomRequest(data, socket, senderName);

//                 } else if (body.startsWith('man@')) {
//                     handleGroomCommands(data, socket, senderName);

//                 }
//                 else if (body === 'wec@off') {
//                     disableWelcomeMessage(data, master, senderName, roomName, rooms, currentLanguage, socket);
//                 } else if (body === 'info@1' || body === 'info@2' || body === 'info@3' || body === 'info@4' || body === 'info@5') {
//                     sendHelpInformation(data, roomName, socket, currentLanguage);
//                 } else if (
//                     body.startsWith('o@') || body.startsWith('owner@') ||
//                     body.startsWith('a@') ||
//                     body.startsWith('m@') || body.startsWith('member@') ||
//                     body.startsWith('n@') || body.startsWith('none@') ||
//                     body.startsWith('b@') || body.startsWith('ban@') ||
//                     body.startsWith('k@') || body.startsWith('kick@')
//                 ) {
//                     handleUserCommands(data, senderName, master, roomName, rooms, socket, currentLanguage);
//                 }
//             }
//             if (data.handler === 'room_event' && data.type === 'you_joined') {
//                 const roomName = data.name; // إضافة هذا السطر إذا كنت بحاجة إلى تعريف roomName

//                 const usersList = data.users || [];
//                 const updatedUsers = usersList.map(user => ({
//                     username: user.username,
//                     role: user.role
//                 }));

//                 const updatedRooms = rooms.map(room => {
//                     if (room.roomName === roomName) {
//                         return { ...room, users: updatedUsers };
//                     }
//                     return room;
//                 });

//                 saveRooms(updatedRooms);
//                 console.log(`✅ Users updated in room "${roomName}" in rooms.json`);
//             } else if (data.handler === 'room_event' && data.type === 'user_left') {
//                 const roomName = data.name; // إضافة هذا السطر إذا كنت بحاجة إلى تعريف roomName

//                 const usernameLeft = data.username;

//                 const updatedRooms = rooms.map(room => {
//                     if (room.roomName === roomName) {
//                         const filteredUsers = room.users?.filter(user => user.username !== usernameLeft) || [];
//                         return { ...room, users: filteredUsers };
//                     }
//                     return room;
//                 });

//                 saveRooms(updatedRooms);
//                 console.log(`🛑 User "${usernameLeft}" removed from room "${roomName}"`);
//             } else if (data.handler === 'room_event' && data.type === 'user_joined') {
//                 const roomName = data.name; // إضافة هذا السطر إذا كنت بحاجة إلى تعريف roomName
//                 console.log(data, '789798798798');

//                 const newUser = { username: data.username, role: data.role };
//                 const targetRoom = rooms.find(room => room.roomName === roomName);
//                 if (targetRoom) {
//                     const userExists = targetRoom.users?.some(user => user.username === data.username);
//                     if (!userExists) {
//                         targetRoom.users = [...(targetRoom.users || []), newUser];
//                     }

//                     if (targetRoom.welcomeEnabled && targetRoom.welcomeMessage) {
//                         let welcomeMessage = targetRoom.welcomeMessage;
//                         if (welcomeMessage.includes('$')) {
//                             welcomeMessage = welcomeMessage.replace(/\$/g, data.username);
//                         }

//                         const welcomeMessageObject = createRoomMessage(roomName, welcomeMessage);
//                         socket.send(JSON.stringify(welcomeMessageObject));
//                         console.log(`🎉 Sent welcome message to ${data.username} in room "${roomName}"`);
//                     }

//                     console.log(`➕ User "${data.username}" joined room "${roomName}"`);
//                     saveRooms(rooms);
//                 }
//             }



//         });

//         socket.on('close', () => {
//             console.log(`❌ Connection closed for room: ${room.roomName}`);
//         });

//         socket.on('error', (error) => {
//             console.error(`💥 Error in room ${room.roomName}:`, error);
//         });
//     });
//     startPikachuEvent(ioSockets, rooms);
//     startQuranBroadcast(ioSockets, rooms)

// }

// module.exports = { joinRooms };




const WebSocket = require('ws');
const path = require('path');
const { loadRooms, saveRooms, incrementRoomMessageCount, getUserLanguage,loadUsers,saveUsers } = require('./fileUtils'); 
const { createRoomMessage } = require('./messageUtils'); 
const { addToList, removeFromList, blockUser, blockRoom, addVerifiedUser, removeVerifiedUser, unblockUser, unblockRoom } = require('./handlers/manageLists');
const { disableWelcomeMessage, enableWelcomeMessage, setWelcomeMessage } = require('./handlers/handleWelocome');
const { sendHelpInformation } = require('./handlers/sendHelpInformation');
const { handleUserCommands } = require('./handlers/handleUserCommands.');
const { handleGiftCommand, handleImageGift, handleGiftListRequest, handleGiftSelection } = require('./handlers/giftManager');
const { handleTradeKeywords } = require('./handlers/handleTradeKeywords');
const { handleMessage } = require('./handlers/userListHandler');
const { handlePlayCommand, handleSongReaction, handleSongShare,handlePlaySongInAllRooms,handleImageSearchCommand ,handleImageGiftsearch} = require('./handlers/searchSoundCloud');
const { handleShowImageCommand } = require('./handlers/imagesSearch');
const { handleDrugKeywords } = require('./handlers/handleDrugKeywords');
const { handleBrideRequest, handleBrideCommands } = require('./handlers/handleBrideRequest');
const { handleGroomRequest, handleGroomCommands } = require('./handlers/groomHandler');
const { handleInRoomCommand } = require('./handlers/handleInRoomCommand');
const { sendUserRoomsMessage } = require('./handlers/sendUserRoomsMessage');
const { handleNotifyCommand } = require('./handlers/handleNotifyCommand');



  
const { handleTopRoomsCommand } = require('./handlers/handleTopRoomsCommand');
const { startPikachuEvent, handleFireCommand, startQuranBroadcast } = require('./handlers/pikachuEvent');

const keywords = [
    'بورصة', 'تداول', 'شراء', 'بيع', 'تحليل', 'مضاربة', 'هبوط', 'صعود',
    'اشاعة', 'توصية', 'استثمار', 'حظ', 'سوق', 'مخاطرة', 'أرباح',
    'صيد', 'فرصة',
    'stock', 'trade', 'buy', 'sell', 'analysis', 'speculation', 'drop', 'rise',
    'rumor', 'recommendation', 'investment', 'luck', 'market', 'risk', 'profit',
    'catch', 'opportunity'
];

function joinRooms() {
    const rooms = loadRooms(path.join(__dirname, 'rooms.json'));
    const ioSockets = {}; 

    // دالة لإنشاء وإعداد WebSocket مع إعادة الاتصال
    function createSocketForRoom(room) {
        let socket = new WebSocket('wss://chatp.net:5333/server');
        ioSockets[room.roomName] = socket;
        socket.roomInfo = room;
        socket._processedAddMas = new Set();

        socket.on('open', () => {
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
            try {
                const data = JSON.parse(event);
                let senderName = data.from;
                let roomName = data.room || socket.roomInfo.roomName;
                const currentLanguage = getUserLanguage(senderName) || 'en';
console.log(data,'444444444');

if (data.handler === 'room_event') {
    const senderName = data.from;
    const avatarUrl = data.avatar_url || `https://api.multiavatar.com/${encodeURIComponent(senderName)}.png`;
  
    const allUsers = loadUsers();
    const userIndex = allUsers.findIndex(u => u.username === senderName);
  
    if (userIndex !== -1) {
      // ✅ تحديث الصورة فقط إذا اختلفت عن الحالية
      if (allUsers[userIndex].profileUrl !== avatarUrl) {
        allUsers[userIndex].profileUrl = avatarUrl;
        console.log(`🔄 تم تحديث صورة المستخدم "${senderName}"`);
        saveUsers(allUsers);
      }
    } else {
      // ❌ لا يتم الإضافة
      console.log(`ℹ️ المستخدم "${senderName}" غير موجود في users.json – لم يتم التحديث.`);
    }
  }
  
  
                // هنا استمر في التعامل مع الرسائل بنفس الطريقة الموجودة في كودك الأصلي
                // ... (الشفرة الخاصة بالتعامل مع الرسائل مثل أوامر addmas@ و removemas@ و svip@ ... الخ)

                // مثال على إعادة استخدام جزء بسيط من الكود الموجود للتوضيح:
                if (data.handler === 'login_event' && data.type === 'success') {
                    const joinRoomMessage = {
                        handler: 'room_join',
                        id: 'QvyHpdnSQpEqJtVbHbFY',
                        name: room.roomName
                    };
                    socket.send(JSON.stringify(joinRoomMessage));
                    console.log(`🚪 Sent join request to room: ${room.roomName}`);

                    const statusText = `<p style="color: #2196F3; font-family: 'Arial', sans-serif; font-size: 16px; font-weight: bold;">[Master: ${room.master}] - [Room: ${room.roomName}]</p>`;

                    const updateStatusMessage = {
                        handler: 'profile_update',
                        id: 'iQGlQEghwwsXRhvVqCND',
                        type: 'status',
                        value: statusText
                    };
                    socket.send(JSON.stringify(updateStatusMessage));
                    console.log(`💬 Status updated for ${room.username}`);
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
            if (data.body && (data.body.startsWith('svip@'))) {
                handleGiftCommand(data, socket, senderName);
            } else if (data.type === 'image') {
                handleImageGift(data, senderName, ioSockets);
            } else if (data.body && data.body === 'gfg') { // إضافة شرط للتحقق من أمر gfg
                handleGiftListRequest(data, socket, senderName);  // دالة جديدة لإرسال قائمة الهدايا
            } else if (data.body && data.body.startsWith('gfg@')) {
                handleGiftSelection(data, senderName, ioSockets);
            } else if (data.body && data.body.startsWith('like@')) {
                handleSongReaction(data, 'like', socket);
            } else if (data.body && data.body.startsWith('dislike@')) {
                handleSongReaction(data, 'dislike', socket);
            } else if (data.body && data.body.startsWith('com@')) {
                handleSongReaction(data, 'comment', socket);
            } else if (data.body && (data.body.startsWith('gift@') || data.body.startsWith('share@'))) {
                handleSongShare(data, socket);
            } else if (data.body && (data.body.startsWith('image ') || data.body.startsWith('صورة '))) {
                handleShowImageCommand(data, socket, senderName); // أمر عرض صورة
            }



            if (data.handler === 'room_event' && data.body && data.body.startsWith('unver@')) {
                let RoomName = data.room;
                const targetUsername = data.body.split('@')[1];
                removeVerifiedUser(targetUsername, socket, data.from, RoomName);
            }
            if (data.handler === 'room_event' && data.body) {
                if (data.body === 'fire' || data.body === 'فاير') {
                    handleFireCommand(data, socket, rooms, ioSockets);
                }
                if (data.body === '.list') {
                    // استدعاء دالة عرض المستخدمين المرتبة
                    handleMessage(data, socket);
                }

                if (keywords.includes(data.body.trim().toLowerCase())) {
                    handleTradeKeywords(data, socket);
                }


                if (['هيروين', 'تامول', 'شابو', 'بانجو', 'استروكس', 'حقن', 'مخدرات'].includes(data.body.trim())) {
                    handleDrugKeywords(data, socket);
                }

            }

            if (data.handler === 'room_event' && data.body &&
                (data.body.startsWith('in@') || data.body === '.nx' || data.body.startsWith('fuck@'))) {
                // نمرر رسالة المستخدم، اسم المرسل، الغرفة، ومصفوفة مداخل الـ WebSocket
                handleInRoomCommand(data.body, senderName, data.room, ioSockets);
            }
            if (data.body && data.body === "top@room") {
                handleTopRoomsCommand(data, senderName, data.room, ioSockets);
            }
            if (data.handler === 'room_event') {
                incrementRoomMessageCount(data.room); // زيادة عداد الرسائل
            }

            // داخل معالج الرسائل
        // داخل مستمع الرسائل (مثلاً ws.onmessage أو داخل switch حسب حالتك)
if (data.body) {
    const msg = data.body.trim();
  
    // التحقق من أمر is@
    if (msg.startsWith("is@")) {
      const targetUsername = msg.split("is@")[1]?.trim();
      if (targetUsername) {
        sendUserRoomsMessage(targetUsername, data.room, ioSockets, senderName, socket);
      }
    }
    if (data.body.startsWith('.ps ')) {
        handlePlaySongInAllRooms(data, socket, senderName, ioSockets);
      }
     
if (
    msg.startsWith('img ') ||
    msg.startsWith('image ') ||
    msg.startsWith('صورة ') ||
    msg.startsWith('صوره ')
  ) {
    handleImageSearchCommand(data, socket, senderName);
  }
  if (data.body.toLowerCase().startsWith('gft@')) {
    handleImageGiftsearch(data, socket, senderName, ioSockets);
  }
  
      
    // التحقق من أمر play أو تشغيل
    if (msg.startsWith("play ") || msg.startsWith("تشغيل ")) {
      handlePlayCommand(data, socket, senderName); // دالة async
    }
  }

            if (data.body && data.body.startsWith("notify@")) {
                handleNotifyCommand(data.body, data.room, ioSockets);
              }
              
              

            if (data.handler === 'room_event' && data.body) {
                const body = data.body.trim();

                if (body.startsWith('setmsg@')) {
                    setWelcomeMessage(data, master, senderName, roomName, rooms, currentLanguage, socket);
                } else if (body === 'wec@on') {
                    enableWelcomeMessage(data, master, senderName, roomName, rooms, currentLanguage, socket);
                }
                else if (body === 'عروستي') {
                    handleBrideRequest(data, socket, senderName);
                } else if (body.startsWith('woman@')) {
                    handleBrideCommands(data, socket, senderName);

                }

                else if (body === 'عريسي') {
                    handleGroomRequest(data, socket, senderName);

                } else if (body.startsWith('man@')) {
                    handleGroomCommands(data, socket, senderName);

                }
                else if (body === 'wec@off') {
                    disableWelcomeMessage(data, master, senderName, roomName, rooms, currentLanguage, socket);
                } else if (body === 'info@1' || body === 'info@2' || body === 'info@3' || body === 'info@4' || body === 'info@5') {
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
            }
             else if (data.handler === 'room_event' && data.type === 'user_joined') {
                const roomName = data.name; // إضافة هذا السطر إذا كنت بحاجة إلى تعريف roomName

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

         
            

            } catch (error) {
                console.error('⚠️ Error parsing message:', error);
            }
        });

        socket.on('close', (code, reason) => {
            console.log(`❌ Connection closed for room: ${room.roomName} - Code: ${code}, Reason: ${reason}`);
            // إعادة محاولة الاتصال بعد 5 ثواني
            setTimeout(() => {
                console.log(`🔄 Attempting to reconnect to room: ${room.roomName}`);
                createSocketForRoom(room);
            }, 5000);
        });

        socket.on('error', (error) => {
            console.error(`💥 Error in room ${room.roomName}:`, error);
        });
    }

    // إنشاء socket لكل غرفة
    rooms.forEach(room => {
        createSocketForRoom(room);
    });

    startPikachuEvent(ioSockets, rooms);
    startQuranBroadcast(ioSockets, rooms);
}

module.exports = { joinRooms };
