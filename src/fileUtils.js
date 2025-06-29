//src/fileUtils
const fs = require('fs');
const path = require('path');

const roomsFilePath = './rooms.json';
const usersLangFilePath = './usersLang.json';
const usersFilePath = './usersLang.json'; // مسار ملف المستخدمين
const { masterListPath, adminListPath, blockedUsersPath, blockedRoomsPath } = require('./constants');
const USERS_FILE = path.join(__dirname, './data/verifiedUsers.json');
const { createRoomMessage } = require('./messageUtils');

function loadRooms() {
    if (fs.existsSync(roomsFilePath)) {
        const data = fs.readFileSync(roomsFilePath);
        return JSON.parse(data);
    }
    return [];
}

function saveRooms(rooms) {
    fs.writeFileSync(roomsFilePath, JSON.stringify(rooms, null, 2));
}

function roomExists(rooms, roomName) {
    return rooms.some(room => room.roomName === roomName);
}
function deleteRoom(roomName) {
    console.log(roomName,'45454545');
    
    const rooms = loadRooms(); // تحميل الغرف من الملف

    // البحث عن الغرفة التي تحمل نفس الاسم
    const roomIndex = rooms.findIndex(room => room.roomName === roomName);

    if (roomIndex !== -1) {
        // إذا كانت الغرفة موجودة، نقوم بحذفها من المصفوفة
        rooms.splice(roomIndex, 1);
        saveRooms(rooms); // حفظ التعديلات على الملف
        console.log(`تم حذف الغرفة: ${roomName}`);
    } else {
        console.log(`لم يتم العثور على الغرفة: ${roomName}`);
    }
}

function addRoom(rooms, newRoom) {
    rooms.push(newRoom);
    saveRooms(rooms);
}

function loadUserLanguage() {
    if (fs.existsSync(usersLangFilePath)) {
        const data = fs.readFileSync(usersLangFilePath);
        return JSON.parse(data);
    }
    return {};
}

function saveUserLanguage(username, language) {
    const usersLang = loadUserLanguage();
    usersLang[username] = language;
    fs.writeFileSync(usersLangFilePath, JSON.stringify(usersLang, null, 2));
}


function getUserLanguage(username) {
    try {
        const data = fs.readFileSync(usersFilePath, 'utf8');
        const users = JSON.parse(data);

        // التحقق من وجود اسم المستخدم في الملف
        if (users.hasOwnProperty(username)) {
            return users[username]; // إرجاع اللغة المرتبطة باسم المستخدم
        } else {
            return null; // إذا لم يكن هناك اسم المستخدم في البيانات
        }
    } catch (error) {
        console.error('Error reading users file:', error);
        return null; // إرجاع null في حالة حدوث خطأ
    }
}

// دوال التعامل مع ملفات المستخدمين والبيانات الأخرى (master, admin, userverify, blocked)
function loadMasterList() {
    if (fs.existsSync(masterListPath)) {
        const data = fs.readFileSync(masterListPath);
        return JSON.parse(data);
    }
    return [];
}

function saveMasterList(masterList) {
    fs.writeFileSync(masterListPath, JSON.stringify(masterList, null, 2));
}

function loadAdminList() {
    if (fs.existsSync(adminListPath)) {
        const data = fs.readFileSync(adminListPath);
        return JSON.parse(data);
    }
    return [];
}

function saveAdminList(adminList) {
    fs.writeFileSync(adminListPath, JSON.stringify(adminList, null, 2));
}

function loadUserVerifyList() {
    if (fs.existsSync(userVerifyListPath)) {
        const data = fs.readFileSync(userVerifyListPath);
        return JSON.parse(data);
    }
    return [];
}

function saveUserVerifyList(userVerifyList) {
    fs.writeFileSync(userVerifyListPath, JSON.stringify(userVerifyList, null, 2));
}

function loadBlockedUsers() {
    if (fs.existsSync(blockedUsersPath)) {
        const data = fs.readFileSync(blockedUsersPath);
        return JSON.parse(data);
    }
    return [];
}

function saveBlockedUsers(blockedUsers) {
    fs.writeFileSync(blockedUsersPath, JSON.stringify(blockedUsers, null, 2));
}

function loadBlockedRooms() {
    if (fs.existsSync(blockedRoomsPath)) {
        const data = fs.readFileSync(blockedRoomsPath);
        return JSON.parse(data);
    }
    return [];
}

function saveBlockedRooms(blockedRooms) {
    fs.writeFileSync(blockedRoomsPath, JSON.stringify(blockedRooms, null, 2));
}

// دوال للتحقق من وجود المستخدمين أو الغرف في القوائم
function isUserInMasterList(username) {
    const masterList = loadMasterList();
    return masterList.includes(username);
}

function isUserInAdminList(username) {
    const adminList = loadAdminList();
    return adminList.includes(username);
}

function isUserVerified(username) {
    const userVerifyList = loadUserVerifyList();
    return userVerifyList.includes(username);
}

function isUserBlocked(username) {
    const blockedUsers = loadBlockedUsers();
    return blockedUsers.includes(username);
}

function isRoomBlocked(roomName) {
    const blockedRooms = loadBlockedRooms();
    return blockedRooms.includes(roomName);
}
function isUserMasterOrInMasterList(username, roomName) {
    const rooms = loadRooms();
    
    // التحقق مما إذا كان المستخدم ماستر في الغرفة
    const room = rooms.find(r => r.roomName === roomName);
    if (room) {
        // التحقق من أن المستخدم ماستر في الغرفة أو في قائمة الماستر
        if (room.master === username || room.masterList.includes(username)) {
            return true; // المستخدم ماستر في الغرفة أو في قائمة الماستر
        }
    }
    
    // إذا لم يكن في الغرفة، تحقق من قائمة الماستر العامة
    const masterList = loadMasterList();
    if (masterList.includes(username)) {
        return true; // المستخدم موجود في قائمة الماستر العامة
    }

    return false; // إذا لم يكن في أي من القائمتين
}


// تحميل المستخدمين من الملف
function loadUsers() {
    if (!fs.existsSync(USERS_FILE)) return [];
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(data);
}

// حفظ المستخدمين في الملف
function saveUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
}
function getUserProfileUrl(username) {
    const users = loadUsers();
    const user = users.find(u => u.username === username);
    if (user && user.profileUrl) {
      return user.profileUrl;
    } else {
      // إرجاع رابط افتراضي إذا لم يوجد المستخدم أو لم تكن له صورة
      return `https://api.multiavatar.com/${encodeURIComponent(username)}.png`;
    }
  }
function incrementUserGiftCount(username, type) {
    const users = loadUsers();

    const user = users.find(u => u.username === username);
    if (!user) return; // المستخدم غير موجود

    // تأكد من وجود الحقول
    if (typeof user.sentGifts !== 'number') user.sentGifts = 0;
    if (typeof user.receivedGifts !== 'number') user.receivedGifts = 0;

    if (type === 'sentGifts') user.sentGifts += 1;
    else if (type === 'receivedGifts') user.receivedGifts += 1;

    saveUsers(users);
}
// زيادة النقاط للمستخدم
function addPoints(username, amount = 1000) {
    const users = loadUsers();
    const user = users.find(u => u.username === username);
    if (user) {
        user.points = (user.points || 0) + amount;
        saveUsers(users);
        return user.points;
    }
    return null;
}

function getUserRooms(username) {
    const rooms = loadRooms();
    if (!Array.isArray(rooms)) return [];
  
    return rooms.flatMap(room => {
      const foundUser = room.users?.find(u => u.username === username);
      if (foundUser) {
        return [{ roomName: room.roomName, role: foundUser.role }];
      }
      return [];
    });
  }
  

 
// زيادة عداد قتل البيكاتشو
function incrementPikachuKills(username) {
    const users = loadUsers();
    const user = users.find(u => u.username === username);
    if (user) {
        user.pikachuKills = (user.pikachuKills || 0) + 1;
        saveUsers(users);
        return user.pikachuKills;
    }
    return null;
}

function checkUserExistsOrNotify(username, roomName, socket) {
    const users = loadUsers();
    const userExists = users.some(u => u.username === username);

    if (!userExists) {
        const lang = getUserLanguage(username) || 'en';

        const notifyMessage = lang === 'ar'
            ? `📢 عزيزي ${username}، يرجى مراسلة "ا◙☬ځُــۥـ☼ـڈ◄أڵـــســمـــٱ۽►ـۉد☼ــۥــۓ☬◙ا" لتوثيق الحساب.`
            : `📢 Dear ${username}, please contact "ا◙☬ځُــۥـ☼ـڈ◄أڵـــســمـــٱ۽►ـۉد☼ــۥــۓ☬◙ا" to verify your account.`;

        const msg = createRoomMessage(roomName, notifyMessage);
        if (socket && socket.readyState === 1) {
            socket.send(JSON.stringify(msg));
            console.log(`[🔒 Unverified] User ${username} not found. Notified in room ${roomName}`);
        }
        return false;
    }

    return true;
}
// جلب عدد نقاط المستخدم
function getUserPoints(username) {
    const users = loadUsers();
    const user = users.find(u => u.username === username);
    return user ? (user.points || 0) : 0;
}
function updateTradeHistory(username, wasWin) {
    const users = loadUsers();
    let user = users.find(u => u.username === username);

    if (!user) return;

    // التأكد من وجود كائن سجل التداول
    if (!user.trades || typeof user.trades !== 'object') {
        user.trades = { win: 0, lose: 0 };
    }

    if (wasWin) {
        user.trades.win += 1;
    } else {
        user.trades.lose += 1;
    }

    saveUsers(users);
}

function getTradeStats(username) {
    const users = loadUsers();
    const user = users.find(u => u.username === username);

    if (!user || !user.trades || typeof user.trades !== 'object') {
        return { win: 0, lose: 0, total: 0, percent: 0 };
    }

    const { win, lose } = user.trades;
    const total = win + lose;
    const percent = total === 0 ? 0 : Math.round((win / total) * 100);

    return { win, lose, total, percent };
}






function loadGifts() {
    const filePath = path.join(__dirname, 'data', 'exampleGifts.json');

    // التحقق من وجود الملف
    if (!fs.existsSync(filePath)) {
        // إنشاء مجلد data إذا لم يكن موجودًا
        const dirPath = path.join(__dirname, 'data');
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath);
        }

        // إنشاء الملف مع بيانات افتراضية
        const defaultGifts = [
            { id: 1, name: 'Red Rose', urls: ['https://example.com/gift1.png'] },
            { id: 2, name: 'Chocolate Box', urls: ['https://example.com/gift2.png'] },
            { id: 3, name: 'Golden Trophy', urls: ['https://example.com/gift3.png'] }
        ];

        fs.writeFileSync(filePath, JSON.stringify(defaultGifts, null, 2), 'utf8');
        return defaultGifts;
    }

    // قراءة البيانات من الملف
    const data = fs.readFileSync(filePath, 'utf8');
    const gifts = JSON.parse(data);

    // اختيار رابط عشوائي لكل هدية
    gifts.forEach(gift => {
        const randomIndex = Math.floor(Math.random() * gift.urls.length);
        gift.url = gift.urls[randomIndex];  // اختيار رابط عشوائي
    });

    return gifts;
}



// دالة لعرض قائمة الهدايا المتاحة
function showAvailableGifts(socket, room) {
    const gifts = loadGifts();
    let message = '🎁 Available Gifts:\n';
    
    gifts.forEach(gift => {
        message += `${gift.id}. ${gift.name}\n`;
    });

    const giftListMessage = createRoomMessage(room, message);
    socket.send(JSON.stringify(giftListMessage));
}
// جلب مستخدمي غرفة معينة مع أدوارهم
function getUsersInRoom(roomName) {
  const rooms = loadRooms();
  const room = rooms.find(r => r.roomName === roomName);
  if (!room) {
    return null; // الغرفة غير موجودة
  }
  return room.users || [];
}


// دالة لتحديث عدد الرسائل في الغرفة عند إرسال رسالة
function incrementRoomMessageCount(roomName) {
  if (!roomName) return;

  const rooms = loadRooms();
  const roomIndex = rooms.findIndex(room => room.roomName === roomName);

  if (roomIndex === -1) return; // الغرفة غير موجودة

  // إضافة الخاصية إذا لم تكن موجودة فعلاً
  if (!rooms[roomIndex].hasOwnProperty("messageCount")) {
    rooms[roomIndex].messageCount = 0;
  }

  // زيادة عدد الرسائل بمقدار 1
  rooms[roomIndex].messageCount += 1;

  // حفظ التعديلات
  saveRooms(rooms);
}
function getTop10RoomsByMessages() {
  const rooms = loadRooms();

  // ترتيب الغرف تنازليًا حسب messageCount، وإذا لم تكن موجودة نعتبرها 0
  const sortedRooms = rooms
    .map(room => ({
      ...room,
      messageCount: room.hasOwnProperty("messageCount") ? room.messageCount : 0
    }))
    .sort((a, b) => b.messageCount - a.messageCount);

  // جلب أول 10 فقط
  const top10Rooms = sortedRooms.slice(0, 10);

  return top10Rooms;
}
function formatNumberShort(n) {
  if (n < 1000) return n.toString();

  const units = [
    "", "k", "M", "B", "T",  // ألف - مليون - مليار - تريليون
    "Q",   // Quadrillion
    "Qi",  // Quintillion
    "Sx",  // Sextillion
    "Sp",  // Septillion
    "Oc",  // Octillion
    "No"   // Nonillion
  ];

  const order = Math.floor(Math.log10(n) / 3);
  const unit = units[order] || `e${order * 3}`;
  const num = n / Math.pow(1000, order);

  return num % 1 === 0 ? `${num}${unit}` : `${num.toFixed(1)}${unit}`;
}

function setNotifyOnSearch(username, value) {
    const users = loadUsers();
  console.log(users);
  
    const user = users.find(u => u.username === username);
    if (!user) return false;
  
    user.notifyOnSearch = (value === 'true'); // التأكد من التحويل إلى Boolean
  
    saveUsers(users);
    return true;
  }
  

module.exports = {
    loadRooms,getUsersInRoom,getTop10RoomsByMessages, formatNumberShort,saveRooms,showAvailableGifts,loadGifts, roomExists, addRoom, saveUserLanguage, loadUserLanguage, getUserLanguage,
    loadMasterList, saveMasterList,incrementRoomMessageCount, isUserInMasterList,getUserPoints,
    loadAdminList, saveAdminList, isUserInAdminList,
    loadUserVerifyList, saveUserVerifyList, isUserVerified,
    loadBlockedUsers, saveBlockedUsers, isUserBlocked,
    loadBlockedRooms, saveBlockedRooms, isRoomBlocked,isUserMasterOrInMasterList,deleteRoom,  loadUsers,
    saveUsers,incrementUserGiftCount,
    addPoints,
    incrementPikachuKills,checkUserExistsOrNotify,
    updateTradeHistory,   // ✅ هنا
    getTradeStats  ,
    getUserRooms   ,
    getUserProfileUrl,
    setNotifyOnSearch    // ✅ وهنا
};

