const Wallet = require('./index');
const TransactionPool = require('./transaction-pool');
const Transaction = require('./transaction');

describe('Wallet', () => {
    let wallet;
    let pool;

    beforeEach(() => {
        wallet = new Wallet();
        pool = new TransactionPool();
    });

    describe('creating a transaction', () => {
        let transaction;
        let sendAmount;
        let recipient;

        beforeEach(() => {
            sendAmount = 10;
            recipient = 'recipient-address';
            transaction = wallet.createTransaction(recipient, sendAmount, pool);
        });

        describe('and doing the same transaction', () => {
            beforeEach(() => {
                wallet.createTransaction(recipient, sendAmount, pool);
            });

            it('doubles the `sendAmount` from the wallet balance', () => {
                const output = transaction.outputs.find(o => o.address === wallet.publicKey);
                const outputAmount = output.amount;
                expect(outputAmount).toEqual(wallet.balance - (sendAmount * 2));
            });

            it('clones the `sendAmount` output for the recipient', () => {
                const filteredOutputs = transaction.outputs.filter(o => o.address === recipient)
                const amounts = filteredOutputs.map(o => o.amount);
                expect(amounts).toEqual([sendAmount, sendAmount]);
            });
        });
    });
});