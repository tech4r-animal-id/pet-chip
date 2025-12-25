import { Worker } from 'bullmq';

console.log("🐘 Queue Worker is starting...");

// This will process background tasks like SMS and Reports
const worker = new Worker('animal-tasks', async (job) => {
    console.log(`Processing job ${job.id}:`, job.name);
    // Business logic for background tasks goes here
}, {
    connection: {
        host: 'localhost',
        port: 6379
    }
});

worker.on('completed', (job) => {
    console.log(`${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
    console.error(`${job?.id} has failed with ${err.message}`);
});