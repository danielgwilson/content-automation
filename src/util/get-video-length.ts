import { promises as fs } from "fs";
const buff = Buffer.alloc(100);
const header = Buffer.from("mvhd");

export async function getVideoLength(path: string) {
  const file = await fs.open(path, "r");
  const { buffer } = await file.read(buff, 0, 100, 0);

  await file.close();

  const start = buffer.indexOf(header) + 17;
  const timeScale = buffer.readUInt32BE(start);
  const duration = buffer.readUInt32BE(start + 4);

  const audioLength = Math.floor((duration / timeScale) * 1000) / 1000;

  console.log(buffer, header, start, timeScale, duration, audioLength);
  return audioLength;
}
