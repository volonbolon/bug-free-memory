class Miner {
    constructor(blockchain, transactionPool, wallet, p2pServer) {
        this.blockchain = blockchain;
        this.pool = transactionPool;
        this.wallet = wallet;
        this.p2pServer = p2pServer;
    }

    mine() {
        const validTransaction = this.pool.validTransactions();
        // Include a reward for the miner
        // create a block consisting of the valid transactions
        // Sync chains
        // Drain and sync pool
    }
}

module.exports = Miner;