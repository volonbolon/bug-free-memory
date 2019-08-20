const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const uuid = require('uuid/v1');
const SHA256 = require('crypto-js/sha256');

class ChainUtil {
    static genKeyPair() {
        return ec.genKeyPair();
    }

    static id() {
        return uuid();
    }

    static hash(data) {
        const dataAsString = JSON.stringify(data);
        const hash = SHA256(dataAsString);
        const asString = hash.toString();
        return asString;
    }

    static verifySignature(publicKey, signature, dataHash) {
        const key = ec.keyFromPublic(publicKey, 'hex');
        return key.verify(dataHash, signature);
    }
}

module.exports = ChainUtil;