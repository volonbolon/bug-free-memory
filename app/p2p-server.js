const WebSocket = require('ws');

const P2P_PORT = process.env.P2P_PORT || 5001;
const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];
const MESSAGE_TYPES = {
    chain: 'CHAIN',
    transaction: 'TRANSACTION',
    clear_transactions: 'CLEAR_TRANSACTIONS'
};

class P2PServer {
    constructor(blockchain, transactionPool) {
        this.blockchain = blockchain;
        this.sockets = [];
        this.transactionPool = transactionPool;
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
            switch (data.type) {
                case MESSAGE_TYPES.chain:
                    this.blockchain.replaceChain(data.chain);
                    break;
                case MESSAGE_TYPES.transaction:
                    this.transactionPool.updateOrAddTransaction(data.transaction);
                    break;
                case MESSAGE_TYPES.clear_transactions:
                    this.transactionPool.clear();
                    break;
            }
        });
    }

    syncChains() {
        this.sockets.forEach(socket => {
            this.sendChain(socket);
        });
    }

    sendChain(socket) {
        const payload = {
            type: MESSAGE_TYPES.chain,
            chain: this.blockchain.chain
        };
        const message = JSON.stringify(payload);
        socket.send(message);
    }

    broadcastTransaction(transaction) {
        this.sockets.forEach(socket => {
            this.sendTransaction(socket, transaction)
        });
    }

    sendTransaction(socket, transaction) {
        const payload = {
            type: MESSAGE_TYPES.transaction,
            transaction: transaction,
        };
        const message = JSON.stringify(payload);
        socket.send(message);
    }


    broadcastClearTransactions() {
        this.sockets.forEach(socket => {
            this.sendClearTransaction(socket);
        });
    }

    sendClearTransaction(socket) {
        const payload = {
            type: MESSAGE_TYPES.clear_transactions
        };
        const message = JSON.stringify(payload);
        socket.send(message);
    }
}

module.exports = P2PServer;