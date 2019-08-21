const express = require('express');
const bodyParser = require('body-parser');
const Blockchain = require('../blockchain');
const P2PServer = require('./p2p-server');
const Wallet = require('../wallet');
const TransactionPool = require('../wallet/transaction-pool');

const HTTP_PORT = process.env.HTTP_PORT || 3001;

const app = express();
const blockchain = new Blockchain();
const wallet = new Wallet();
const pool = new TransactionPool();
const p2pServer = new P2PServer(blockchain, pool);

app.use(bodyParser.json());

app.get('/blocks', (req, res) => {
    res.json(blockchain.chain);
});

app.post('/mine', (req, res) => {
    const block = blockchain.addBlock(req.body.data);
    p2pServer.syncChains();
    res.json(blockchain.chain);
});

app.get('/transactions', (req, res) => {
    res.json(pool.transactions);
});

app.post('/transact', (req, res) => {
    const {recipient, amount} = req.body;
    const transaction = wallet.createTransaction(recipient, amount, pool);

    p2pServer.broadcastTransaction(transaction);

    res.json(pool.transactions);
});

app.get('/public-key', (req, res) => {
    const payload = {
        publicKey: wallet.publicKey
    };
    res.json(payload);
});

app.listen(HTTP_PORT, () => {
    console.log(`Listening on port ${HTTP_PORT}`);
});

p2pServer.listen();