import textToSpeech from "@google-cloud/text-to-speech";
import { Post } from "../types/post";
import { generateAudio } from "./audio/generate-audio";
import { generateVideo } from "./video/generate-video";

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
    await generateAudio(post, this.client, this.voice, this.audioConfig);
    await generateVideo(post);
  }
}
