const Transaction = require('./transaction');
const Wallet = require('./index');

describe('Transaction', () => {
    let transaction;
    let wallet;
    let recipient;
    let amount;

    beforeEach(() => {
        wallet = new Wallet();
        amount = 18;
        recipient = 'recipient-address';
        transaction = Transaction.newTransaction(wallet, recipient, amount);
    });

    it('outputs the `amount` substracted from the wallet balance', () => {
        const outputTransaction = transaction.outputs.find(output => output.address === wallet.publicKey);
        const outputAmount = outputTransaction.amount;
        expect(outputAmount).toEqual(wallet.balance - amount);
    });

    it('outputs the `amount` added to the recipient', () => {
        const recipientTransaction = transaction.outputs.find(output => output.address === recipient);
        const receivedAmount = recipientTransaction.amount;
        expect(receivedAmount).toEqual(amount);
    });

    it('inputs the balance of the wallet', () => {
        expect(transaction.input.amount).toEqual(wallet.balance);
    });

    it('validates a valid transaction', () => {
        expect(Transaction.verifyTransaction(transaction)).toBe(true);
    });

    it('invalidates a corrupt transaction', () => {
        const corruptTransaction = transaction
        corruptTransaction.outputs[0].amount = 400000;
        expect(Transaction.verifyTransaction(corruptTransaction)).toBe(false);
    });

    describe('Updating a transaction', () => {
        let nextAmount;
        let nextRecipient;

        beforeEach(() => {
            nextAmount = 20;
            nextRecipient = 'nextrecipient';

            transaction = transaction.update(wallet, nextRecipient, nextAmount);
        });

        it("substracts the next amount from the sender's output", () => {
            const senderOutput = transaction.outputs.find(output => output.address === wallet.publicKey);
            const senderOutputAmount = senderOutput.amount;
            expect(senderOutputAmount).toEqual(wallet.balance - amount - nextAmount);
        });

        it('Outputs an amount for the next recipient', () => {
            const nextRecipientOutput = transaction.outputs.find(output => output.address === nextRecipient);
            const nextRecipientOutputAmount = nextRecipientOutput.amount;
            expect(nextRecipientOutputAmount).toEqual(nextAmount);
        });
    });
});