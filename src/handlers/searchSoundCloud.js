
const axios = require('axios');
const cheerio = require('cheerio');
const { loadRooms, incrementUserGiftCount, loadUsers, getUserLanguage, loadGifts } = require('../fileUtils');
const { createRoomMessage, createAudioRoomMessage, createChatMessage } = require('../messageUtils');

// تخزين الأغاني النشطة: معرف صغير => بيانات الأغنية
const activeSongs = {};

// دالة للحصول على client_id من صفحة SoundCloud
async function getClientId() {
  try {
    const { data: html } = await axios.get('https://soundcloud.com');
    const $ = cheerio.load(html);
    const scriptUrls = [];

    $('script').each((i, el) => {
      const src = $(el).attr('src');
      if (src && src.includes('sndcdn')) scriptUrls.push(src);
    });

    for (const url of scriptUrls) {
      const { data: jsFile } = await axios.get(url);
      const match = jsFile.match(/client_id\s*:\s*"([a-zA-Z0-9-_]+)"/);
      if (match) return match[1];
    }

    throw new Error('لم يتم العثور على client_id');
  } catch (error) {
    console.error('❌ فشل استخراج client_id:', error.message);
  }
}

// دالة توليد معرف قصير عشوائي للأغنية (6 أحرف أرقام وحروف)
function generateShortId(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < length; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

// دالة البحث عن الأغاني باستخدام client_id
async function searchTrack(query) {
  const client_id = await getClientId();
  if (!client_id) return [];

  try {
    const response = await axios.get('https://api-v2.soundcloud.com/search/tracks', {
      params: { q: query, client_id, limit: 1 },
    });
    return response.data.collection;
  } catch (error) {
    console.error('❌ خطأ أثناء البحث:', error.message);
    return [];
  }
}

// دالة تنفيذ أمر تشغيل الأغنية
async function handlePlayCommand(data, socket, senderName) {
  const body = data.body.trim();
  if (!body.startsWith('play ') && !body.startsWith('تشغيل ')) return;

  const songName = body.split(' ').slice(1).join(' ').trim();
  if (!songName) return;

  const lang = getUserLanguage(senderName) || 'ar';

  // إرسال رسالة جارٍ تحميل طلبك مع تصميم شرح واضح
  const loadingMsg = lang === 'ar'
    ? '⏳ جارٍ تحميل طلبك... يرجى الانتظار قليلاً'
    : '⏳ Loading your request... please wait a moment';
  socket.send(JSON.stringify(createRoomMessage(data.room, loadingMsg)));

  try {
    const results = await searchTrack(songName);
    if (!results || results.length === 0) {
      const msg = lang === 'ar'
        ? `❗ لم يتم العثور على أي أغنية بعنوان: "${songName}"`
        : `❗ No track found for: "${songName}"`;
      socket.send(JSON.stringify(createRoomMessage(data.room, msg)));
      return;
    }

    const track = results[0];
    const progressiveTranscoding = track.media.transcodings.find(m => m.format.protocol === 'progressive');
    if (!progressiveTranscoding) {
      const msg = lang === 'ar'
        ? `❗ لا يوجد رابط مباشر للأغنية "${track.title}"`
        : `❗ No direct audio link for "${track.title}"`;
      socket.send(JSON.stringify(createRoomMessage(data.room, msg)));
      return;
    }

    const client_id = await getClientId();
    const transcodeUrl = `${progressiveTranscoding.url}?client_id=${client_id}`;
    const { data: transcodeData } = await axios.get(transcodeUrl);
    const directAudioUrl = transcodeData.url;

    // توليد معرف قصير فريد للأغنية
    let songId;
    do {
      songId = generateShortId();
    } while (activeSongs[songId]); // التأكد من عدم التكرار

    // تخزين بيانات الأغنية النشطة
    activeSongs[songId] = {
      id: songId,
      title: track.title,
      url: directAudioUrl,
      duration: Math.ceil(track.duration / 1000),
      sender: senderName,
      room: data.room
    };

    // إرسال رسالة صوتية مع الرابط المباشر
    socket.send(JSON.stringify(createAudioRoomMessage(data.room, directAudioUrl, Math.ceil(track.duration / 1000))));

    // رسالة نصية توضيحية مع أوامر التفاعل المختصرة
  const text = lang === 'ar'
  ? 
`🎵 ${senderName} طلب تشغيل الأغنية: "${track.title}"

(المعرف: ${songId})

يمكنك التفاعل مع الأغنية باستخدام الأوامر التالية:

❤️ إعجاب: like@${songId}

👎 عدم إعجاب: dislike@${songId}

💬 تعليق: com@${songId}@username نص_تعليقك

🎁 إرسال هدية: gift@${songId}@username إلى اسم_المستخدم

📤 مشاركة الأغنية: sh@${songId}@اسم_المستخدم`
  :
`🎵 ${senderName} requested the track: "${track.title}"

(ID: ${songId})

You can interact with the track using the following commands:

❤️ Like: like@${songId}

👎 Dislike: dislike@${songId}

💬 Comment: com@${songId}@username your comment

🎁 Send gift: gift@${songId}@username to username

📤 Share the track: sh@${songId}@username`;
 socket.send(JSON.stringify(createRoomMessage(data.room, text)));

  } catch (error) {
    const msg = lang === 'ar'
      ? `❌ حدث خطأ أثناء البحث أو جلب رابط الأغنية.`
      : `❌ An error occurred while searching or fetching the audio link.`;
    socket.send(JSON.stringify(createRoomMessage(data.room, msg)));
    console.error(error);
  }
}


// دالة التعامل مع التفاعلات على الأغاني: like@id, dislike@id, comment@id نص
function handleSongReaction(data, actionType, socket) {
  const sender = data.from;
  const room = data.room;
  const body = data.body.trim();

  const parts = body.split('@');
  if (parts.length < 2) return;

  const songId = parts[1].trim();
  const comment = parts.slice(2).join('@').trim();

  const song = activeSongs[songId];
  if (!song) {
    socket.send(JSON.stringify(createChatMessage(sender, `❗ لم يتم العثور على الأغنية بهذا المعرف: ${songId}`)));
    return;
  }

  const targetUser = song.sender;

  let privateMsg = '';
  if (actionType === 'like') privateMsg = `❤️ ${sender} أعجب بالأغنية "${song.title}" التي قمت بتشغيلها.`;
  if (actionType === 'dislike') privateMsg = `👎 ${sender} لم يُعجبه تشغيلك لأغنية "${song.title}".`;
  if (actionType === 'comment') privateMsg = `💬 ${sender} علّق على أغنيتك "${song.title}": ${comment}`;

  socket.send(JSON.stringify(createChatMessage(targetUser, privateMsg)));

  let publicMsg = '';
  if (actionType === 'like') publicMsg = `❤️ ${sender} أعجب بأغنية ${targetUser}`;
  if (actionType === 'dislike') publicMsg = `👎 ${sender} لم يعجبه اختيار ${targetUser}`;
  if (actionType === 'comment') publicMsg = `💬 ${sender} علّق على أغنية ${targetUser}`;

  socket.send(JSON.stringify(createRoomMessage(room, publicMsg)));
}

// دالة التعامل مع المشاركة (sh@id@username) والهدايا (gift@id@username)
function handleSongShare(data, socket) {
  const sender = data.from;
  const lang = getUserLanguage(sender) || 'ar';
  const body = data.body.trim();

  const parts = body.split('@');
  if (parts.length < 3) return;

  const action = parts[0].toLowerCase();
  const songId = parts[1].trim();
  const targetUser = parts[2].trim();

  const song = activeSongs[songId];
  if (!song) {
    const notFoundMsg = lang === 'ar'
      ? `❗ لم يتم العثور على الأغنية بهذا المعرف: ${songId}`
      : `❗ Song with ID ${songId} not found.`;
    socket.send(JSON.stringify(createChatMessage(sender, notFoundMsg)));
    return;
  }

  // إرسال الأغنية للمستلم
  socket.send(JSON.stringify(createAudioRoomMessage(targetUser, song.url, song.duration)));

  const giftText = action === 'gift'
    ? (lang === 'ar'
      ? `🎁 ${sender} أرسل لك أغنية كهدية: "${song.title}"`
      : `🎁 ${sender} sent you a song as a gift: "${song.title}"`)
    : (lang === 'ar'
      ? `📤 ${sender} شارك معك أغنية: "${song.title}"`
      : `📤 ${sender} shared a song with you: "${song.title}"`);

  socket.send(JSON.stringify(createChatMessage(targetUser, giftText)));

  const confirmText = action === 'gift'
    ? (lang === 'ar'
      ? `✅ تم إرسال الأغنية "${song.title}" كهدية إلى ${targetUser}`
      : `✅ Song "${song.title}" was sent as a gift to ${targetUser}`)
    : (lang === 'ar'
      ? `✅ تم مشاركة الأغنية "${song.title}" مع ${targetUser}`
      : `✅ Song "${song.title}" was shared with ${targetUser}`);

  socket.send(JSON.stringify(createChatMessage(sender, confirmText)));
}

// التصدير
module.exports = {
  searchTrack,
  getClientId,
  handlePlayCommand,
  handleSongReaction,
  handleSongShare,
  activeSongs
};
