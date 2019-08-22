const TransactionPool = require('./transaction-pool');
const Transaction = require('./transaction');
const Wallet = require('./index');

describe('Transaction Pool', () => {
    let pool;
    let wallet;
    let transaction;

    beforeEach(() => {
        pool = new TransactionPool();
        wallet = new Wallet();
        transaction = wallet.createTransaction('recipient-address', 30, pool);
    });

    it('adds a transaction to the pool', () => {
        const pooledTransaction = pool.transactions.find(t => t.id === transaction.id);
        expect(pooledTransaction).toEqual(transaction);
    });

    it('updates a transaction in the pool', () => {
        const dehydratedTransaction = JSON.stringify(transaction);
        const newTransaction = transaction.update(wallet, 'another-address', 18);
        pool.updateOrAddTransaction(newTransaction);

        const pooledTransaction = pool.transactions.find(t => t.id === newTransaction.id);

        expect(JSON.stringify(pooledTransaction)).not.toEqual(dehydratedTransaction);
    });

    it('clears transactions', () => {
        pool.clear();

        expect(pool.transactions.length).toEqual(0);
    });

    describe('mixing valid and corrupt transactions', () => {
        let validTransactions;

        beforeEach(() => {
            validTransactions = [...pool.transactions];

            for (let i=0; i<6; i++) {
                wallet = new Wallet();
                transaction = wallet.createTransaction('random-address', 30, pool);
                if (i % 2 == 0) {
                    transaction.input.amount = 999999;
                } else {
                    validTransactions.push(transaction);
                }
            }
        });

        it('shows a difference between valid and corrupt transactions', () => {
            const allTransactions = JSON.stringify(pool.transactions);
            const valid = JSON.stringify(validTransactions);

            expect(allTransactions).not.toEqual(validTransactions);
        });

        it('grabs valid transactions', () => {
            const validFromPool = JSON.stringify(pool.validTransactions());
            const valid = JSON.stringify(validTransactions);
            expect(validFromPool).toEqual(valid);
        });
    });
});