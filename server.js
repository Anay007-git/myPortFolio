import { Server } from "socket.io";

const io = new Server(3000, {
    cors: {
        origin: "*",
    },
});

const players = {};

io.on("connection", (socket) => {
    console.log("Player connected:", socket.id);

    // Initialize player
    players[socket.id] = {
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0, w: 1 },
        action: 'idle'
    };

    // Send current players to new player
    socket.emit('players', players);

    // Broadcast new player to others
    socket.broadcast.emit('playerJoined', { id: socket.id, data: players[socket.id] });

    socket.on("move", (data) => {
        if (players[socket.id]) {
            players[socket.id] = { ...players[socket.id], ...data };
            socket.broadcast.emit('playerMoved', { id: socket.id, data: players[socket.id] });
        }
    });

    socket.on("disconnect", () => {
        console.log("Player disconnected:", socket.id);
        delete players[socket.id];
        io.emit('playerLeft', socket.id);
    });
});

console.log("Socket server running on port 3000");
