import 'dotenv/config';
import fs from 'fs';
import readline from 'readline';
import { google, Auth } from 'googleapis';

const credentials = JSON.parse(process.env.YOUTUBE_CREDENTIALS!);

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/content-automation.json
const SCOPES = ['https://www.googleapis.com/auth/youtube'];
const TOKEN_DIR =
  (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) +
  '/.credentials/';
const TOKEN_PATH = TOKEN_DIR + 'content-automation.json';

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 */
export const getAuthClient = async () => {
  const clientSecret = credentials.installed.client_secret;
  const clientId = credentials.installed.client_id;
  const redirectUrl = credentials.installed.redirect_uris?.[0] ?? undefined;
  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUrl
  );

  // Check if we have previously stored a token.
  try {
    const token = fs.readFileSync(TOKEN_PATH);
    oauth2Client.credentials = JSON.parse(token.toString());
  } catch (err) {
    const token = await getNewToken(oauth2Client);
    oauth2Client.credentials = (token as unknown) as Auth.Credentials;
  }

  return oauth2Client;
};

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 */
const getNewToken = async (oauth2Client: Auth.OAuth2Client) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('Authorize this app by visiting this url: ', authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const token = await new Promise((resolve) => {
    rl.question('Enter the code from that page here: ', function(code) {
      rl.close();
      oauth2Client.getToken(code, function(err, token) {
        if (err || !token) {
          console.log('Error while trying to retrieve access token', err);
          return;
        }
        storeToken(token);
        resolve(token);
      });
    });
  });

  return token;
};

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token: Auth.Credentials) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (((err as unknown) as any).code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
    if (err) throw err;
    console.log('Token stored to ' + TOKEN_PATH);
  });
}

/**
 * Lists the names and IDs of up to 10 files.
 *
 * @param {google.Auth.OAuth2Client} authClient An authorized OAuth2 client.
 */
export const getChannel = async (authClient: Auth.OAuth2Client) => {
  const service = google.youtube('v3');
  try {
    const response = await service.channels.list({
      auth: authClient,
      part: ['snippet,contentDetails,statistics'],
      id: ['UCXUs3edhYBfpetivG4OrPiQ'],
    });

    if (!response?.data.items) throw new Error('No items found.');

    const channels = response.data.items;

    if (channels.length == 0) {
      console.log('No channel found.');
    } else {
      console.log(
        "This channel's ID is %s. Its title is '%s', and " + 'it has %s views.',
        channels[0].id,
        channels[0].snippet?.title,
        channels[0].statistics?.viewCount
      );
      console.dir(channels[0].statistics, { depth: null });
    }
  } catch (err) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
  }
};

export const uploadVideo = async (
  authClient: Auth.OAuth2Client,
  path: string,
  options: { title: string; description: string; tags: string[] }
) => {
  const { title, description, tags } = options;

  const youtube = google.youtube('v3');

  try {
    const response = await youtube.videos.insert({
      auth: authClient,

      part: ['snippet,status'],

      requestBody: {
        snippet: {
          title,
          description,
          tags,
          categoryId: '24',
        },
        status: {
          privacyStatus: 'public',
          selfDeclaredMadeForKids: false,
        },
      },

      media: {
        body: fs.createReadStream(path),
      },
    });
    // console.dir(response.data, { depth: null });

    return response.data;
  } catch (err) {
    if (err) {
      console.log('The API returned an error: ' + err);
      console.dir(err, { depth: null });
      return;
    }
  }
};

// (async () => {
//   const client = await getAuthClient();
//   await getChannel(client);

//   console.log('Attempting to upload video...');
//   await uploadVideo(
//     client,
//     './temp/content/1553638d-5cf3-4b60-8693-51b3526c1b43/output.mp4',
//     {
//       title: 'What is incorrectly perceived as a sign of intelligence?',
//       description:
//         'What is incorrectly perceived as a sign of intelligence?\n\n#shorts #reddit #askreddit',
//       tags: [],
//     }
//   );
// })();
