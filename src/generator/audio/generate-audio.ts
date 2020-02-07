import fs from "fs";
import util from "util";
import path from "path";
import { IPost, IProcessedPost, IPostSection } from "../../types/post";

export async function generateAudio(
  post: IPost,
  client: any,
  voice: {
    languageCode: string;
    name: string;
    ssmlGender: string;
  },
  audioConfig: {
    audioEncoding: string;
    speakingRate: number;
  },
  { splitBySentence = true }: { splitBySentence?: boolean } = {}
): Promise<IProcessedPost> {
  const texts = [post.title, ...post.comments.map(comment => comment.body)];
  const audioLengths: number[] = [];

  const promises: Promise<IPostSection>[] = [];
  for (let [i, text] of texts.entries()) {
    const cleanText = text.replace(/[\u200B-\u200D\uFEFF]/g, "");
    // .replace(/\n/g, ""); // removes weird disallowed characters. SHOULD REMOVE UNSAFE!! Arb. code exec. bug
    promises.push(
      new Promise(async resolve => {
        const sentences =
          splitBySentence && i > 0
            ? cleanText
                .replace(
                  /(\.+|\:|\!|\?)(\"*|\'*|\)*|}*|]*)(\s|\n|\r|\r\n)/gm,
                  "$1$2|"
                )
                .split("|")
            : [cleanText]; // Splits text by ending punctuation except for title

        const fragments: {
          text: string;
          textWithPriors: string;
          audio: { filePath: string; fileName: string; length: number };
        }[] = [];

        const textWithPriors = [];

        let audioLength = 0;
        for (let [j, sentence] of sentences.entries()) {
          // Update textWithPriors to contain all text up to and including the current sentence.
          textWithPriors.push(sentence);

          // Performs the text-to-speech request
          const request = {
            input: { text: sentence },
            voice: voice,
            audioConfig: audioConfig
          };
          const [response] = await client.synthesizeSpeech(request);

          // Write the binary audio content to a local file
          const writeFile = util.promisify(fs.writeFile);
          const targetDir = path.join(__dirname, "/../../", "./temp/");
          const fileName = `${post.id}-${i}.${j}.mp3`;
          const filePath = path.join(targetDir, fileName);
          if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir);
          }
          await writeFile(filePath, response.audioContent, "binary");
          console.log(`Audio content written to file: ${filePath}`);

          /* 
          From
          - https://stackoverflow.com/questions/13378815/base64-length-calculation and
          - https://cloud.google.com/text-to-speech/docs/base64-decoding and
          - https://cloud.google.com/text-to-speech/docs/reference/rest/v1/text/synthesize
          
          Since audio response is (1) base-64-encoded and (2) 32kbps, we know that
          audio length = stringLength * bitsPerCharacter (bpc) / bitRate (bps) => audio length = stringLength * 6 / 32000
          */
          const fragmentLength = (response.audioContent.length * 8) / 32000; // Why is 8 bits per character accurate? Shouldn't this be 6 bpc??
          audioLength += fragmentLength;

          fragments.push({
            text: cleanText,
            textWithPriors: textWithPriors.join(" "),
            audio: { filePath, fileName, length: fragmentLength }
          });
        }
        audioLengths.push(audioLength);

        return resolve({
          type: i === 0 ? "title" : "comment",
          fragments,
          length: audioLength,

          subredditName: post.subredditName,
          score: i === 0 ? post.score : post.comments[i - 1].score,
          upvoteRatio: i === 0 ? post.upvoteRatio : undefined,
          author: i === 0 ? post.author : post.comments[i - 1].author,
          numComments: post.numComments
        });
      })
    );
  }
  const sections = await Promise.all(promises);

  const totalCharacters = texts.join("").length;
  const totalAudioLength = audioLengths.reduce((a, b) => a + b, 0);

  console.log(`\nTotal characters converted to audio: ${totalCharacters}`);
  console.log(
    `Aggregate length of audio files: ${new Date(totalAudioLength * 1000)
      .toISOString()
      .substr(11, 8)}\n`
  );

  return {
    post,
    sections
  } as IProcessedPost;
}
