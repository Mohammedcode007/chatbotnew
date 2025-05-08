const fs = require('fs');
const WebSocket = require('ws');
const roomsFilePath = './rooms.json';

const loginToSocket = ({ username, password, joinRoom }) => {
    const socket = new WebSocket('wss://chatp.net:5333/server');

    socket.onopen = () => {
        console.log(`✅ Connected to WebSocket for ${username}`);

        const loginMessage = {
            handler: 'login',
            username,
            password,
            session: 'PQodgiKBfujFZfvJTnmM',
            sdk: '25',
            ver: '332',
            id: 'xOEVOVDfdSwVCjYqzmTT'
        };

        socket.send(JSON.stringify(loginMessage));
        console.log('🔐 Login message sent.');

    
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('📩 Message received:', data);

        // Join room after login success (if requested)
        if (data.handler === 'login_event' && data.type === 'success' && joinRoom) {
            const joinRoomMessage = {
                handler: 'room_join',
                id: 'QvyHpdnSQpEqJtVbHbFY', // Replace with your real ID
                name: joinRoom
            };
            socket.send(JSON.stringify(joinRoomMessage));
            console.log(`✅ Joined room: ${joinRoom}`);

            // Load existing rooms from file or create an empty array
            let rooms = [];
            if (fs.existsSync('./rooms.json')) {
                const roomsData = fs.readFileSync('./rooms.json');
                rooms = JSON.parse(roomsData);
            }

            // Check if the room already exists
            const roomExists = rooms.some(room => room.roomName === joinRoom);
            if (!roomExists) {
                // Add the new room to the list
                const roomDetails = {
                    roomName: joinRoom,
                    master: data.from // The master is the user who sent the message
                };

                rooms.push(roomDetails);

                // Write the updated list of rooms to the file
                fs.writeFileSync('./rooms.json', JSON.stringify(rooms, null, 2));
                console.log(`📂 Room details saved in rooms.json`);
            } else {
                console.log(`⚠️ Room "${joinRoom}" already exists. Not adding again.`);
                // Inform the user that the room already exists
                const privateMessage = {
                    handler: 'chat_message',
                    id: 'e4e72b1f-46f5-4156-b04e-ebdb84a2c1c2',
                    to: data.from,  // You can replace this with the sender username if needed
                    body: `❌ Room "${joinRoom}" already exists. Skipping join.`,
                    type: 'text'
                };
                socket.send(JSON.stringify(privateMessage));
            }
        }

        // Handle incoming command messages
        if (data.handler === 'chat_message' && data.body) {
            const body = data.body.trim();

            // Case: login#username#password#room
            if (body.startsWith('login#')) {
                const parts = body.split('#');
                if (parts.length >= 4) {
                    const loginUsername = parts[1];
                    const loginPassword = parts.slice(2, parts.length - 1).join('#');
                    const roomName = parts[parts.length - 1];
                    const senderUsername = data.from;

                    // Load existing rooms from file or create an empty array
                    let rooms = [];
                    if (fs.existsSync('./rooms.json')) {
                        const roomsData = fs.readFileSync('./rooms.json');
                        rooms = JSON.parse(roomsData);
                    }

                    // Check if the room already exists
                    const roomExists = rooms.some(room => room.roomName === roomName);
                    if (roomExists) {
                        // Inform the user that the room already exists
                        const privateMessage = {
                            handler: 'chat_message',
                            id: 'e4e72b1f-46f5-4156-b04e-ebdb84a2c1c2',
                            to: senderUsername,
                            body: `❌ Room "${roomName}" already exists. Skipping join.`,
                            type: 'text'
                        };
                        socket.send(JSON.stringify(privateMessage));
                        console.log(`⚠️ Room "${roomName}" already exists. Skipping join.`);
                    } else {
                        // Proceed with login and room joining
                        const loginSocket = new WebSocket('wss://chatp.net:5333/server');
                        loginSocket.onopen = () => {
                            const loginMsg = {
                                handler: 'login',
                                username: loginUsername,
                                password: loginPassword,
                                session: 'PQodgiKBfujFZfvJTnmM',
                                sdk: '25',
                                ver: '332',
                                id: 'xOEVOVDfdSwVCjYqzmTT'
                            };
                            loginSocket.send(JSON.stringify(loginMsg));
                        };

                        loginSocket.onmessage = (loginEvent) => {
                            const loginData = JSON.parse(loginEvent.data);
                            if (loginData.handler === 'login_event') {
                                const privateMessage = {
                                    handler: 'chat_message',
                                    id: 'e4e72b1f-46f5-4156-b04e-ebdb84a2c1c2',
                                    to: senderUsername,
                                    body:
                                        loginData.type === 'success'
                                            ? `✅ Login successful for ${loginUsername}`
                                            : `❌ Login failed for ${loginUsername}`,
                                    type: 'text'
                                };
                                socket.send(JSON.stringify(privateMessage));

                                if (loginData.type === 'success') {
                                    const joinRoomMessage = {
                                        handler: 'room_join',
                                        id: 'QvyHpdnSQpEqJtVbHbFY',
                                        name: roomName
                                    };
                                    loginSocket.send(JSON.stringify(joinRoomMessage));


                                    const roomDetails = {
                                        roomName: roomName,
                                        master: senderUsername,
                                        username: loginUsername,
                                        password: loginPassword
                                    };
                                    rooms.push(roomDetails);

                                    // Write the updated list of rooms to the file
                                    fs.writeFileSync('./rooms.json', JSON.stringify(rooms, null, 2));
                                    console.log(`📂 Room details saved in rooms.json`);
                                }
                            }
                        };
                    }
                }
            }

            // Case: join@roomName → login with default credentials then join room
            if (body.startsWith('join@')) {
                const roomName = body.split('@')[1]?.trim();
                if (roomName) {
                    console.log(`🔁 Auto login and join requested for room: ${roomName}`);

                    // Load existing rooms from file
                    let rooms = [];
                    if (fs.existsSync('./rooms.json')) {
                        const roomsData = fs.readFileSync('./rooms.json');
                        rooms = JSON.parse(roomsData);
                    }

                    // Check if the room already exists
                    const roomExists = rooms.some(room => room.roomName === roomName);
                    if (roomExists) {
                        // Inform the user that the room already exists
                        const privateMessage = {
                            handler: 'chat_message',
                            id: 'e4e72b1f-46f5-4156-b04e-ebdb84a2c1c2',
                            to: data.from,  // You can replace this with the sender username if needed
                            body: `❌ Room "${roomName}" already exists. Skipping join.`,
                            type: 'text'
                        };
                        socket.send(JSON.stringify(privateMessage));
                        console.log(`⚠️ Room "${roomName}" already exists. Skipping join.`);
                    } else {
                        // Create a WebSocket connection for the login process
                        const loginSocket = new WebSocket('wss://chatp.net:5333/server');

                        loginSocket.onopen = () => {
                            const loginMsg = {
                                handler: 'login',
                                username: 'test-bott',
                                password: '12345678',
                                session: 'PQodgiKBfujFZfvJTnmM',
                                sdk: '25',
                                ver: '332',
                                id: 'xOEVOVDfdSwVCjYqzmTT'
                            };
                            loginSocket.send(JSON.stringify(loginMsg));
                            console.log('🔐 Login message sent for auto login.');
                        };

                        loginSocket.onmessage = (loginEvent) => {
                            const loginData = JSON.parse(loginEvent.data);
                            console.log('📩 Login response:', loginData);

                            if (loginData.handler === 'login_event') {
                                const privateMessage = {
                                    handler: 'chat_message',
                                    id: 'e4e72b1f-46f5-4156-b04e-ebdb84a2c1c2',
                                    to: data.from,  // You can replace this with the sender username if needed
                                    body:
                                        loginData.type === 'success'
                                            ? `✅ Login successful for test-bott`
                                            : `❌ Login failed for test-bott`,
                                    type: 'text'
                                };
                                socket.send(JSON.stringify(privateMessage));

                                // If login is successful, join the room
                                if (loginData.type === 'success') {
                                    const joinRoomMessage = {
                                        handler: 'room_join',
                                        id: 'QvyHpdnSQpEqJtVbHbFY',  // Replace with your room ID
                                        name: roomName
                                    };
                                    loginSocket.send(JSON.stringify(joinRoomMessage));
                                    console.log(`✅ Joined room: ${roomName}`);

                                    // Add the new room to the list
                                    const roomDetails = {
                                        roomName: roomName,
                                        master: data.from,
                                        username: 'test-bott',
                                        password: '12345678'
                                    };

                                    rooms.push(roomDetails);

                                    // Write the updated list of rooms to the file
                                    fs.writeFileSync('./rooms.json', JSON.stringify(rooms, null, 2));
                                    console.log(`📂 Room details saved in rooms.json`);
                                }
                            }
                        };

                        loginSocket.onerror = (error) => {
                            console.error('⚠️ WebSocket error during login:', error);
                        };
                    }
                }
            }

        }
    };
};

module.exports = loginToSocket;