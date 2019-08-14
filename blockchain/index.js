const Block = require('./block');

class Index {
    constructor() {
        this.chain = [Block.genesis()];
    }

    addBlock(data) {
        const lastBlock = this.chain[this.chain.length - 1];
        const block = Block.mineBlock(lastBlock, data);
        this.chain.push(block);

        return block;
    }

    isValidChain(chain) {
        if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
            return false;
        }

        for(let i = 1; i < chain.length; i++) {
            const block = chain[i];
            const lastBlock = chain[i - 1];

            const invalidLastHash = block.lastHash !== lastBlock.hash;
            const invalidBlockHash = block.hash !== Block.blockHash(block);
            if (invalidLastHash || invalidBlockHash) {
                return false;
            }
        }

        return true;
    }

    replaceChain(newChain) {
        if (newChain.length <= this.chain.length) {
            console.log('Not longer than the current chain');
            return;
        }

        if (!this.isValidChain(newChain)) {
            console.log('New chain is not valid');
            return;
        }

        this.chain = newChain;
    }
}

module.exports = Index;