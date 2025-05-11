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


module.exports = { loadRooms, saveRooms, roomExists, addRoom ,saveUserLanguage,loadUserLanguage,getUserLanguage};
