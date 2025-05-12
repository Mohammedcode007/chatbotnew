//src/fileUtils
const fs = require('fs');
const roomsFilePath = './rooms.json';
const usersLangFilePath = './usersLang.json';
const usersFilePath = './usersLang.json'; // مسار ملف المستخدمين

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


module.exports = {
    loadRooms, saveRooms, roomExists, addRoom, saveUserLanguage, loadUserLanguage, getUserLanguage,
    loadMasterList, saveMasterList, isUserInMasterList,
    loadAdminList, saveAdminList, isUserInAdminList,
    loadUserVerifyList, saveUserVerifyList, isUserVerified,
    loadBlockedUsers, saveBlockedUsers, isUserBlocked,
    loadBlockedRooms, saveBlockedRooms, isRoomBlocked
};

