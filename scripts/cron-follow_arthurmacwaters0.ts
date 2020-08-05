import { CronJob } from "cron";
import { FollowCommand } from "../src/commands";

const userId = "0002";
const outputDir = `./temp/user-${userId}`;
const tag = "gym";
const argv = ["--outputDir", outputDir, "--tags", tag];

const schedule = "08,38 07-22 * * *";
console.log(`Scheduled cron job with ${schedule} on ${new Date()}`);
const job = new CronJob(
  schedule,
  async () => {
    console.log(`Running scheduled cron job at ${new Date()}`);
    await FollowCommand.run(argv);
  },
  () => {
    console.log("Job complete!");
    console.log(`Next run will occur at ${job.nextDate().toISOString()}`);
  }
);
job.start();
