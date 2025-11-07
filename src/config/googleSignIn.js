// Google Sign-In Configuration
// Replace with your Web Client ID from Google Cloud Console

import { GOOGLE_WEB_CLIENT_ID } from './env';

export const googleSignInConfig = {
  webClientId: GOOGLE_WEB_CLIENT_ID,
};

// Instructions to get Web Client ID:
// 1. Go to Google Cloud Console (https://console.cloud.google.com/)
// 2. Select your Firebase project
// 3. Go to "APIs & Services" → "Credentials"
// 4. Find "Web client (auto created by Google Service)" or create a new OAuth 2.0 Client ID
// 5. Copy the Client ID (it ends with .apps.googleusercontent.com)
