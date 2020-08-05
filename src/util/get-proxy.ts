import fs from "fs";
import path from "path";
import { IProxy } from "../types";

export function getProxy(targetDir: string) {
  const proxyPath = path.join(targetDir, "proxy.json");
  if (!fs.existsSync(proxyPath)) return undefined;
  const proxyJson = fs.readFileSync(proxyPath);
  const proxy = JSON.parse(proxyJson.toString()) as IProxy;

  return proxy;
}
