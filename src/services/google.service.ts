import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { GOOGLE_CLIENT_ID } from '@/config';

class googleAuthService {
  private client: OAuth2Client;

  constructor() {
    if (!GOOGLE_CLIENT_ID) {
      throw new Error('Missing GOOGLE_CLIENT_ID environment variable');
    }

    // Initialize the OAuth2Client with the Google Client ID from environment variables
    this.client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  /**
   * Verifies the Google ID token and returns the payload if valid.
   * @param token - The Google ID token to verify.
   * @returns A Promise that resolves to the payload of the verified token.
   * @throws An error if the token is invalid or verification fails.
   */
  async verifyToken(token: string): Promise<TokenPayload | null> {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      return ticket.getPayload();
    } catch (error) {
      console.error('Error verifying Google token:', error);
      throw new Error('Invalid Google token');
    }
  }
}

export const GoogleAuthService = new googleAuthService();
