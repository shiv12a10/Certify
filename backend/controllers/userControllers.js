const Verification = require("../models/Verification");
const CustomErrorHandler = require("../services/CustomErrorHandler");

const userControllers = {
  async fetchUrlIfValid(req, res, next) {
    const { vrCode } = req.params;

    if (!vrCode) {
      return next(CustomErrorHandler.missingFields());
    }

    try {
      const verification = await Verification.findOne({
        verificationCode: vrCode,
      }).populate("certificate");
      if (!verification) {
        return next(
          CustomErrorHandler.notFound(
            "No certificate exist with the given verification code, Please Scan the QR properly"
          )
        );
      }

      if (!verification.certificate.valid) {
        return res.status(200).json({
          success: true,
          valid: false,
        });
      }

      return res.status(200).json({
        success: true,
        valid: true,
        url: verification.certificate.url,
        keyName: verification.certificate.keyName,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
};

module.exports = userControllers;
