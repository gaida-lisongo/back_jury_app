const BaseSocket = require('./baseSocket');

class HomeSocket extends BaseSocket {
    constructor(io) {
        super(io);
        this.initialize('/home');
    }

    handleConnection(socket) {
        socket.on('home:stats', async () => {
            // Logique pour les stats
            socket.emit('home:stats:update', { /* data */ });
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected from home');
        });
    }
}

module.exports = HomeSocket;