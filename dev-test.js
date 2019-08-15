const Blockchain = require('./blockchain');

const blockchain = new Blockchain();

for (let i = 0; i < 10; i++) {
    const block = blockchain.addBlock([`foo ${i}`]);
    console.log(block.toString());
}