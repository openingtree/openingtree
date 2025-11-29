const Queue = require('bull');
const config = require('../config');
const logger = require('../utils/logger');

// Create Bull queue for scout report processing
const scoutQueue = new Queue('scout-reports', {
  redis: {
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
    db: config.redis.db,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: 500, // Keep last 500 failed jobs
  },
});

// Queue event listeners
scoutQueue.on('completed', (job, result) => {
  logger.info('Job completed', {
    jobId: job.id,
    reportId: job.data.reportId,
    duration: result.processingTime,
  });
});

scoutQueue.on('failed', (job, err) => {
  logger.error('Job failed', {
    jobId: job.id,
    reportId: job.data.reportId,
    error: err.message,
    attempts: job.attemptsMade,
  });
});

scoutQueue.on('stalled', (job) => {
  logger.warn('Job stalled', {
    jobId: job.id,
    reportId: job.data.reportId,
  });
});

scoutQueue.on('active', (job) => {
  logger.info('Job started', {
    jobId: job.id,
    reportId: job.data.reportId,
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await scoutQueue.close();
  logger.info('Scout queue closed');
});

module.exports = {
  scoutQueue,
};
