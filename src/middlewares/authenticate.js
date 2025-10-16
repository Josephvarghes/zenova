import passport from 'passport';
import httpStatus from 'http-status';
import APIError from '~/utils/apiError';

// ✅ This callback only checks if JWT is valid
const verifyCallback = (req, resolve, reject) => async (err, user, info) => {
  if (err || info || !user) {
    // If no user found or token invalid
    return reject(new APIError('Unauthorized access', httpStatus.UNAUTHORIZED));
  }

  // Attach user info to request
  req.user = user;

  // If everything is okay → continue
  resolve();
};

// ✅ Main authentication middleware
const authenticate = () => async (req, res, next) => {
  return new Promise((resolve, reject) => {
    passport.authenticate(
      'jwt',                     // Strategy name
      { session: false },        // No session used (JWT stateless)
      verifyCallback(req, resolve, reject) // Callback for verification
    )(req, res, next);
  })
    .then(() => next())          // If verified → move to next middleware/controller
    .catch((err) => next(err));  // If failed → send error
};

export default authenticate;
