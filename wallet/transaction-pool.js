class TransactionPool {
    constructor() {
        this.transactions = [];
    }

    updateOrAddTransaction(transaction) {
        let transactionWithId = this.transactions.find(transaction => transaction.id === transaction.id);
        if (transactionWithId) {
            const referenceIndex = this.transactions.indexOf(transactionWithId);
            this.transactions[referenceIndex] = transaction;
        } else {
            this.transactions.push(transaction);
        }
    }
}

module.exports = TransactionPool;