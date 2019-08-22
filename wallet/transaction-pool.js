const Transaction = require('./transaction');

class TransactionPool {
    constructor() {
        this.transactions = [];
    }

    updateOrAddTransaction(transaction) {
        let transactionWithId = this.transactions.find(t => t.id === transaction.id);
        if (transactionWithId) {
            const referenceIndex = this.transactions.indexOf(transactionWithId);
            this.transactions[referenceIndex] = transaction;
        } else {
            this.transactions.push(transaction);
        }
    }

    existingTransaction(address) {
        return this.transactions.find(t => t.input.address === address);
    }

    validTransactions() {
        return this.transactions.filter(t => {
            const outputTotal = t.outputs.reduce((total, o) => {
                return total + o.amount;
            }, 0);

            const inputAmount = t.input.amount;

            if (inputAmount !== outputTotal) {
                console.error(`Invalid transaction. Input ${inputAmount} dos not match total outputs ${outputTotal}`);
                return;
            }

            if (!Transaction.verifyTransaction(t)) {
                console.log(`Invalid transaction. Unable to validate signature`);
                return
            }

            return t;
        });
    }
}

module.exports = TransactionPool;