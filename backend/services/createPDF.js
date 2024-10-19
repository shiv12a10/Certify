const crypto = require("crypto");
const PDFDocument = require("pdfkit");
const stream = require("stream");
const { APP_URL } = require("../configs");
const generateQRCode = require("./generateQr");

const verificationKey = (bytes = 16) =>
  crypto.randomBytes(bytes).toString("hex");

const createPDF = async (image) => {
  // Generate QR code
  const verify = verificationKey();
  const verificationUrl = `${APP_URL}/${verify}`;
  const qrCodeBuffer = await generateQRCode(verificationUrl);

  

  // Create a PDF document
  const doc = new PDFDocument();
  const pdfStream = new stream.PassThrough();
  doc.pipe(pdfStream);

  //Add the QR code to the first page
  doc.image(qrCodeBuffer, {
    fit: [300, 300],
    align: "center",
    valign: "center",
  });

  doc.text("Certificate Verification QR Code", {
    align: "center",
    valign: "bottom",
  });

  // doc.addPage(); Add a new page for the certificate
  doc.addPage();
  const imgBuffer = Buffer.from(
    image.replace(/^data:image\/png;base64,/, ""),
    "base64"
  );
  doc.image(imgBuffer, {
    fit: [500, 400],
    align: "center",
    valign: "center",
  });

  // Finalize the PDF and end the stream
  doc.end();

  // Collect the PDF in a buffer
  const pdfBuffer = await new Promise((resolve, reject) => {
    const buffers = [];
    pdfStream.on("data", buffers.push.bind(buffers));
    pdfStream.on("end", () => resolve(Buffer.concat(buffers)));
    pdfStream.on("error", reject);
  });

  return { pdfBuffer, verify, verificationUrl };
};

module.exports = createPDF;
