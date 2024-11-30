import { ServiceResponse } from '@/@types';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } from '@/config';
import { Credentials, OAuth2Client } from 'google-auth-library';

export class GoogleAuthService {
  public static client: OAuth2Client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);

  /**
   * Generate the URL for OAuth 2.0 authorization.
   * This should be used to redirect the user to Google's authorization page.
   */
  static generateAuthUrl(client: OAuth2Client): ServiceResponse<string> {
    try {
      const authUrl = client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
      });
      return {
        status: true,
        message: 'Successfully generated auth URL.',
        data: authUrl,
      };
    } catch (error) {
      return {
        status: false,
        message: 'Error generating auth URL.',
        data: undefined,
      };
    }
  }

  /**
   * Exchange the authorization code for an access token and refresh token.
   * @param code - The authorization code returned from the Google OAuth server.
   * @returns A Promise that resolves to the tokens.
   */
  static async getTokens(client: OAuth2Client, code: string): Promise<ServiceResponse<Credentials>> {
    try {
      const { tokens } = await client.getToken(code);
      return {
        status: true,
        message: 'Successfully retrieved tokens.',
        data: tokens,
      };
    } catch (error) {
      return {
        status: false,
        message: 'Error retrieving tokens: ' + error.message,
        data: undefined,
      };
    }
  }

  /**
   * Verify the Google ID token and return the payload.
   * @param token - The ID token to verify.
   * @returns A Promise that resolves to the payload of the verified token.
   */
  static async verifyToken(client: OAuth2Client, token: string): Promise<ServiceResponse<any>> {
    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: GOOGLE_CLIENT_ID,
      });
      return {
        status: true,
        message: 'Token verified successfully.',
        data: ticket.getPayload(),
      };
    } catch (error) {
      return {
        status: false,
        message: 'Error verifying token: ' + error.message,
        data: undefined,
      };
    }
  }
}
