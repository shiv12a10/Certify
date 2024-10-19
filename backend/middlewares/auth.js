const Admin = require("../models/Admin");
const CustomErrorHandler = require("../services/CustomErrorHandler");
const JwtService = require("../services/JwtService");

// User JWT verification
async function jwtVerification(req, res, next) {
  // Ensure that req.cookies exists and check if accessToken is present
  const accessToken = req.cookies?.accessToken;
  
  // // Deployemnt Debug
  // console.log("access token: ",accessToken)
  // console.log("cookies: ",req.cookies)

  if (!accessToken) {
    return next(CustomErrorHandler.unAuthorized("Access token missing"));
  }

  try {
    // Verify the access token
    const token = JwtService.verifyAccessToken(accessToken);
    const admin = await Admin.findById(token.id);

    // Check if admin exists and token is valid
    if (admin && admin.tokens.includes(accessToken)) {
      req.auth = { id: token.id };
      return next();
    }

    // If no valid admin or token found
    return next(
      CustomErrorHandler.unAuthorized("Invalid authentication token")
    );
  } catch (err) {
    // Handle specific JWT errors
    if (err.name === "TokenExpiredError") {
      return next(
        CustomErrorHandler.unAuthorized(`TokenExpiredError: ${err.message}`)
      );
    } else if (err.name === "JsonWebTokenError") {
      return next(
        CustomErrorHandler.unAuthorized(`JsonWebTokenError: ${err.message}`)
      );
    }

    // Handle any other errors
    return next(CustomErrorHandler.serverError(`Server Error: ${err.message}`));
  }
}

const authMiddleware = {
  jwtAuth: jwtVerification,
};

module.exports = authMiddleware;
