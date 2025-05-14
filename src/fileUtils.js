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


module.exports = {
    loadRooms, saveRooms, roomExists, addRoom, saveUserLanguage, loadUserLanguage, getUserLanguage,
    loadMasterList, saveMasterList, isUserInMasterList,getUserPoints,
    loadAdminList, saveAdminList, isUserInAdminList,
    loadUserVerifyList, saveUserVerifyList, isUserVerified,
    loadBlockedUsers, saveBlockedUsers, isUserBlocked,
    loadBlockedRooms, saveBlockedRooms, isRoomBlocked,isUserMasterOrInMasterList,deleteRoom,  loadUsers,
    saveUsers,
    addPoints,
    incrementPikachuKills,checkUserExistsOrNotify,
    updateTradeHistory,   // ✅ هنا
    getTradeStats         // ✅ وهنا
};

