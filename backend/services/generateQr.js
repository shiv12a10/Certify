const QRCode = require("qrcode");
const generateQRCode = async (text) => {
  return QRCode.toBuffer(text, { type: "png" });
};

module.exports = generateQRCode;