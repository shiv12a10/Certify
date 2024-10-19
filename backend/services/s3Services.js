const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const { AWS_S3_BUCKET_NAME } = require("../configs");
const crypto = require("crypto");
const s3 = require("../configs/s3");

const randomPdfName = (bytes = 16) => crypto.randomBytes(bytes).toString("hex");

const deleteObjectFromS3 = async (fileName) => {
  const params = {
    Bucket: AWS_S3_BUCKET_NAME,
    Key: `certificates/${fileName}.pdf`,
  };

  const command = new DeleteObjectCommand(params);

  try {
    const response = await s3.send(command);
    console.log("Successfully deleted file from S3:", fileName);
    return response;
  } catch (err) {
    console.error("Error deleting file from S3:", err.message);
    throw new Error(`Failed to delete object from S3: ${err.message}`);
  }
};

const uploadPDFToS3 = async (pdfBuffer) => {
  const pdfName = randomPdfName();
  const params = {
    Bucket: AWS_S3_BUCKET_NAME,
    Key: `certificates/${pdfName}.pdf`,
    Body: pdfBuffer,
    ContentType: "application/pdf",
  };

  
  try {
    const upload = new Upload({
      client: s3,
      params,
    });

    const response = await upload.done();
    console.log("Successfully uploaded PDF to S3:", pdfName);

    return {
      url: `https://${AWS_S3_BUCKET_NAME}.s3.amazonaws.com/certificates/${pdfName}.pdf`,
      pdfName,
    };
  } catch (err) {
    console.error("Error uploading PDF to S3:", err.message);
    throw new Error(`Failed to upload PDF to S3: ${err.message}`);
  }
};

module.exports = { deleteObjectFromS3, uploadPDFToS3 };
