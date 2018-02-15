require('dotenv').config();
const Logging = require('@google-cloud/logging');
const path = require('path');

const logging = new Logging({
  projectId: process.env.PROJECT_ID,
  keyFilename: path.resolve(__dirname, '../..', 'stackdriver_service.json'),
});

class Logger {
  constructor({ logName, metadata, workerId }) {
    this.logName = logName || 'default';
    this.metadata = metadata || { resource: { type: 'global' } };
    this.workerId = workerId;
    this.log = logging.log(logName);
  }

  /**
   * @function
   * @param {string} - message
   * @param {any} - options
   * @return {promise}
   * @description - Write a message to Stackdriver
   */
  async write(message, options = { label: null }) {
    let { metadata } = this;
    if (options.label) {
      metadata = Object.assign(metadata, { labels: { label: options.label } });
    }
    const data = { worker: this.workerId, message };
    const entry = this.log.entry(metadata, data);
    await this.log.write(entry);
  }

  /**
   * @function
   * @return {promise}
   * @description - Delete the log
   */
  async delete() {
    await this.log.delete();
  }

  /**
   * @function
   * @param {any} - options
   * @return {promise}
   * @description - Get all log entries. Optionally pass in ordering filter
   */
  async getEntries(options = { orderBy: 'timestamp desc' }) {
    const entries = await this.log.getEntries(options);
    return entries;
  }
}

module.exports = Logger;
