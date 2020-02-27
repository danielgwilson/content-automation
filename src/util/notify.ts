import notifier from "node-notifier";

export function notify(
  message: string,
  { shouldLog = true }: { shouldLog?: boolean } = {}
) {
  if (shouldLog) console.log(message);
  notifier.notify({
    title: "Reddit YouTube Video Bot (RYVB)",
    message
  });
}
