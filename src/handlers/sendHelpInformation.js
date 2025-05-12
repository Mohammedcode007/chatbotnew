
const { loadRooms, saveRooms, roomExists, addRoom } = require('../fileUtils');
const {
    createRoomMessage
} = require('../messageUtils');
function sendHelpInformation(data, roomName, socket, currentLanguage) {
    if (data.body.startsWith('info@1')) {
        let helpMessage = '';

        if (currentLanguage === 'ar') {
            helpMessage = `
📝 أوامر الترحيب المتاحة:
            
1. setmsg@نص: لتعيين رسالة الترحيب. يمكنك استخدام علامة \`$\` لتمثيل اسم المستخدم. 
مثال: \`setmsg@أهلاً بك $ في الغرفة\` سيُرسل "أهلاً بك [اسم المستخدم] في الغرفة".
            
2. wec@on: لتفعيل رسالة الترحيب في الغرفة.
            
3. wec@off: لإيقاف رسالة الترحيب في الغرفة.
            
🔔 ملاحظة: علامة \`$\` سيتم استبدالها تلقائيًا باسم المستخدم عند إرسال رسالة الترحيب.
            `;
        } else {
            helpMessage = `
📝 Available welcome commands:
            
1. setmsg@text: Used to set the welcome message. You can use \`$\` to represent the username. 
Example: \`setmsg@Welcome $ to the room\` will send "Welcome [username] to the room".
            
2. wec@on: To enable the welcome message in the room.
            
3. wec@off: To disable the welcome message in the room.
            
🔔 Note: The \`$\` symbol will be replaced automatically with the username when sending the welcome message.
            `;
        }
        
        
        const helpMessageObject = createRoomMessage(roomName, helpMessage);
        socket.send(JSON.stringify(helpMessageObject));
        console.log('📘 Sent all welcome-related help commands.',roomName);
    }
}

module.exports = {
    sendHelpInformation
}