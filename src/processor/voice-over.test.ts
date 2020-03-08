import config from "config";
import VoiceOverClient from "./voice-over";
import { createContext } from "../util";

describe("voice-over", () => {
  it("Fetches voice over audio files", async () => {
    const GOOGLE_APPLICATION_CREDENTIALS: string = config.get(
      "GOOGLE_APPLICATION_CREDENTIALS"
    );
    const client = new VoiceOverClient({
      GOOGLE_APPLICATION_CREDENTIALS
    });

    const voRequest = {
      text: "This is some test voice over text.",
      fileName: "test-voice-over.mp3",
      outputDir: "/test/"
    };
    // const audio = await client.fetchVoiceOver(voRequest);

    // expect(audio).toMatchSnapshot();
  });
});
