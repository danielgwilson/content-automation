import cron from "node-cron";
import { UploadCommand } from "../src/commands/upload";

const schedule = "45 * * * *";
console.log(`Scheduled cron job with ${schedule}`);
cron.schedule(schedule, async () => {
  console.log(`Running scheduled cron job at ${new Date()}`);
  await UploadCommand.run(["temp/content"]);
});
