const { loadRooms, saveRooms, roomExists, addRoom } = require('../fileUtils');
const { createRoomMessage } = require('../messageUtils');

function sendHelpInformation(data, roomName, socket, currentLanguage) {
    let helpMessage = '';

    if (data.body.startsWith('info@1')) {
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

    } else if (data.body.startsWith('info@2')) {
        if (currentLanguage === 'ar') {
            helpMessage = `
💊 شرح كلمات المخدرات:
عند كتابة أي كلمة مثل "حشيش" أو "بودرة" أو "برشام" داخل الغرفة، سيقوم البوت بإرسال ردود تلقائية تتفاعل مع الكلمة، وتخصم نقاط من المستخدم.

🧠 الهدف منها هو التوعية وتقديم تجربة تفاعلية، لكنها تؤثر على نقاطك بشكل سلبي.

📊 شرح كلمات البورصة:
عند كتابة كلمات مثل "تداول" أو "بيع" أو "شراء" أو "صعود" أو "هبوط"، يقوم البوت بمحاكاة عملية تداول حقيقية، يحسب من خلالها نسبة الربح أو الخسارة، ويحدث نقاطك.

⚠️ التداول يحتوي على نسبة مخاطرة، ويمكن أن تكسب أو تخسر بناءً على حظك ونقاطك الحالية.
            `;
        } else {
            helpMessage = `
💊 Drug-related keywords:
When typing words like "weed", "powder", or "pills", the bot responds automatically and deducts points from the user.

🧠 This feature is for awareness and interactive fun, but it negatively affects your points.

📊 Stock Market keywords:
Typing words like "trade", "sell", "buy", "up", or "down" simulates a trading action. The bot will calculate profit or loss percentage and update your points accordingly.

⚠️ Trading carries a risk, and you may win or lose based on luck and your current points.
            `;
        }
    }

    if (helpMessage) {
        const helpMessageObject = createRoomMessage(roomName, helpMessage);
        socket.send(JSON.stringify(helpMessageObject));
        console.log('📘 Sent help message for:', data.body, roomName);
    }
}

module.exports = {
    sendHelpInformation
};
