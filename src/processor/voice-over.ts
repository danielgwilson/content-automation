import fs from "fs";
import util from "util";
import path from "path";
import textToSpeech from "@google-cloud/text-to-speech";
import { IPost, IPostSectionFragmentAudio } from "../types/post";

export default class {
  outputDir: string;
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
  constructor({
    outputDir,
    GOOGLE_APPLICATION_CREDENTIALS
  }: {
    outputDir: string;
    GOOGLE_APPLICATION_CREDENTIALS: string;
  }) {
    this.outputDir = outputDir;

    // Creates a Google Cloud Text-to-Speech client
    process.env[
      "GOOGLE_APPLICATION_CREDENTIALS"
    ] = GOOGLE_APPLICATION_CREDENTIALS;
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

  async fetchVoiceOver({ text, fileName }: { text: string; fileName: string }) {
    // Performs the text-to-speech request
    const request = {
      input: { text },
      voice: this.voice,
      audioConfig: this.audioConfig
    };
    const [response] = await this.client.synthesizeSpeech(request);

    // Write the binary audio content to a local file
    const writeFile = util.promisify(fs.writeFile);
    const filePath = path.join(this.outputDir, fileName);
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir);
    }
    await writeFile(filePath, response.audioContent, "binary");

    /* 
    From
    - https://stackoverflow.com/questions/13378815/base64-length-calculation and
    - https://cloud.google.com/text-to-speech/docs/base64-decoding and
    - https://cloud.google.com/text-to-speech/docs/reference/rest/v1/text/synthesize
    
    Since audio response is (1) base-64-encoded and (2) 32kbps, we know that
    audio length = stringLength * bitsPerCharacter (bpc) / bitRate (bps) => audio length = stringLength * 6 / 32000
    */
    const fragmentLength = (response.audioContent.length * 8) / 32000; // Why is 8 bits per character accurate? Shouldn't this be 6 bpc??

    return {
      filePath,
      fileName,
      length: fragmentLength,
      voice: this.voice,
      audioConfig: this.audioConfig
    } as IPostSectionFragmentAudio;
  }
}
