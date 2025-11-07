import { getApp } from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

class AuthService {
  constructor() {
    GoogleSignin.configure({
      webClientId:
        '951225638221-91uq4isins1bq2n70i2lvlovg62nvhk3.apps.googleusercontent.com',
      offlineAccess: true,
    });

    this.app = getApp();
    this.auth = auth(this.app);
  }

  async signInWithGoogle() {
    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      console.log('Play Services available: true');

      // Get user info from Google Sign-In
      const userInfo = await GoogleSignin.signIn();
      console.log('Google Sign-In successful:', userInfo.data?.user?.email);

      // Get ID token from the sign-in result
      const idToken = userInfo.data?.idToken;

      if (!idToken) {
        console.error('No ID token received');
        return {
          success: false,
          error: 'No ID token received from Google Sign-In',
        };
      }

      console.log('ID Token received');

      // Create Google credential using MODULAR API
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      console.log('Google credential created');

      // Sign in to Firebase using MODULAR API
      const userCredential = await this.auth.signInWithCredential(
        googleCredential,
      );
      console.log('Firebase sign-in successful:', userCredential.user.email);

      return {
        success: true,
        user: userCredential.user,
      };
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);

      return {
        success: false,
        error: error.message || 'Sign-in failed',
      };
    }
  }

  async signOut() {
    try {
      await this.auth.signOut();

      // GoogleSignin API surface may differ between versions or environments
      // Guard calls so we don't throw when the function is undefined (seen in logs)
      try {
        if (
          GoogleSignin &&
          typeof GoogleSignin.isSignedIn === 'function' &&
          (await GoogleSignin.isSignedIn())
        ) {
          if (typeof GoogleSignin.signOut === 'function') {
            await GoogleSignin.signOut();
          }
        }
      } catch (innerErr) {
        // Non-fatal: log and continue. We already signed out from firebase above.
        console.warn('GoogleSignin signOut guard failed:', innerErr);
      }

      return { success: true };
    } catch (error) {
      console.error('Sign Out Error:', error);
      return { success: false, error: error.message };
    }
  }

  getCurrentUser() {
    return this.auth.currentUser;
  }

  isSignedIn() {
    return this.auth.currentUser !== null;
  }
}

export default new AuthService();
