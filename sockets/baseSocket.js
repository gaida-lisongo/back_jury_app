class BaseSocket {
    constructor(io) {
        this.io = io;
    }

    initialize(namespace) {
        this.nsp = this.io.of(namespace);
        this.nsp.on('connection', (socket) => {
            console.log(`Client connected to ${namespace}`);
            this.handleConnection(socket);
        });
    }

    handleConnection(socket) {
        // À implémenter dans les classes enfants
    }
}

module.exports = BaseSocket;