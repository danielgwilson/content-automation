import fs from "fs";
import path from "path";
import { ICredentials } from "../types";

export function getCredentials(targetDir: string) {
  const credentialsPath = path.join(targetDir, "credentials.json");
  if (!fs.existsSync(credentialsPath))
    throw new Error(`Failed to load credentials for targetDir: ${targetDir}`);
  const credentialsJson = fs.readFileSync(credentialsPath);
  const credentials = JSON.parse(credentialsJson.toString()) as ICredentials;

  return credentials;
}
