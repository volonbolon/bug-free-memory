const Transaction = require('../wallet/transaction');
const Wallet = require('../wallet');

class Miner {
    constructor(blockchain, transactionPool, wallet, p2pServer) {
        this.blockchain = blockchain;
        this.pool = transactionPool;
        this.wallet = wallet;
        this.p2pServer = p2pServer;
    }

    mine() {
        const validTransactions = this.pool.validTransactions();
        const rewardTransaction = Transaction.rewardTransaction(this.wallet, Wallet.blockchainWallet());
        validTransactions.push(rewardTransaction);

        const block = this.blockchain.addBlock(validTransactions);
        this.p2pServer.syncChains();

        this.pool.clear();

        this.p2pServer.broadcastClearTransactions();

        return block;
    }
}

module.exports = Miner;