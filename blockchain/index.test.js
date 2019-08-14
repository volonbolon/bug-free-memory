const Blockchain = require('./index');
const Block = require('./block');

describe('Blockchain', () => {
    let blockchain;
    let anotherBlockchain;

    beforeEach(() => {
        blockchain = new Blockchain();
        anotherBlockchain = new Blockchain();
    });

    it('starts with genesis block', () => {
        expect(blockchain.chain[0]).toEqual(Block.genesis());
    });

    it('adds a new block', () => {
        const data = ['Foo'];
        blockchain.addBlock(data);

        expect(blockchain.chain[blockchain.chain.length - 1].data).toEqual(data);
    });

    it('validates a valid chain', () => {
        anotherBlockchain.addBlock(['foo']);

        expect(blockchain.isValidChain(anotherBlockchain.chain)).toBe(true);
    });

    it('invalidates corrupt genesis block', () => {
        anotherBlockchain.chain[0].data = "Corrupt";

        expect(blockchain.isValidChain(anotherBlockchain.chain)).toBe(false);
    });

    it('invalidates a corrupt chain', () => {
        anotherBlockchain.addBlock(['foo']);
        anotherBlockchain.chain[anotherBlockchain.chain.length - 1].data = ['bar'];

        expect(blockchain.isValidChain(anotherBlockchain.chain)).toBe(false);
    });

    it('replaces the chain for a longer and valid chain', () => {
        anotherBlockchain.addBlock(['foo']);
        blockchain.replaceChain(anotherBlockchain.chain);

        expect(blockchain.chain).toEqual(anotherBlockchain.chain);
    });

    it('does not replace the chain with a shorter chain', () => {
        blockchain.addBlock(['foo']);
        blockchain.replaceChain(anotherBlockchain);

        expect(blockchain.chain).not.toEqual(anotherBlockchain.chain);
    });
});