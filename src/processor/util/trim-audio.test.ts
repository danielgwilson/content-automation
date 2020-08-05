import { trimAudio } from "./trim-audio";
import { IPostSection } from "../../types";

describe("Trim Audio", () => {
  it("Trims audio to max length parameter", () => {
    const maxAudioLength = 60; // 60 seconds worth of audio
    const sections = [
      {
        type: "title",
        fragments: [
          {
            text: "Why do you like to be alive?",
            textWithPriors: "Why do you like to be alive?",
            audio: {
              filePath:
                "/Users/danielgwilson/local_git/reddit-youtube-video-bot/temp/1fadf0f4-3dad-4cdf-95c2-3a424e218214/voice-over/1fadf0f4-3dad-4cdf-95c2-3a424e218214-0.0.mp3",
              fileName: "1fadf0f4-3dad-4cdf-95c2-3a424e218214-0.0.mp3",
              length: 10,
              voice: {
                languageCode: "en-US",
                name: "en-US-Wavenet-B",
                ssmlGender: "MALE",
              },
              audioConfig: { audioEncoding: "MP3", speakingRate: 1 },
            },
          },
        ],
        length: 10,
        score: 124447,
        author: "skopein",
        gildings: { silver: 214, gold: 19, platinum: 13 },
        children: [],
      },
      {
        type: "comment",
        fragments: [
          {
            text:
              "Yes everyone, this post has a lot of a awards and many people in this thread have gotten awards too.",
            textWithPriors:
              "Yes everyone, this post has a lot of a awards and many people in this thread have gotten awards too.",
            audio: {
              filePath:
                "/Users/danielgwilson/local_git/reddit-youtube-video-bot/temp/1fadf0f4-3dad-4cdf-95c2-3a424e218214/voice-over/1fadf0f4-3dad-4cdf-95c2-3a424e218214-1.0.mp3",
              fileName: "1fadf0f4-3dad-4cdf-95c2-3a424e218214-1.0.mp3",
              length: 60 * 16,
              voice: {
                languageCode: "en-US",
                name: "en-US-Wavenet-B",
                ssmlGender: "MALE",
              },
              audioConfig: { audioEncoding: "MP3", speakingRate: 1 },
            },
          },
          {
            text:
              "However, PLEASE keep in mind rule 7 and stop begging for awards, because a lot of you are doing it and it is against the rules.",
            textWithPriors:
              "Yes everyone, this post has a lot of a awards and many people in this thread have gotten awards too. However, PLEASE keep in mind rule 7 and stop begging for awards, because a lot of you are doing it and it is against the rules.",
            audio: {
              filePath:
                "/Users/danielgwilson/local_git/reddit-youtube-video-bot/temp/1fadf0f4-3dad-4cdf-95c2-3a424e218214/voice-over/1fadf0f4-3dad-4cdf-95c2-3a424e218214-1.1.mp3",
              fileName: "1fadf0f4-3dad-4cdf-95c2-3a424e218214-1.1.mp3",
              length: 8.208,
              voice: {
                languageCode: "en-US",
                name: "en-US-Wavenet-B",
                ssmlGender: "MALE",
              },
              audioConfig: { audioEncoding: "MP3", speakingRate: 1 },
            },
          },
          {
            text:
              "\nAdditionally, if anyone is reading this thread and struggling, there are some resources available:",
            textWithPriors:
              "Yes everyone, this post has a lot of a awards and many people in this thread have gotten awards too. However, PLEASE keep in mind rule 7 and stop begging for awards, because a lot of you are doing it and it is against the rules. \nAdditionally, if anyone is reading this thread and struggling, there are some resources available:",
            audio: {
              filePath:
                "/Users/danielgwilson/local_git/reddit-youtube-video-bot/temp/1fadf0f4-3dad-4cdf-95c2-3a424e218214/voice-over/1fadf0f4-3dad-4cdf-95c2-3a424e218214-1.2.mp3",
              fileName: "1fadf0f4-3dad-4cdf-95c2-3a424e218214-1.2.mp3",
              length: 5.928,
              voice: {
                languageCode: "en-US",
                name: "en-US-Wavenet-B",
                ssmlGender: "MALE",
              },
              audioConfig: { audioEncoding: "MP3", speakingRate: 1 },
            },
          },
        ],
        length: 0,
        score: 1,
        author: "-eDgAR-",
        gildings: { silver: 6 },
        children: [],
      },
    ] as IPostSection[];

    const trimmedSections = trimAudio(sections, { maxAudioLength });

    expect(trimmedSections.length).toBe(2);
    expect(trimmedSections).toMatchSnapshot();
  });
});
