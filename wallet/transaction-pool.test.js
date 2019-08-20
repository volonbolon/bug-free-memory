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
        transaction = Transaction.newTransaction(wallet, 'recipient_address', 20);

        pool.updateOrAddTransaction(transaction);
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
});