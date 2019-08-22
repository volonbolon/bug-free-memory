const {INITIAL_BALANCE} = require('../config');
const ChainUtil = require('../chain-util');
const Transaction = require('./transaction');

class Wallet {
    constructor() {
        this.balance = INITIAL_BALANCE;
        this.keyPair = ChainUtil.genKeyPair();
        this.publicKey = this.keyPair.getPublic().encode('hex');
    }

    toString() {
        return `Wallet -
           publicKey: ${this.publicKey.toString()}
           balance  : ${this.balance}
        `;
    }

    sign(dataHash) {
        return this.keyPair.sign(dataHash);
    }

    createTransaction(recipient, amount, blockchain, transactionPool) {
        this.balance = this.calculateBalance(blockchain);
        if (amount > this.balance) {
            console.error(`Amount: ${amount} exceeds current balance: ${this.balance}`);
            return;
        }

        let transaction = transactionPool.existingTransaction(this.publicKey);
        if (transaction ) {
            transaction.update(this, recipient, amount);
        } else {
            transaction = Transaction.newTransaction(this, recipient, amount);
            transactionPool.updateOrAddTransaction(transaction);
        }

        return transaction;
    }

    calculateBalance(blockchain) {
        let balance = this.balance;
        let transactions = [];
        blockchain.chain.forEach(block => {
            block.data.forEach(transaction => {
                transactions.push(transaction);
            });
        });

        const walletInputTransactions = transactions.filter(t => {
            return t.input.address === this.publicKey;
        });

        let startTime = 0;
        if (walletInputTransactions.length > 0 ) {
            const recentInputTransaction = walletInputTransactions.reduce((prev, current) => {
                const prevTimestamp = prev.input.timestamp;
                const currentTimestamp = current.input.timestamp;
                return prevTimestamp > currentTimestamp ? prev : current;
            });

            const recentOutput = recentInputTransaction.outputs.find(o => {
                return o.address === this.publicKey;
            });

            balance = recentOutput.amount;
            startTime = recentInputTransaction.input.timestamp;
        }

        transactions.forEach(t => {
            if (t.input.timestamp > startTime) {
                t.outputs.find(o => {
                    if (o.address === this.publicKey) {
                        balance += o.amount;
                    }
                });
            }
        });

        return balance;
    }

    static blockchainWallet() {
        const blockchainWallet = new this();
        blockchainWallet.address = 'blockchain-wallet';

        return blockchainWallet;
    }
}

module.exports = Wallet;