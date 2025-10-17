// services/googleService.js
import { OAuth2Client } from 'google-auth-library';
import config from '~/config/config';
import User from '~/models/userModel';
import tokenService from '~/services/tokenService';
import httpStatus from 'http-status';
import APIError from '~/utils/apiError';

const client = new OAuth2Client(config.GOOGLE_CLIENT_ID);

/**
 * Verify Google ID token and return user info
 */
export const verifyGoogleToken = async (idToken) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: config.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload) {
      throw new APIError('Invalid Google token', httpStatus.UNAUTHORIZED);
    }
    return {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    };
  } catch (err) {
    throw new APIError('Google authentication failed', httpStatus.UNAUTHORIZED);
  }
};

/**
 * Find or create user from Google info
 */
export const findOrCreateGoogleUser = async (googleInfo) => {
  let user = await User.findOne({ email: googleInfo.email });
  if (!user) {
    // Create new user
    user = new User({
      email: googleInfo.email,
      fullName: googleInfo.name,
      userName: `google_${googleInfo.googleId.substring(0, 8)}`,
      password: 'google_oauth_user', // dummy (not used)
      googleId: googleInfo.googleId,
      confirmed: true,
      isVerified: true,
    });
    await user.save();
  } else {
    // Update Google ID if missing
    if (!user.googleId) {
      user.googleId = googleInfo.googleId;
      await user.save();
    }
  }
  return user;
};

/**
 * Full Google sign-in flow
 */
export const googleSignIn = async (idToken) => {
  const googleInfo = await verifyGoogleToken(idToken);
  const user = await findOrCreateGoogleUser(googleInfo);
  const tokens = await tokenService.generateAuthTokens(user);
  return { user, tokens };
};

export default {
  verifyGoogleToken,
  findOrCreateGoogleUser,
  googleSignIn,
};