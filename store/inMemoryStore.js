// optional
class InMemoryStore {
  constructor() {
    this.frauds = [];
  }

  async save(fraud) {
    this.frauds.push(fraud);
  }

  async getAll() {
    // return newest first
    return [...this.frauds].sort((a, b) => new Date(b.detectedAt) - new Date(a.detectedAt));
  }

  async getByUser(userId) {
    return this.frauds.filter(f => f.userId === userId).sort((a, b) => new Date(b.detectedAt) - new Date(a.detectedAt));
  }
}

module.exports = new InMemoryStore();
