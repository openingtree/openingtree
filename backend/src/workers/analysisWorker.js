#!/usr/bin/env node
require('dotenv').config();

const { scoutQueue } = require('./scoutQueue');
const db = require('../db/connection');
const logger = require('../utils/logger');
const { generateScoutReport } = require('../services/scoutReportGenerator');

// Number of concurrent jobs
const CONCURRENCY = process.env.WORKER_CONCURRENCY || 2;

logger.info(`Starting analysis worker with concurrency: ${CONCURRENCY}`);

// Process scout report jobs
scoutQueue.process(CONCURRENCY, async (job) => {
  const { reportId, userId, username, platform, color, timeControl, maxGames, includeEngineAnalysis, pgn } = job.data;

  logger.info('Processing scout report job', {
    jobId: job.id,
    reportId,
    username,
    platform,
  });

  const startTime = Date.now();

  try {
    // Update status to processing
    await db.query(
      'UPDATE scout_reports SET status = $1 WHERE id = $2',
      ['processing', reportId]
    );

    // Progress tracking
    job.progress(10);

    // Generate the scout report
    const reportData = await generateScoutReport({
      reportId,
      username,
      platform,
      color,
      timeControl,
      maxGames,
      includeEngineAnalysis,
      pgn,
      onProgress: (progress) => {
        job.progress(progress);
      },
    });

    job.progress(90);

    const processingTime = Date.now() - startTime;

    // Save completed report
    await db.query(
      `UPDATE scout_reports
       SET status = $1,
           completed_at = NOW(),
           processing_time_ms = $2,
           report_data = $3,
           games_analyzed = $4,
           engine_nodes_analyzed = $5
       WHERE id = $6`,
      [
        'completed',
        processingTime,
        JSON.stringify(reportData),
        reportData.player_profile.total_games_analyzed,
        reportData.metadata.engine_nodes_analyzed,
        reportId,
      ]
    );

    job.progress(100);

    logger.info('Scout report generated successfully', {
      reportId,
      processingTime,
      gamesAnalyzed: reportData.player_profile.total_games_analyzed,
    });

    return {
      reportId,
      processingTime,
      success: true,
    };
  } catch (error) {
    logger.error('Error generating scout report', {
      reportId,
      error: error.message,
      stack: error.stack,
    });

    // Update report with error
    await db.query(
      `UPDATE scout_reports
       SET status = $1,
           error_message = $2,
           error_stack = $3
       WHERE id = $4`,
      ['failed', error.message, error.stack, reportId]
    );

    throw error; // Re-throw to mark job as failed
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('Worker shutting down gracefully');
  await scoutQueue.close();
  await db.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('Worker shutting down (SIGINT)');
  await scoutQueue.close();
  await db.close();
  process.exit(0);
});

logger.info('Analysis worker ready and waiting for jobs');
