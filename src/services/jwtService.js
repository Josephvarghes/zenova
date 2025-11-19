// import httpStatus from 'http-status';
// import jwt from 'jsonwebtoken';
// import moment from 'moment';
// import APIError from '~/utils/apiError';

// export const sign = async (userId, expires, secret, options) => {
// 	try {
// 		const payload = {
// 			sub: userId,
// 			iat: moment().unix(),
// 			exp: expires.unix()
// 		};
// 		return jwt.sign(payload, secret, options);
// 	} catch (err) {
// 		throw new APIError(err.message, httpStatus.UNAUTHORIZED);
// 	}
// };

// export const verify = async (token, secret, options) => {
// 	try {
// 		return jwt.verify(token, secret, options);
// 	} catch (err) {
// 		throw new APIError(err.message, httpStatus.UNAUTHORIZED);
// 	}
// };

// export default { sign, verify };
 
import httpStatus from 'http-status';
import jwt from 'jsonwebtoken';
import moment from 'moment';
import APIError from '~/utils/apiError';

export const sign = async (userId, expires, secret, options) => {
  try {
    // 🔍 Ensure userId is string (avoid nested { sub: ... })
    const cleanUserId =
      typeof userId === "object" && userId.sub
        ? userId.sub.toString()
        : userId.toString();

    // 🟦 Debug
    console.log("🟦 [jwtService.sign] Clean User ID:", cleanUserId);

    const payload = {
      sub: cleanUserId,          // ✅ Correct final structure
      iat: moment().unix(),
      exp: expires.unix()
    };

    // 🟦 Debug
    console.log("🟩 [jwtService.sign] Final JWT Payload:", payload);

    return jwt.sign(payload, secret, options);
  } catch (err) {
    throw new APIError(err.message, httpStatus.UNAUTHORIZED);
  }
};

export const verify = async (token, secret, options) => {
  try {
    const decoded = jwt.verify(token, secret, options);

    // 🟦 Debug verify
    console.log("🟦 [jwtService.verify] Decoded JWT:", decoded);

    return decoded;
  } catch (err) {
    throw new APIError(err.message, httpStatus.UNAUTHORIZED);
  }
};

export default { sign, verify };
