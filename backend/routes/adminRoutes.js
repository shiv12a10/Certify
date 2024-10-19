const express = require("express");
const adminControllers = require("../controllers/adminControllers");
const authMiddleware = require("../middlewares/auth");
const router = express.Router();

router.post("/signup", adminControllers.register);
router.post("/signin", adminControllers.login);
router.get("/refresh", adminControllers.refresh);

router.use(authMiddleware.jwtAuth);

router.post("/logout", adminControllers.logout);

router.post("/certificate", adminControllers.createCertificate);

router.delete("/certificate/:id", adminControllers.deleteCertificate);

router.put("/certificate/:id", adminControllers.updateCertificateName);

router.put(
  "/certificate-validation/:id",
  adminControllers.toggleCertificateValidation
);

router.get("/certificates", adminControllers.getCertificates);

module.exports = router;
