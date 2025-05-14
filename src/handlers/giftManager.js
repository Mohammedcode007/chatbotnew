
const { loadRooms, incrementUserGiftCount, loadUsers, getUserLanguage } = require('../fileUtils');
const { createGiftMessage } = require('../messageUtils');
const { createRoomMessage } = require('../messageUtils');

const pendingGifts = {}; // { senderName: { recipient, createdAt, socket } }
const userGiftStats = {}; // { username: { sent: 0, received: 0 } } لتتبع الهدايا

// دالة للتحقق من حالة الـ VIP
function isUserVip(username) {
    const users = loadUsers(); // هذه الدالة يجب أن تقوم بتحميل جميع المستخدمين من ملف أو قاعدة بيانات
    const user = users.find(u => u.username === username);
    return user && user.vip;
}

function handleGiftCommand(data, socket, senderName) {
    const body = data.body;

    let recipient = null;
    let customMessage = '';
    let isSvip = false;

    // التحقق من أمر الهدية
    if (body.startsWith('gft@')) {
        const parts = body.split('@');
        if (parts.length >= 2) {
            recipient = parts[1].trim();
        }
    } else if (body.startsWith('svip@')) {
        const parts = body.split('@');
        isSvip = true;
        if (parts.length === 2 && parts[1].trim() !== '') {
            recipient = parts[1].trim(); // svip@username
        } else if (parts.length >= 3) {
            recipient = parts[1].trim();  // svip@username@customMessage
            customMessage = parts.slice(2).join('@').trim();
        }
    } else {
        return;
    }

    if (!recipient) return;

    // التحقق من حالة الـ VIP
    if (!isUserVip(senderName)) {
        const lang = getUserLanguage(senderName) || 'ar';

        const vipMessageText = lang === 'ar'
            ? '⚠️ لا يمكنك إرسال هدية لأنك لست من أعضاء VIP. تواصل مع المشرف للحصول على صلاحيات VIP.'
            : '⚠️ You cannot send a gift because you are not a VIP. Please contact the admin to get VIP privileges.';
        
        const vipMessage = createRoomMessage(data.room, vipMessageText);
        socket.send(JSON.stringify(vipMessage));
        
        return;
    }

    // تتبع الهدايا المرسلة
    if (!userGiftStats[senderName]) {
        userGiftStats[senderName] = { sent: 0, received: 0 };
    }
    userGiftStats[senderName].sent++;

    // تخزين الهدية المعلقة
    pendingGifts[senderName] = {
        recipient,
        customMessage,
        isSvip,
        createdAt: Date.now(),
        socket
    };

    const waitMessage = isSvip
        ? `🎁 المستخدم ${senderName} يستعد لإرسال هدية ${recipient ? `إلى ${recipient}` : 'خاصة'}. الرجاء الانتظار... لديه 30 ثانية فقط. الهدايا المرسلة: ${userGiftStats[senderName].sent}`
        : `🎁 من فضلك أرسل الآن صورة الهدية إلى ${recipient}. لديك 30 ثانية فقط. الهدايا المرسلة: ${userGiftStats[senderName].sent}`;

    const response = createRoomMessage(data.room, waitMessage);
    socket.send(JSON.stringify(response));

    setTimeout(() => {
        if (pendingGifts[senderName]) {
            delete pendingGifts[senderName];
    
            const lang = getUserLanguage(senderName) || 'ar';
            const timeoutText = lang === 'ar'
                ? `⏰ انتهى الوقت! لم يتم إرسال صورة الهدية إلى ${pendingGifts[senderName]?.recipient || 'المستلم'}.`
                : `⏰ Time's up! The gift image was not sent to ${pendingGifts[senderName]?.recipient || 'the recipient'}.`;
    
            const timeoutMsg = createRoomMessage(data.room, timeoutText);
            socket.send(JSON.stringify(timeoutMsg));
        }
    }, 30000);
    
}

function handleImageGift(data, senderName, ioSockets) {
    if (!pendingGifts.hasOwnProperty(senderName)) return;
    if (!data.url) return;

    const pending = pendingGifts[senderName];
    const { recipient, customMessage, isSvip } = pending;

    const rooms = loadRooms();

    // تحديث العدادات
    incrementUserGiftCount(senderName, 'sentGifts');
    incrementUserGiftCount(recipient, 'receivedGifts');

    // تحميل المستخدمين بعد التحديث
    const users = loadUsers();
    const senderData = users.find(u => u.username === senderName);
    const recipientData = users.find(u => u.username === recipient);

    const sentCount = senderData?.sentGifts || 0;
    const receivedCount = senderData?.receivedGifts || 0;

    // تحديد اللغة
    const lang = getUserLanguage(senderName) || 'ar';

    rooms.forEach(room => {
        const roomName = room.roomName || room;
        const targetSocket = ioSockets ? ioSockets[roomName] : pending.socket;

        if (!targetSocket || targetSocket.readyState !== 1) return;

     const detailText = lang === 'ar'
  ? `\u200E🎁\n👤 ${senderName}\n🎯 ${recipient}\n🏠 ${data.room}\n💌 ${customMessage || '—'}\n📦 📤${sentCount} 📥${receivedCount}\n🖼️👇`
  : `\u200E🎁\n👤 ${senderName}\n🎯 ${recipient}\n🏠 ${data.room}\n💌 ${customMessage || '—'}\n📦 📤${sentCount} 📥${receivedCount}\n🖼️👇`;

        const detailMsg = createRoomMessage(roomName, detailText);
        targetSocket.send(JSON.stringify(detailMsg));

        // إرسال صورة الهدية
        const giftMsg = createGiftMessage(
            roomName,
            data.url,
            senderName,
            recipient,
            isSvip,
            customMessage
        );
        targetSocket.send(JSON.stringify(giftMsg));
    });

    delete pendingGifts[senderName];
}


module.exports = {
    handleGiftCommand,
    handleImageGift
};
