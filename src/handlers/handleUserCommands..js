const {
    createRoomMessage
} = require('../messageUtils');

function handleUserCommands(data, senderName, master, roomName, rooms, socket, currentLanguage) {
    const body = data.body.trim();


    // التحقق إذا كان المرسل هو الماستر أو في قائمة الماستر
    if (master === senderName || isUserInMasterList(senderName)) {
        const [command, targetUser] = body.split('@').map(item => item.trim()); // استخراج الأمر واسم المستخدم الهدف

        // التعامل مع كل أمر
        switch (command) {
            case 'o': // تعيين المالك
                if (master === senderName) {
                    makeOwner(roomName, targetUser, socket);
                    sendRoomMessage(roomName, `👑 User ${targetUser} is now the Owner.`, currentLanguage, socket);
                } else {
                    sendRoomMessage(roomName, currentLanguage === 'ar' ? `❌ لا يمكنك تعيين مالك جديد.` : `❌ You are not authorized to make someone the owner.`, currentLanguage, socket);
                }
                break;
            case 'a': // تعيين مشرف
                if (master === senderName) {
                    makeAdmin(roomName, targetUser, socket);
                    sendRoomMessage(roomName, `🔧 User ${targetUser} is now an Admin.`, currentLanguage, socket);
                } else {
                    sendRoomMessage(roomName, currentLanguage === 'ar' ? `❌ لا يمكنك تعيين مشرف جديد.` : `❌ You are not authorized to make someone an admin.`, currentLanguage, socket);
                }
                break;
            case 'm': // تعيين عضو
                if (master === senderName) {
                    makeMember(roomName, targetUser, socket);
                    sendRoomMessage(roomName, `👤 User ${targetUser} is now a Member.`, currentLanguage, socket);
                } else {
                    sendRoomMessage(roomName, currentLanguage === 'ar' ? `❌ لا يمكنك تعيين عضو جديد.` : `❌ You are not authorized to make someone a member.`, currentLanguage, socket);
                }
                break;
            case 'n': // إزالة الدور
                removeRole(roomName, targetUser, socket);
                sendRoomMessage(roomName, `🚫 User ${targetUser} has lost their role.`, currentLanguage, socket);
                break;
            case 'b': // حظر المستخدم
                banUser(roomName, targetUser, socket);
                sendRoomMessage(roomName, `❌ User ${targetUser} has been banned.`, currentLanguage, socket);
                break;
            case 'k': // طرد المستخدم
                kickUser(roomName, targetUser, socket);
                sendRoomMessage(roomName, `🚷 User ${targetUser} has been kicked from the room.`, currentLanguage, socket);
                break;
            case 'cancel': // إلغاء الأمر
                sendRoomMessage(roomName, currentLanguage === 'ar' ? `تم إلغاء الأمر.` : `The action has been canceled.`, currentLanguage, socket);
                break;
            default:
                sendRoomMessage(roomName, currentLanguage === 'ar' ? `⚠️ أمر غير صالح: ${command}` : `⚠️ Invalid command: ${command}`, currentLanguage, socket);
                return;
        }
    } else {
        sendRoomMessage(roomName, languageMessage, currentLanguage, socket);
    }
}

// دوال مساعدة لتنفيذ الأوامر:
const makeOwner = (room, targetUser, socket) => changeUserRole(room, targetUser, 'owner', socket);
const makeAdmin = (room, targetUser, socket) => changeUserRole(room, targetUser, 'admin', socket);
const makeMember = (room, targetUser, socket) => changeUserRole(room, targetUser, 'member', socket);
const removeRole = (room, targetUser, socket) => changeUserRole(room, targetUser, 'none', socket);

const banUser = (room, targetUser, socket) => changeUserRole(room, targetUser, 'outcast', socket);

const kickUser = (room, targetUser, socket) => {
    const kickMessage = {
        handler: 'room_admin',
        id: 'crom',
        type: 'kick',
        room: room,
        t_username: targetUser,
        t_role: 'none'
    };
    socket.send(JSON.stringify(kickMessage));
};

// دالة تغيير الدور
const changeUserRole = (room, targetUser, role, socket) => {
    const roleChangeMessage = {
        handler: 'room_admin',
        id: 'crom',
        type: 'change_role',
        room: room,
        t_username: targetUser,
        t_role: role
    };
    socket.send(JSON.stringify(roleChangeMessage));
};

// دالة إرسال رسالة إلى الغرفة
function sendRoomMessage(roomName, message, currentLanguage, socket) {
    const messageObject = createRoomMessage(roomName, message);
    socket.send(JSON.stringify(messageObject));
}

// دالة لإنشاء رسالة الغرفة
module.exports = {
    handleUserCommands
};
