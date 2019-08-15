const Block = require('./block');

describe('Block', () => {
    let data;
    let lastBlock;
    let block;

    beforeEach(() => {
        data = 'bar';
        lastBlock = Block.genesis();
        block = Block.mineBlock(lastBlock, data);
    });

    it('sets the `data` to match the input', () => {
        expect(block.data).toEqual(data);
    });

    it('sets the `lastHash` to match the hash of the last block', () => {
        expect(block.lastHash).toEqual(lastBlock.hash);
    });

    it('generates a hash that matches the difficulty', () => {
        const expectedDifficulty = block.difficulty;
        expect(block.hash.substring(0, expectedDifficulty)).toEqual('0'.repeat(expectedDifficulty));
    });

    it('lowers difficulty for slowly mined blocks', () => {
        const adjustedDifficulty = Block.adjustDifficulty(block, block.timestamp + 360000);
        expect(adjustedDifficulty).toEqual(block.difficulty - 1);
    });

    it('raises the difficulty for quickly mined blocks', () => {
        const adjustedDifficulty = Block.adjustDifficulty(block, block.timestamp + 1);
        expect(adjustedDifficulty).toEqual(block.difficulty + 1);
    });
});