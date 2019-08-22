const Wallet = require('./index');
const TransactionPool = require('./transaction-pool');
const Blockchain = require('../blockchain');
const {INITIAL_BALANCE} = require('../config');

describe('Wallet', () => {
    let wallet;
    let pool;
    let blockchain;

    beforeEach(() => {
        wallet = new Wallet();
        pool = new TransactionPool();
        blockchain = new Blockchain();
    });

    describe('creating a transaction', () => {
        let transaction;
        let sendAmount;
        let recipient;

        beforeEach(() => {
            sendAmount = 10;
            recipient = 'recipient-address';

            transaction = wallet.createTransaction(recipient, sendAmount, blockchain, pool);
        });

        describe('and doing the same transaction', () => {
            beforeEach(() => {
                wallet.createTransaction(recipient, sendAmount, blockchain, pool);
            });

            it('doubles the `sendAmount` from the wallet balance', () => {
                const output = transaction.outputs.find(o => o.address === wallet.publicKey);
                const outputAmount = output.amount;
                expect(outputAmount).toEqual(wallet.balance - (sendAmount * 2));
            });

            it('clones the `sendAmount` output for the recipient', () => {
                const filteredOutputs = transaction.outputs.filter(o => o.address === recipient);
                const amounts = filteredOutputs.map(o => o.amount);
                expect(amounts).toEqual([sendAmount, sendAmount]);
            });
        });
    });

    describe('calculate balance', () => {
        let addBalance;
        let repeatAdd;
        let senderWallet;

        beforeEach(() => {
            senderWallet = new Wallet();
            addBalance = 100;
            repeatAdd = 3;

            for (let i = 0; i < repeatAdd; i++) {
                senderWallet.createTransaction(wallet.publicKey, addBalance, blockchain, pool);
            }

            blockchain.addBlock(pool.transactions);
        });

        it('calculates the balance for blockchain transactions matching the recipient', () => {
            expect(wallet.calculateBalance(blockchain)).toEqual(INITIAL_BALANCE + (addBalance * repeatAdd));
        });

        it('calculates the balance for blockchain transactions that match sender', () => {
            expect(senderWallet.calculateBalance(blockchain)).toEqual(INITIAL_BALANCE - (addBalance * repeatAdd));
        });

        describe('and the recipient conducts a transaction', () => {
            let substractBalance;
            let recipientBalance;

            beforeEach(() => {
                pool.clear();

                substractBalance = 60;
                recipientBalance = wallet.calculateBalance(blockchain);

                wallet.createTransaction(senderWallet.publicKey, substractBalance, blockchain, pool);

                blockchain.addBlock(pool.transactions);
            });

            describe('and the sender sends another transaction to the recipient', () => {
                beforeEach(() => {
                    pool.clear();
                    senderWallet.createTransaction(wallet.publicKey, addBalance, blockchain, pool);
                    blockchain.addBlock(pool.transactions);
                });

                it('calculate the recipient balance only using transactions since its most recent one', () => {
                    expect(wallet.calculateBalance(blockchain)).toEqual(recipientBalance - substractBalance + addBalance);
                });
            });
        });
    });
});