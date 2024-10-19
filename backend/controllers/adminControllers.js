const Certificate = require("../models/Certificate");
const CustomErrorHandler = require("../services/CustomErrorHandler");
const generateQRCode = require("../services/generateQr");
const { APP_URL } = require("../configs");
const crypto = require("crypto");
const Verification = require("../models/Verification");
const PDFDocument = require("pdfkit");
const stream = require("stream");
const { uploadPDFToS3, deleteObjectFromS3 } = require("../services/s3Services");
const Email = require("../models/Email");
const hashService = require("../services/hashService");
const JwtService = require("../services/JwtService");
const Admin = require("../models/Admin");
const RefreshToken = require("../models/RefreshToken");
const createPDF = require("../services/createPDF");
const mailTransport = require("../services/mailTransport");

const verificationKey = (bytes = 16) =>
  crypto.randomBytes(bytes).toString("hex");

const adminControllers = {
  async register(req, res, next) {
    const { userName, email, password } = req.body;

    if (!userName || !email || !password) {
      return next(CustomErrorHandler.missingFields());
    }

    try {
      const exist = await Email.findOne({ email });
      const registered = await Admin.findOne({ email });

      if (!exist) {
        return next(CustomErrorHandler.unAuthorized("Invalid Email"));
      }

      if (registered) {
        return next(CustomErrorHandler.alreadyExist("Email already taken"));
      }

      const hashedPassword = hashService.hashPassword(password);

      const admin = await Admin.create({
        userName,
        email,
        password: hashedPassword,
      });

      const { accessToken, refreshToken } = JwtService.createToken({
        id: admin._id,
      });

      await RefreshToken.create({
        token: refreshToken,
        adminId: admin._id,
      });

      admin.tokens.unshift(accessToken);
      await admin.save();

      res.cookie("accessToken", accessToken, {
        maxAge: 1000 * 60 * 60 * 24 * 30, //30 days
        // httpOnly: true,
        sameSite: "none",
        secure: true,
      });

      res.cookie("refreshToken", refreshToken, {
        maxAge: 1000 * 60 * 60 * 24 * 30, //30 days
        // httpOnly: true,
        sameSite: "none",
        secure: true,
      });

      res.status(200).json({
        message: "successfully Registered",
        success: true,
        userName,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  async login(req, res, next) {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(CustomErrorHandler.missingFields());
    }

    try {
      const registered = await Admin.findOne({ email });

      if (!registered) {
        return next(CustomErrorHandler.wrongCredentials("Invalid Email"));
      }

      const hashedPassword = hashService.hashPassword(password);

      if (registered.password !== hashedPassword) {
        return next(CustomErrorHandler.wrongCredentials("Invalid Password"));
      }

      const { accessToken, refreshToken } = JwtService.createToken({
        id: registered._id,
      });

      await RefreshToken.create({
        token: refreshToken,
        adminId: registered._id,
      });

      registered.tokens.unshift(accessToken);
      await registered.save();

      res.cookie("accessToken", accessToken, {
        maxAge: 1000 * 60 * 60 * 24 * 30, //30 days
        // httpOnly: true,
        sameSite: "none",
        secure: true,
      });

      res.cookie("refreshToken", refreshToken, {
        maxAge: 1000 * 60 * 60 * 24 * 30, //30 days
        // httpOnly: true,
        sameSite: "none",
        secure: true,
      });

      res.status(200).json({
        success: true,
        userName: registered.userName,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  async logout(req, res, next) {
    const id = req.auth.id;
    if (!id) {
      return next(CustomErrorHandler.serverError());
    }

    try {
      const admin = await Admin.findById(id);
      if (!admin) {
        return next(CustomErrorHandler.notFound("admin not found"));
      }

      admin.tokens = [];
      await admin.save();

      await RefreshToken.deleteMany({ adminId: id });

      res.clearCookie("refreshToken");
      res.clearCookie("accessToken");
      res.status(200).json("logged out");
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  async refresh(req, res, next) {
    try {
      const { refreshToken: refreshTokenFromCookie } = req.cookies;
      if (!refreshTokenFromCookie) {
        next(CustomErrorHandler.unAuthorized());
      }

      let adminData = await JwtService.verifyRefreshToken(
        refreshTokenFromCookie
      );

      let token = await RefreshToken.findOne({
        adminId: adminData.id,
        token: refreshTokenFromCookie,
      });

      if (!token) {
        return next(CustomErrorHandler.invalidToken());
      }

      const admin = await Admin.findById(adminData.id);
      if (!admin) {
        return next(CustomErrorHandler.notFound("Admin not found"));
      }

      const { accessToken, refreshToken } = JwtService.createToken({
        id: admin._id,
      });

      await RefreshToken.create({
        token: refreshToken,
        adminId: admin._id,
      });

      admin.tokens.unshift(accessToken);
      await admin.save();

      res.cookie("accessToken", accessToken, {
        maxAge: 1000 * 60 * 60 * 24 * 30, //30 days
        sameSite: "none",
        secure: true,
        // httpOnly: true,
      });

      res.cookie("refreshToken", refreshToken, {
        maxAge: 1000 * 60 * 60 * 24 * 30, //30 days
        sameSite: "none",
        secure: true,
        // httpOnly: true,
      });

      res.status(200).json({
        success: true,
        userName: admin.userName,
      });
    } catch (error) {
      next(error);
    }
  },

  async createCertificate(req, res, next) {
    const { email, name, image } = req.body;
    const id = req.auth.id;

    if (!email || !name || !image) {
      return next(CustomErrorHandler.missingFields());
    }

    if (!id) {
      return next(CustomErrorHandler.unAuthorized());
    }

    try {
      const exist = await Certificate.findOne({ email });
      if (exist) {
        return next(
          CustomErrorHandler.alreadyExist(
            "Email already taken, Please use diffrent email or check existing certificates to update"
          )
        );
      }

      const { pdfBuffer, verify, verificationUrl } = await createPDF(image);

      // Save the PDF on S3
      const uploadResponse = await uploadPDFToS3(pdfBuffer);

      const certificate = await Certificate.create({
        keyName: uploadResponse.pdfName,
        email,
        name,
        url: uploadResponse.url,
        admins: [id],
      });

      const verification = await Verification.create({
        certificate: certificate._id,
        verificationCode: verify,
        verificationUrl,
      });

      certificate.verification = verification._id;
      await certificate.save();

      mailTransport.sendMail({
        from: "certify@gmail.com",
        to: email,
        subject: "Your Certificate",
        text: `Hello ${name},\n\nAttached is your certificate.\n\nBest regards,\nThe Team`,
        attachments: [
          {
            filename: uploadResponse.pdfName, // Name of the attached file
            content: pdfBuffer, // The actual PDF buffer
            contentType: "application/pdf",
          },
        ],
      });

      res.status(200).json({ success: true });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  async toggleCertificateValidation(req, res, next) {
    const { id } = req.params;
    const adminId = req.auth.id;
    if (!id) {
      return next(CustomErrorHandler.missingFields());
    }
    if (!adminId) {
      return next(CustomErrorHandler.unAuthorized());
    }

    try {
      const certificate = await Certificate.findById(id);
      if (!id) {
        return next(CustomErrorHandler.notFound("Certificate not Exist"));
      }

      certificate.valid = !certificate.valid;
      certificate.admins.unshift(adminId);

      await certificate.save();

      res.status(200).json({ success: true, message: "Certificate Updated" });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  async updateCertificateName(req, res, next) {
    const { id } = req.params;
    const { name, image } = req.body;
    const adminId = req.auth.id;

    console.log(req.body);

    if (!name || !image || !id) {
      return next(CustomErrorHandler.missingFields());
    }

    if (!adminId) {
      return next(CustomErrorHandler.unAuthorized());
    }

    try {
      const certificate = await Certificate.findById(id);
      if (!id) {
        return next(CustomErrorHandler.notFound("Certificate not Exist"));
      }

      // delete prev the PDF on S3
      const pdfKey = certificate.keyName;
      await deleteObjectFromS3(pdfKey);

      await Verification.deleteOne({ _id: certificate.verification });

      const { pdfBuffer, verify, verificationUrl } = await createPDF(image);

      // Save the PDF on S3
      const uploadResponse = await uploadPDFToS3(pdfBuffer);

      const verification = await Verification.create({
        certificate: certificate._id,
        verificationCode: verify,
        verificationUrl,
      });

      certificate.keyName = uploadResponse.pdfName;
      certificate.name = name;
      certificate.url = uploadResponse.url;
      certificate.admins.unshift(adminId);
      certificate.verification = verification._id;
      await certificate.save();

      mailTransport.sendMail({
        from: "certify@gmail.com",
        to: certificate.email,
        subject: "Your Certificate has been updated",
        text: `Hello ${name},\n\nAttached is your updated certificate.\n\nBest regards,\nThe Team`,
        attachments: [
          {
            filename: uploadResponse.pdfName, // Name of the attached file
            content: pdfBuffer, // The actual PDF buffer
            contentType: "application/pdf",
          },
        ],
      });

      res.status(200).json({ success: true, message: "Certificate Updated" });
    } catch (err) {
      console.log(err);
      next(err);
    }
  },

  async getCertificates(req, res, next) {
    try {
      const { page = 1, limit = 10, key } = req.query;

      const pageNumber = parseInt(page);
      const limitNumber = parseInt(limit);

      const skip = (pageNumber - 1) * limitNumber;

      let certificates;
      let totalCertificates;

      if (key) {
        certificates = await Certificate.find({
          $or: [{ keyName: key }, { email: key }],
        })
          .populate("verification")
          .populate("admins");

        totalCertificates = certificates.length;
      } else {
        certificates = await Certificate.find()
          .populate("verification")
          .populate("admins")
          .sort({ createdAt: -1 })
          .limit(limitNumber)
          .skip(skip);

        totalCertificates = await Certificate.countDocuments();
      }

      res.status(200).json({
        success: true,
        count: certificates.length,
        totalPages: Math.ceil(totalCertificates / limitNumber),
        currentPage: pageNumber,
        data: certificates,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: "Server Error",
        error: error.message,
      });
    }
  },

  async deleteCertificate(req, res, next) {
    const { id } = req.params;
    const adminId = req.auth.id;

    if (!id) {
      return next(CustomErrorHandler.missingFields());
    }

    if (!adminId) {
      return next(CustomErrorHandler.unAuthorized());
    }

    try {
      // Find and delete the certificate by ID
      const certificate = await Certificate.findByIdAndDelete(id);

      if (!certificate) {
        return next(CustomErrorHandler.notFound("Certificate not found"));
      }

      // Delete the PDF from S3
      const pdfKey = certificate.keyName;
      await deleteObjectFromS3(pdfKey);

      // Delete the associated verification record
      await Verification.deleteOne({ _id: certificate.verification });

      // Send success response
      res
        .status(200)
        .json({ success: true, message: "Certificate deleted successfully" });
    } catch (err) {
      console.error(err);
      next(CustomErrorHandler.serverError());
    }
  },
};

module.exports = adminControllers;
