// services/appleService.js
import appleSignin from 'apple-signin-auth';
import config from '~/config/config';
import User from '~/models/userModel';
import tokenService from '~/services/tokenService';
import httpStatus from 'http-status';
import APIError from '~/utils/apiError';

/**
 * Verify Apple identity token and extract user info
 */
export const verifyAppleToken = async (identityToken) => {
  try {
    const { payload } = await appleSignin.verifyIdToken(identityToken, {
      audience: config.APPLE_CLIENT_ID, // your bundle ID
    });

    if (!payload) {
      throw new APIError('Invalid Apple token', httpStatus.UNAUTHORIZED);
    }

    return {
      appleId: payload.sub, // unique user ID from Apple
      email: payload.email, // only on first login!
      isPrivateEmail: payload.is_private_email || false,
    };
  } catch (err) {
    throw new APIError('Apple authentication failed', httpStatus.UNAUTHORIZED);
  }
};

/**
 * Find or create user from Apple info
 */
export const findOrCreateAppleUser = async (appleInfo) => {
  // Apple only sends email on FIRST login!
  // So we must handle cases where email is missing

  let user;

  if (appleInfo.email) {
    user = await User.findOne({ email: appleInfo.email });
  }

  if (!user) {
    user = await User.findOne({ appleId: appleInfo.appleId });
  }

  if (!user) {
    // Create new user
    // If no email, generate a placeholder (Apple hides real email)
    const email = appleInfo.email || `apple_${appleInfo.appleId}@privaterelay.appleid.com`;

    user = new User({
      email,
      fullName: 'Apple User', // Apple doesn’t provide name
      userName: `apple_${appleInfo.appleId.substring(0, 8)}`,
      password: 'apple_oauth_user', // dummy
      appleId: appleInfo.appleId,
      confirmed: true,
      isVerified: true,
    });
    await user.save();
  } else if (appleInfo.email && !user.email.includes('privaterelay')) {
    // Update email if it was previously hidden
    user.email = appleInfo.email;
    await user.save();
  }

  return user;
};

/**
 * Full Apple sign-in flow
 */
export const appleSignIn = async (identityToken) => {
  const appleInfo = await verifyAppleToken(identityToken);
  const user = await findOrCreateAppleUser(appleInfo);
  const tokens = await tokenService.generateAuthTokens(user);
  return { user, tokens };
};

export default {
  verifyAppleToken,
  findOrCreateAppleUser,
  appleSignIn,
};