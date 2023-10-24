const SHA256 = require('crypto-js/sha256');
const { Timer } = require('timer-node');

class Transaction{
  constructor(
    public fromAddress?: string,
    public toAddress?: string,
    public amount?: number
  ) {}
}

class Block{
  hash: string;
  nonce: number;
  constructor(private timestamp: number, public transactions: Array<Transaction>, public previousHash?: string) {
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
    this.nonce = 0;
  }

  calculateHash(): string {
    return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
  }

  mineBlock(difficulty): void {
    const timer = new Timer({
      label: 'test-timer',
      startTimestamp: new Date()
    });

    timer.start();

    while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    timer.pause();

    console.log('Block mined: ' + this.hash + ' in ' + timer.format('[%s] seconds [%ms] ms'));
  }
}

class BlockChain{
  chain: Block[];
  difficulty: number;
  pendingTransactions: any[];
  miningRewards: number;
  constructor() {
    this.chain = [this.createGenesisBlock()]
    this.difficulty = 3;
    this.pendingTransactions = [];
    this.miningRewards = 100;
  }

  createGenesisBlock(): Block {
    return new Block(Date.now(), [new Transaction()])
  }

  getLatestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  minePendingTransactions(miningRewardAddress): void {
    let block = new Block(Date.now(), this.pendingTransactions);
    block.mineBlock(this.difficulty);

    console.log('Block mined.');
    this.chain.push(block);

    this.pendingTransactions = [new Transaction(null, miningRewardAddress, this.miningRewards)];
  }

  createTransaction(transaction): void {
    this.pendingTransactions.push(transaction);
    console.log(this.pendingTransactions);
  }

  getBalanceOfAddress(address): number {
    let balance = 0;

    for (const block of this.chain) {
      for (const trans of block.transactions) {
        if (trans.fromAddress === address) {
          balance -= trans.amount;
        }

        if (trans.toAddress === address) {
          balance += trans.amount;
        }
      }
    }

    return balance;
  }

  isChainValid(): boolean {
    for (let i = 1; i < this.chain.length; i++){
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.previousHash !== previousBlock.hash || currentBlock.hash !== currentBlock.calculateHash()) return false;
      return true;
    }
  }

  getPendingTransactions(): Array<Transaction> {
    return this.pendingTransactions;
  }
}

let germaCoin = new BlockChain();

germaCoin.createTransaction(new Transaction('address1', 'address2', 600));
germaCoin.createTransaction(new Transaction('address2', 'address1', 50));

console.log('\n Starting the miner...');

germaCoin.minePendingTransactions('german-address');

// console.log(germaCoin.getPendingTransactions())

console.log('\n Starting the miner again...');

germaCoin.minePendingTransactions('german-address');

console.log('\n Starting the miner again...');

germaCoin.minePendingTransactions('german-address');
console.log('\n Balance is ', germaCoin.getBalanceOfAddress('german-address'));
