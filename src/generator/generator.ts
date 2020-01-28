import fs from "fs";
import util from "util";
import textToSpeech from "@google-cloud/text-to-speech";
import { Post } from "../types/post";

export default class {
  client: any;
  voice: {
    languageCode: string;
    name: string;
    ssmlGender: string;
  };
  audioConfig: {
    audioEncoding: string;
    speakingRate: number;
  };
  constructor(GOOGLE_APPLICATION_CREDENTIALS: string) {
    process.env[
      "GOOGLE_APPLICATION_CREDENTIALS"
    ] = GOOGLE_APPLICATION_CREDENTIALS;

    // Creates a client
    this.client = new textToSpeech.TextToSpeechClient();
    this.voice = {
      languageCode: "en-US",
      name: "en-US-Wavenet-B",
      ssmlGender: "MALE"
    };
    this.audioConfig = {
      audioEncoding: "MP3",
      speakingRate: 1.0
    };
  }

  async generate(post: Post) {
    const texts = [post.title, ...post.comments.map(comment => comment.body)];

    for (let [i, text] of texts.entries()) {
      const request = {
        input: { text },
        voice: this.voice,
        audioConfig: this.audioConfig
      };

      // Performs the text-to-speech request
      const [response] = await this.client.synthesizeSpeech(request);
      // Write the binary audio content to a local file
      const writeFile = util.promisify(fs.writeFile);
      const fileName = `./temp/${post.id}-${i}.mp3`;
      await writeFile(fileName, response.audioContent, "binary");
      console.log(`Audio content written to file: ${fileName}`);
    }

    console.log(
      `Total characters converted to audio: ${texts.join("").length}`
    );
  }
}
