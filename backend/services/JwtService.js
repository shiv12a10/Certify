const jwt = require("jsonwebtoken");
const { JWT_SECRET , REFRESH_SECRET} = require("../configs");
class JwtService {
  createToken(payload) {
    const accessToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: "2h",
    });
    const refreshToken = jwt.sign(payload, REFRESH_SECRET, {
      expiresIn: "24h",
    });
    return { accessToken, refreshToken };
  }
  verifyAccessToken(accessToken) {
    return jwt.verify(accessToken, JWT_SECRET);
  }
  verifyRefreshToken(refreshToken) {
    return jwt.verify(refreshToken, REFRESH_SECRET);
  }
}

module.exports = new JwtService();
