const WebSocket = require('ws');

const P2P_PORT = process.env.P2P_PORT || 5001;
const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];

class P2PServer {
    constructor(blockchain) {
        this.blockchain = blockchain;
        this.sockets = [];
    }

    listen() {
        const config = {
            port: P2P_PORT
        };
        const server = new WebSocket.Server(config);
        server.on('connection', socket => this.connectSocket(socket));

        this.connectToPeers();

        console.log(`Listening to p2p connections on: ${P2P_PORT}`)
    }

    connectSocket(socket) {
        this.sockets.push(socket);
        console.log("Socket connected");

        this.messageHandler(socket);

        this.sendChain(socket);
    }

    connectToPeers() {
        peers.forEach(peer => {
            const socket = new WebSocket(peer);
            socket.on('open', () => {
                this.connectSocket(socket);
            });
        });
    }

    messageHandler(socket) {
        socket.on('message', message => {
            const data = JSON.parse(message);
            this.blockchain.replaceChain(data);
        });
    }

    syncChains() {
        this.sockets.forEach(socket => {
            this.sendChain(socket);
        });
    }

    sendChain(socket) {
        const message = JSON.stringify(this.blockchain.chain);
        socket.send(message);
    }
}

module.exports = P2PServer;