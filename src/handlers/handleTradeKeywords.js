const { getUserLanguage, checkUserExistsOrNotify } = require('../fileUtils');
const { addPoints, getUserPoints, updateTradeHistory, getTradeStats } = require('../fileUtils');
const { createRoomMessage } = require('../messageUtils');

function handleTradeKeywords(data, socket) {
    const sender = data.from;
    const roomName = data.room;
    const body = data.body.trim().toLowerCase();

    const lang = getUserLanguage(sender) || 'ar';

    // كلمات مفردة فقط تدل على التداول
    const tradeKeywords = {
        'بورصة': {
            ar: '📊 صفقة جديدة في البورصة!',
            en: '📊 New stock market deal!'
        },
        'تداول': {
            ar: '💹 تم تنفيذ أمر تداول الآن!',
            en: '💹 Trade order has been executed!'
        },
        'شراء': {
            ar: '🟢 عملية شراء تمت... نترقب الربح!',
            en: '🟢 Purchase completed... awaiting profit!'
        },
        'بيع': {
            ar: '🔴 عملية بيع تمت... قد تخسر!',
            en: '🔴 Sale completed... you may lose!'
        },
        'تحليل': {
            ar: '📉 يتم تحليل السوق... القرار بيدك.',
            en: '📉 Analyzing the market... the decision is yours.'
        },
        'مضاربة': {
            ar: '⚠️ مضاربة شديدة الخطورة! تم التنفيذ.',
            en: '⚠️ High-risk speculation! Executed.'
        },
        'هبوط': {
            ar: '📉 السوق في هبوط حاد... احذر الخسارة.',
            en: '📉 The market is in a sharp decline... beware of losses.'
        },
        'صعود': {
            ar: '📈 صعود صاروخي! ربح متوقع.',
            en: '📈 Rocket rise! Expected profit.'
        },
        'اشاعة': {
            ar: '❗ السوق يتحرك بسبب إشاعة غير مؤكدة.',
            en: '❗ Market is moving due to an unconfirmed rumor.'
        },
        'توصية': {
            ar: '📝 تم تلقي توصية جديدة... قرر بحكمة.',
            en: '📝 A new recommendation has been received... decide wisely.'
        }
    };

    // تحقق من وجود الكلمة
    if (!Object.keys(tradeKeywords).includes(body)) return;

    // إرسال الرسالة التعريفية (قبل الحساب)
    const introMessage = tradeKeywords[body][lang];
    socket.send(JSON.stringify(createRoomMessage(roomName, introMessage)));

    // رسالة جاري حساب التداول
    const calculatingMessage = lang === 'ar' ? 'جارٍ حساب البورصة... انتظر قليلاً' : 'Calculating the market... please wait a moment';
    socket.send(JSON.stringify(createRoomMessage(roomName, calculatingMessage)));

    // تأخير 2 ثانية (أو أكثر) لمحاكاة الحساب
    setTimeout(() => {
        // تحقق من وجود المستخدم
        const currentPoints = getUserPoints(sender);
        if (currentPoints <= 0) {
            const msg = lang === 'ar'
                ? `❌ ليس لديك نقاط كافية للتداول.`
                : `❌ You don't have enough points to trade.`;
            socket.send(JSON.stringify(createRoomMessage(roomName, msg)));
            return;
        }

        // تحديد نسبة التغير بناء على الكلمة
        let percentChange;
        if (body === 'شراء' || body === 'صعود') {
            percentChange = Math.floor(Math.random() * 16) + 5; // من +5% إلى +20%
        } else if (body === 'بيع' || body === 'هبوط') {
            percentChange = -1 * (Math.floor(Math.random() * 16) + 5); // من -5% إلى -20%
        } else if (body === 'مضاربة') {
            percentChange = Math.floor(Math.random() * 41) - 20; // من -20% إلى +20%
        } else {
            percentChange = Math.floor(Math.random() * 21) - 10; // من -10% إلى +10%
        }

        const pointsChange = Math.floor(currentPoints * (percentChange / 100));
        const finalPoints = addPoints(sender, pointsChange);

        // تحديث السجل
        updateTradeHistory(sender, percentChange > 0);
        const stats = getTradeStats(sender);

        // إعداد الرسالة النهائية
        let response;
        if (percentChange === 0) {
            response = lang === 'ar'
                ? `💼 لم تربح أو تخسر في التداول هذه المرة.`
                : `💼 No gain or loss in this trade.`;
        } else if (percentChange > 0) {
            response = lang === 'ar'
                ? `📈 ربح ${sender} ${pointsChange} نقطة (+${percentChange}%)!`
                : `📈 ${sender} earned ${pointsChange} points (+${percentChange}%)!`;
        } else {
            response = lang === 'ar'
                ? `📉 خسر ${sender} ${Math.abs(pointsChange)} نقطة (${percentChange}%)!`
                : `📉 ${sender} lost ${Math.abs(pointsChange)} points (${percentChange}%)!`;
        }

        // إضافة إحصائيات التداول
        response += lang === 'ar'
            ? `\n📊 سجل تداولك: ${stats.win} ربح / ${stats.lose} خسارة (${stats.percent}٪ نجاح)`
            : `\n📊 Trade history: ${stats.win} win / ${stats.lose} loss (${stats.percent}% success)`;

        socket.send(JSON.stringify(createRoomMessage(roomName, response)));
        console.log(`[📊 TRADE] ${sender} used '${body}' → ${percentChange}% (${pointsChange} points)`);
    }, 2000); // تأخير 2 ثانية
}

module.exports = {
    handleTradeKeywords
};
