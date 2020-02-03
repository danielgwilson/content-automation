import fs from "fs";
import util from "util";
import path from "path";
import { Post } from "../../types/post";

export async function generateAudio(
  post: Post,
  client: any,
  voice: {
    languageCode: string;
    name: string;
    ssmlGender: string;
  },
  audioConfig: {
    audioEncoding: string;
    speakingRate: number;
  }
) {
  const texts = [post.title, ...post.comments.map(comment => comment.body)];
  const audioLengths: number[] = [];

  const promises: Promise<undefined>[] = [];
  for (let [i, text] of texts.entries()) {
    const request = {
      input: { text },
      voice: voice,
      audioConfig: audioConfig
    };
    promises.push(
      new Promise(async resolve => {
        // Performs the text-to-speech request
        const [response] = await client.synthesizeSpeech(request);
        // Write the binary audio content to a local file
        const writeFile = util.promisify(fs.writeFile);
        const targetDir = path.join(__dirname, "/../../", "./temp/");
        const fileName = path.join(targetDir, `${post.id}-${i}.mp3`);
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir);
        }
        await writeFile(fileName, response.audioContent, "binary");
        console.log(`Audio content written to file: ${fileName}`);

        /* 
      From
      - https://stackoverflow.com/questions/13378815/base64-length-calculation and
      - https://cloud.google.com/text-to-speech/docs/base64-decoding and
      - https://cloud.google.com/text-to-speech/docs/reference/rest/v1/text/synthesize
      
      Since audio response is (1) base-64-encoded and (2) 32kbps, we know that
      audio length = stringLength * bitsPerCharacter (bpc) / bitRate (bps) => audio length = stringLength * 6 / 32000
      */
        const audioLength = (response.audioContent.length * 8) / 32000; // Why is 8 bits per character accurate? Shouldn't this be 6 bpc??
        audioLengths.push(audioLength);

        return resolve();
      })
    );
  }
  await Promise.all(promises);

  const totalCharacters = texts.join("").length;
  const totalAudioLength = audioLengths.reduce((a, b) => a + b, 0);

  console.log(`\nTotal characters converted to audio: ${totalCharacters}`);
  console.log(
    `Aggregate length of audio files: ${new Date(totalAudioLength * 1000)
      .toISOString()
      .substr(11, 8)}\n`
  );
}
