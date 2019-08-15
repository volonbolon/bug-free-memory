const SHA256 = require('crypto-js/sha256');
const {DIFFICULTY, MINE_RATE} = require('../config');

class Block {
    constructor(timestamp, lastHash, hash, data, nonce, difficulty) {
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.data = data;
        this.nonce = nonce;
        this.difficulty = difficulty || DIFFICULTY;
    }

    toString() {
        return `Block -
            Timestamp : ${this.timestamp}
            Last Hash : ${this.lastHash.substring(0, 10)}
            Hash      : ${this.hash.substring(0, 10)}
            Nonce     : ${this.nonce}
            Difficulty: ${this.difficulty}
            Data      : ${this.data}
        `;
    }

    static genesis() {
        const genesis = new this('Genesis time', '-----', 'genesis-hash', [], 0, DIFFICULTY);
        return genesis;
    }

    static mineBlock(lastBlock, data) {
        const lastHash = lastBlock.hash;

        let difficulty = lastBlock.difficulty;

        let nonce = 0;
        let hash;
        let timestamp;
        do {
            nonce++;
            timestamp = Date.now();
            difficulty = Block.adjustDifficulty(lastBlock, timestamp);
            hash = Block.hash(timestamp, lastHash, data, nonce, difficulty);
        } while (hash.substring(0, difficulty) !== '0'.repeat(difficulty))

        return new this(timestamp, lastHash, hash, data, nonce, difficulty);
    }

    static adjustDifficulty(lastBlock, currentTime) {
        let difficulty = lastBlock.difficulty;
        difficulty = lastBlock.timestamp + MINE_RATE > currentTime ? difficulty + 1 : difficulty - 1;
        return difficulty;
    }

    static hash(timestamp, lastHash, data, nonce, difficulty) {
        const fp = `${timestamp}${lastHash}${data}${nonce}${difficulty}`;
        const hash = SHA256(fp);
        const asString = hash.toString();
        return asString;
    }

    static blockHash(block) { // Convenience method
        const {timestamp, lastHash, data, nonce, difficulty} = block;
        return Block.hash(timestamp, lastHash, data, nonce, difficulty);
    }
}

module.exports = Block;