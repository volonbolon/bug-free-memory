const ChainUtil = require('../chain-util');

class Transaction {
    constructor() {
        this.id = ChainUtil.id();
        this.input = null;
        this.outputs = [];
    }

    update(senderWallet, recipient, amount) {
        const senderOutput = this.outputs.find(output => output.address === senderWallet.publicKey);

        if (amount > senderOutput.amount) {
            console.error(`Amount: ${amount} exceeds balance.`);
            return;
        }

        senderOutput.amount = senderOutput.amount - amount;
        this.outputs.push({amount, address: recipient});

        Transaction.signTransaction(this, senderWallet);

        return this;
    }

    static newTransaction(senderWallet, recipient, amount) {
        const transaction = new this();
        if (amount > senderWallet.balance) {
            console.warn(`Amount (${amount}) exceeds balance (${balance})`);
            return;
        }

        const recipientTransaction = {
            amount,
            address: recipient
        };
        const senderTransaction = {
            amount: senderWallet.balance - amount,
            address: senderWallet.publicKey
        };
        transaction.outputs.push(recipientTransaction);
        transaction.outputs.push(senderTransaction);

        Transaction.signTransaction(transaction, senderWallet);

        return transaction;
    }

    static signTransaction(transaction, senderWallet) {
        const outputsHash = ChainUtil.hash(transaction.outputs);
        transaction.input = {
            timestamp: Date.now(),
            amount: senderWallet.balance,
            address: senderWallet.publicKey,
            signature: senderWallet.sign(outputsHash)
        }
    }

    static verifyTransaction(transaction) {
        return ChainUtil.verifySignature(
            transaction.input.address,
            transaction.input.signature,
            ChainUtil.hash(transaction.outputs)
        );
    }
}

module.exports = Transaction;