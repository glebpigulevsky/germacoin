var SHA256 = require("crypto-js/sha256");
var Timer = require("timer-node").Timer;
var Transaction = /** @class */ (function () {
  function Transaction(fromAddress, toAddress, amount) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
  }
  return Transaction;
})();
var Block = /** @class */ (function () {
  function Block(timestamp, transactions, previousHash) {
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
    this.nonce = 0;
  }
  Block.prototype.calculateHash = function () {
    return SHA256(
      this.previousHash +
        this.timestamp +
        JSON.stringify(this.transactions) +
        this.nonce
    ).toString();
  };
  Block.prototype.mineBlock = function (difficulty) {
    var timer = new Timer({
      label: "test-timer",
      startTimestamp: new Date(),
    });
    timer.start();
    while (
      this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")
    ) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    timer.pause();
    console.log(
      "Block mined: " +
        this.hash +
        " in " +
        timer.format("[%s] seconds [%ms] ms")
    );
  };
  return Block;
})();
var BlockChain = /** @class */ (function () {
  function BlockChain() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 3;
    this.pendingTransactions = [];
    this.miningRewards = 100;
  }
  BlockChain.prototype.createGenesisBlock = function () {
    return new Block(Date.now(), [new Transaction()]);
  };
  BlockChain.prototype.getLatestBlock = function () {
    return this.chain[this.chain.length - 1];
  };
  BlockChain.prototype.minePendingTransactions = function (
    miningRewardAddress
  ) {
    var block = new Block(Date.now(), this.pendingTransactions);
    block.mineBlock(this.difficulty);
    console.log("Block mined.");
    this.chain.push(block);
    this.pendingTransactions = [
      new Transaction(null, miningRewardAddress, this.miningRewards),
    ];
  };
  BlockChain.prototype.createTransaction = function (transaction) {
    this.pendingTransactions.push(transaction);
    console.log(this.pendingTransactions);
  };
  BlockChain.prototype.getBalanceOfAddress = function (address) {
    var balance = 0;
    for (var _i = 0, _a = this.chain; _i < _a.length; _i++) {
      var block = _a[_i];
      for (var _b = 0, _c = block.transactions; _b < _c.length; _b++) {
        var trans = _c[_b];
        if (trans.fromAddress === address) {
          balance -= trans.amount;
        }
        if (trans.toAddress === address) {
          balance += trans.amount;
        }
      }
    }
    return balance;
  };
  BlockChain.prototype.isChainValid = function () {
    for (var i = 1; i < this.chain.length; i++) {
      var currentBlock = this.chain[i];
      var previousBlock = this.chain[i - 1];
      if (
        currentBlock.previousHash !== previousBlock.hash ||
        currentBlock.hash !== currentBlock.calculateHash()
      )
        return false;
      return true;
    }
  };
  BlockChain.prototype.getPendingTransactions = function () {
    return this.pendingTransactions;
  };
  return BlockChain;
})();
var germaCoin = new BlockChain();
germaCoin.createTransaction(new Transaction("address1", "address2", 600));
germaCoin.createTransaction(new Transaction("address2", "address1", 50));
console.log(typeof germaCoin, typeof Block);
console.log("\n Starting the miner...");
germaCoin.minePendingTransactions("german-address");
// console.log(germaCoin.getPendingTransactions())
console.log("\n Starting the miner again...");
germaCoin.minePendingTransactions("german-address");
console.log("\n Starting the miner again...");
germaCoin.minePendingTransactions("german-address");
console.log("\n Balance is ", germaCoin.getBalanceOfAddress("german-address"));
