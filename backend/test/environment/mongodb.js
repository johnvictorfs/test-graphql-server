const { MongoMemoryServer } = require('mongodb-memory-server');
const NodeEnvironment = require('jest-environment-node');

class MongoDbEnvironment extends NodeEnvironment {
  constructor(config) {
    super(config);

    this.mongod = new MongoMemoryServer();
  }

  async setup() {
    await super.setup();

    this.global.TEST_MONGO_URI = await this.mongod.getConnectionString();
    this.global.MONGO_DB_NAME = await this.mongod.getDbName();
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
