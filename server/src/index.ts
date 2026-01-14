import express from "express";
import cors from "cors";
import { google } from 'googleapis';
import path from 'node:path';
import { createRoom, joinRoom, addCalendar, refreshRoom, debug } from "./routes";

// Create a new express application instance
const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Parse JSON bodies
app.use(express.json());

// Set the network port
const port = 3333;

const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

// Get OAuth2 client for installed/desktop apps
const getOAuth2Client = () => {
  const credentials = require(CREDENTIALS_PATH);
  const { client_secret, client_id } = credentials.installed;
  
  // For installed apps, use the out-of-band (OOB) redirect
  return new google.auth.OAuth2(
    client_id,
    client_secret,
    'urn:ietf:wg:oauth:2.0:oob'  // Special redirect for installed apps
  );
};

app.get("/", debug);

app.post("/create-room", createRoom);

app.get("/join-room", joinRoom);

app.post("/add-calendar", addCalendar);

app.get("/refresh", refreshRoom);

// Generate auth URL for installed app
app.get("/auth-url", (req, res) => {
  const oauth2Client = getOAuth2Client();
  const scopes = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ];

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    // For desktop apps, we get the code on a special page
    redirect_uri: 'urn:ietf:wg:oauth:2.0:oob'
  });

  res.send({ authUrl });
});

// OAuth callback - receives the code from frontend
app.post("/exchange-code", async (req, res) => {
  const code = req.body.code as string;
  
  if (!code) {
    res.status(400).send({ error: 'No authorization code provided' });
    return;
  }

  try {
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    
    // Get user info
    oauth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();

    // Return tokens and user info to frontend
    res.send({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      email: userInfo.data.email,
      name: userInfo.data.name,
      givenName: userInfo.data.given_name,
      familyName: userInfo.data.family_name
    });
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    res.status(500).send({ error: 'Failed to exchange authorization code' });
  }
});

// Start the Express server
app.listen(port, () => {
    console.log(`The server is running at http://localhost:${port}`);
});