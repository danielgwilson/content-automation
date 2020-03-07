import path from "path";
import Bottleneck from "bottleneck";
import textToSpeech from "@google-cloud/text-to-speech";
import { writeFile } from "../util";
import { IPostSectionFragmentAudio } from "../types";
import { IContext } from "../types";

interface IVoice {
  languageCode: string;
  name: string;
  ssmlGender: string;
}

interface IAudioConfig {
  audioEncoding: string;
  speakingRate: number;
}

interface ITextToSpeechRequest {
  input: { text: string };
  voice: IVoice;
  audioConfig: IAudioConfig;
}

export default class VoiceOverClient {
  limiter: Bottleneck;

  client: any;
  voice: IVoice;
  audioConfig: IAudioConfig;
  constructor({
    GOOGLE_APPLICATION_CREDENTIALS
  }: {
    GOOGLE_APPLICATION_CREDENTIALS: string;
  }) {
    // Set up rate limiter
    this.limiter = new Bottleneck({
      maxConcurrent: 10,
      minTime: 250,
      reservoir: 300,
      reservoirRefreshInterval: 1000 * 60,
      reservoirRefreshAmount: 300
    });

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

  async fetchVoiceOver({
    text,
    fileName,
    outputDir
  }: {
    text: string;
    fileName: string;
    outputDir: string;
  }) {
    // Performs the text-to-speech request
    const request: ITextToSpeechRequest = {
      input: { text },
      voice: this.voice,
      audioConfig: this.audioConfig
    };
    const { client } = this;
    const synthesizeSpeech = async (request: ITextToSpeechRequest) => {
      return await client.synthesizeSpeech(request);
    };
    const [response] = await this.limiter.schedule(synthesizeSpeech, request);

    // Write the binary audio content to a local file
    const filePath = path.resolve(path.join(outputDir, "voice-over", fileName));
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
