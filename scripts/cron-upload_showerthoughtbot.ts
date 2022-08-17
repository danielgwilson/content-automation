import { CronJob } from "cron";
import { UploadCommand } from "../src/commands/upload";

const userId = "0003";
const outputDir = `./temp/user-${userId}`;
const argv = ["--outputDir", outputDir];

const schedule = "41 14-19 * * *";
console.log(`Scheduled cron job with ${schedule} on ${new Date()}`);
const job = new CronJob(
  schedule,
  async () => {
    console.log(`Running scheduled cron job at ${new Date()}`);
    await UploadCommand.run(argv);
  },
  () => {
    console.log("Job complete!");
    console.log(`Next run will occur at ${job.nextDate().toISOString()}`);
  }
);
job.start();
