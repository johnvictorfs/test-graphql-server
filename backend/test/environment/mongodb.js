const { MongoMemoryServer } = require('mongodb-memory-server');
const NodeEnvironment = require('jest-environment-node');

class MongoDbEnvironment extends NodeEnvironment {
  constructor(config) {
    super(config);

    this.mongod = new MongoMemoryServer();
  }

  async setup() {
    await super.setup();

    this.global.__MONGO_URI__ = await this.mongod.getConnectionString();
    this.global.__MONGO_DB_NAME__ = await this.mongod.getDbName();
    this.global.__COUNTERS__ = { user: 0 };
  }

  async teardown() {
    await super.teardown();
    await this.mongod.stop();
  }

  runScript(script) {
    return super.runScript(script);
  }
}

module.exports = MongoDbEnvironment;
