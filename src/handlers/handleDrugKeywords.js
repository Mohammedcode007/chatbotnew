const {
    getUserLanguage,
    getUserPoints,
    addPoints,
    updateTradeHistory,
    getTradeStats
} = require('../fileUtils');
const { createRoomMessage } = require('../messageUtils');

const cooldownMap = {}; // { user: { word: lastUsedTimestamp } }

function handleDrugKeywords(data, socket) {
    const sender = data.from;
    const roomName = data.room;
    const body = data.body.trim().toLowerCase();
    const lang = getUserLanguage(sender) || 'ar';

    const drugKeywords = {
        'كوكايين': {
            ar: '🚨 الكوكايين مادة خطيرة تسبب الإدمان والموت.',
            en: '🚨 Cocaine is highly addictive and deadly.'
        },
        'حشيش': {
            ar: '🚨 الحشيش يؤثر على الذاكرة والتركيز.',
            en: '🚨 Hashish affects memory and focus.'
        },
        'هيروين': {
            ar: '🚨 الهيروين يؤدي إلى الإدمان بسرعة شديدة.',
            en: '🚨 Heroin causes severe and rapid addiction.'
        },
        'تامول': {
            ar: '🚨 التامول يسبب إدمانًا جسديًا خطيرًا.',
            en: '🚨 Tramadol causes serious physical addiction.'
        },
        'شابو': {
            ar: '🚨 الشابو مدمر للعقل والجسم.',
            en: '🚨 Shabu destroys the mind and body.'
        },
        'بانجو': {
            ar: '🚨 البانجو يؤثر سلبًا على الجهاز العصبي.',
            en: '🚨 Bangoo negatively affects the nervous system.'
        },
        'استروكس': {
            ar: '🚨 الاستروكس قد يؤدي إلى الهلاوس والموت المفاجئ.',
            en: '🚨 Strox can cause hallucinations and sudden death.'
        },
        'حقن': {
            ar: '🚨 الحقن يزيد خطر الإصابة بالأمراض.',
            en: '🚨 Injections increase the risk of disease.'
        },
        'مخدرات': {
            ar: '🚨 المخدرات تدمر مستقبل الإنسان.',
            en: '🚨 Drugs destroy the future of a person.'
        }
    };

    if (!Object.keys(drugKeywords).includes(body)) return;

    // إعداد التبريد للمستخدم والكلمة
    if (!cooldownMap[sender]) cooldownMap[sender] = {};

    const now = Date.now();
    const lastUsed = cooldownMap[sender][body] || 0;
    const COOLDOWN_TIME = 3 * 60 * 1000; // 3 دقائق

    if (now - lastUsed < COOLDOWN_TIME) {
        const remaining = Math.ceil((COOLDOWN_TIME - (now - lastUsed)) / 1000);
        const waitMessage = lang === 'ar'
            ? `⏳ يجب الانتظار ${remaining} ثانية قبل استخدام كلمة "${body}" مرة أخرى.`
            : `⏳ Please wait ${remaining} seconds before using the word "${body}" again.`;
        socket.send(JSON.stringify(createRoomMessage(roomName, waitMessage)));
        return;
    }

    // سجل آخر استخدام
    cooldownMap[sender][body] = now;

    // إرسال التحذير
    const warningMessage = drugKeywords[body][lang];
    socket.send(JSON.stringify(createRoomMessage(roomName, warningMessage)));

    // إرسال رسالة تحليل
    const checking = lang === 'ar'
        ? '⏳ جاري تحليل التأثير...'
        : '⏳ Analyzing effect...';
    socket.send(JSON.stringify(createRoomMessage(roomName, checking)));

    setTimeout(() => {
        const currentPoints = getUserPoints(sender);
        if (currentPoints <= 0) {
            const msg = lang === 'ar'
                ? '❌ ليس لديك نقاط كافية لتأثر الكلمة.'
                : '❌ You don’t have enough points to process this.';
            socket.send(JSON.stringify(createRoomMessage(roomName, msg)));
            return;
        }

        // تحديد إذا كانت خسارة أو ربح
        const isLoss = Math.random() < 0.85;
        let percentChange = isLoss
            ? -1 * (Math.floor(Math.random() * 31) + 10) // -10% إلى -40%
            : Math.floor(Math.random() * 5) + 1;         // +1% إلى +5%

        const pointsChange = Math.floor(currentPoints * (percentChange / 100));
        const finalPoints = addPoints(sender, pointsChange);

        // تحديث السجل
        updateTradeHistory(sender, percentChange > 0);

        // رسالة النتيجة
        let resultMessage;
        if (percentChange === 0) {
            resultMessage = lang === 'ar'
                ? `💤 لم تتأثر نقاطك هذه المرة.`
                : `💤 No effect on your points this time.`;
        } else if (percentChange > 0) {
            resultMessage = lang === 'ar'
                ? `✅ نجوت هذه المرة وربحت ${pointsChange} نقطة (+${percentChange}%)!`
                : `✅ You got lucky and gained ${pointsChange} points (+${percentChange}%)!`;
        } else {
            resultMessage = lang === 'ar'
                ? `❌ تم خصم ${Math.abs(pointsChange)} نقطة بسبب الكلمة (${percentChange}%)!`
                : `❌ ${Math.abs(pointsChange)} points were deducted due to the word (${percentChange}%)!`;
        }

        const stats = getTradeStats(sender);
        resultMessage += lang === 'ar'
            ? `\n📊 سجلك: ${stats.win} ربح / ${stats.lose} خسارة (${stats.percent}٪ نجاح)`
            : `\n📊 Your stats: ${stats.win} win / ${stats.lose} loss (${stats.percent}% success)`;

        socket.send(JSON.stringify(createRoomMessage(roomName, resultMessage)));
        console.log(`[🚫 DRUG] ${sender} used '${body}' → ${percentChange}% (${pointsChange} points)`);
    }, 2000);
}

module.exports = {
    handleDrugKeywords
};
