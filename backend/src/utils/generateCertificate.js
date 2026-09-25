import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import QRCode from "qrcode";

const generateCertificate = async ({
  certificateNumber,
  learnerName,
  professionalTitle,
  courseTitle,
  credits,
  durationHours,
  issuedDate,
  instructorName,
  outputPath,
}) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        layout: "landscape",
        margins: {
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
        },
      });

      const directory = path.dirname(outputPath);

      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
      }

      const stream = fs.createWriteStream(outputPath);

      stream.on("finish", () => resolve(outputPath));
      stream.on("error", reject);

      doc.pipe(stream);

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;

      const assetsPath = path.join(process.cwd(), "assets", "certificates");

      const rcvdLogo = path.join(assetsPath, "rcvd-logo.png");

      const cpdLogo = path.join(assetsPath, "cpd-rwanda-logo.png");

      const providerSignature = path.join(
        assetsPath,
        "cpd-service-provider-signature.png",
      );

      const chairmanSignature = path.join(
        assetsPath,
        "rcvd-chairman-signature.png",
      );

      // --------------------------------------------------
      // QR CODE
      // --------------------------------------------------

      const verificationUrl = `https://rcvd-elearning.netlify.app/verify/${certificateNumber}`;

      const qrBuffer = await QRCode.toBuffer(verificationUrl, {
        width: 180,
        margin: 1,
        errorCorrectionLevel: "H",
      });

      // --------------------------------------------------
      // BACKGROUND
      // --------------------------------------------------

      doc.rect(0, 0, pageWidth, pageHeight).fill("#ffffff");

      // --------------------------------------------------
      // SOPHISTICATED CERTIFICATE FRAME
      // --------------------------------------------------

      // Outer navy border
      doc
        .lineWidth(8)
        .strokeColor("#18436d")
        .rect(16, 16, pageWidth - 32, pageHeight - 32)
        .stroke();

      // Gold border
      doc
        .lineWidth(2)
        .strokeColor("#b08d57")
        .rect(27, 27, pageWidth - 54, pageHeight - 54)
        .stroke();

      // Fine inner border
      doc
        .lineWidth(1)
        .strokeColor("#18436d")
        .rect(34, 34, pageWidth - 68, pageHeight - 68)
        .stroke();

      // --------------------------------------------------
      // ORNAMENTAL CORNERS
      // --------------------------------------------------

      const drawCorner = (x, y, horizontal, vertical) => {
        doc.save().lineWidth(2).strokeColor("#b08d57");

        // Main L
        doc
          .moveTo(x, y + vertical * 48)
          .lineTo(x, y)
          .lineTo(x + horizontal * 48, y)
          .stroke();

        // Inner L
        doc
          .lineWidth(1)
          .strokeColor("#18436d")
          .moveTo(x + horizontal * 7, y + vertical * 36)
          .lineTo(x + horizontal * 7, y + vertical * 7)
          .lineTo(x + horizontal * 36, y + vertical * 7)
          .stroke();

        // Decorative diamond
        const diamondX = x + horizontal * 14;
        const diamondY = y + vertical * 14;

        doc
          .lineWidth(1.2)
          .strokeColor("#b08d57")
          .moveTo(diamondX, diamondY - vertical * 6)
          .lineTo(diamondX + horizontal * 6, diamondY)
          .lineTo(diamondX, diamondY + vertical * 6)
          .lineTo(diamondX - horizontal * 6, diamondY)
          .closePath()
          .stroke();

        doc.restore();
      };

      drawCorner(48, 48, 1, 1);
      drawCorner(pageWidth - 48, 48, -1, 1);
      drawCorner(48, pageHeight - 48, 1, -1);
      drawCorner(pageWidth - 48, pageHeight - 48, -1, -1);

      // --------------------------------------------------
      // DECORATIVE CENTER ORNAMENTS
      // --------------------------------------------------

      const drawCenterOrnament = (y) => {
        const centerX = pageWidth / 2;

        doc.lineWidth(1).strokeColor("#b08d57");

        doc
          .moveTo(centerX - 70, y)
          .lineTo(centerX - 20, y)
          .stroke();

        doc
          .moveTo(centerX + 20, y)
          .lineTo(centerX + 70, y)
          .stroke();

        doc
          .lineWidth(1.5)
          .moveTo(centerX, y - 8)
          .lineTo(centerX + 8, y)
          .lineTo(centerX, y + 8)
          .lineTo(centerX - 8, y)
          .closePath()
          .stroke();
      };

      drawCenterOrnament(52);
      drawCenterOrnament(pageHeight - 52);

      // --------------------------------------------------
      // LARGE TOP LOGOS
      // --------------------------------------------------

      const logoTop = 52;

      const logoWidth = 175;
      const logoHeight = 110;
      const logoGap = 50;

      const totalLogoWidth = logoWidth * 2 + logoGap;

      const logoStartX = (pageWidth - totalLogoWidth) / 2;

      if (fs.existsSync(rcvdLogo)) {
        doc.image(rcvdLogo, logoStartX, logoTop, {
          fit: [logoWidth, logoHeight],
          align: "center",
          valign: "center",
        });
      }

      if (fs.existsSync(cpdLogo)) {
        doc.image(cpdLogo, logoStartX + logoWidth + logoGap, logoTop, {
          fit: [logoWidth, logoHeight],
          align: "center",
          valign: "center",
        });
      }

      // --------------------------------------------------
      // MAIN TITLE
      // --------------------------------------------------

      doc
        .fillColor("#18436d")
        .font("Times-Bold")
        .fontSize(36)
        .text("CERTIFICATE OF COMPLETION", 0, 175, {
          width: pageWidth,
          align: "center",
          characterSpacing: 1.8,
        });

      // Elegant title divider
      doc
        .lineWidth(1.5)
        .strokeColor("#b08d57")
        .moveTo(pageWidth / 2 - 115, 219)
        .lineTo(pageWidth / 2 - 25, 219)
        .stroke();

      doc
        .lineWidth(2)
        .strokeColor("#18436d")
        .moveTo(pageWidth / 2 - 10, 219)
        .lineTo(pageWidth / 2 + 10, 219)
        .stroke();

      doc
        .lineWidth(1.5)
        .strokeColor("#b08d57")
        .moveTo(pageWidth / 2 + 25, 219)
        .lineTo(pageWidth / 2 + 115, 219)
        .stroke();

      // --------------------------------------------------
      // INTRODUCTION
      // --------------------------------------------------

      doc
        .fillColor("#555555")
        .font("Helvetica")
        .fontSize(12)
        .text("This is to certify that", 0, 233, {
          width: pageWidth,
          align: "center",
        });

      // --------------------------------------------------
      // LEARNER NAME
      // --------------------------------------------------

      doc
        .fillColor("#222222")
        .font("Times-Bold")
        .fontSize(28)
        .text(learnerName, 80, 256, {
          width: pageWidth - 160,
          align: "center",
        });

      // Professional title
      if (professionalTitle) {
        doc
          .fillColor("#18436d")
          .font("Helvetica-Oblique")
          .fontSize(11)
          .text(professionalTitle, 0, 293, {
            width: pageWidth,
            align: "center",
          });
      }

      // --------------------------------------------------
      // COURSE STATEMENT
      // --------------------------------------------------

      doc
        .fillColor("#555555")
        .font("Helvetica")
        .fontSize(11.5)
        .text("has successfully completed the course", 0, 317, {
          width: pageWidth,
          align: "center",
        });

      // --------------------------------------------------
      // COURSE TITLE
      // --------------------------------------------------

      doc
        .fillColor("#18436d")
        .font("Times-Bold")
        .fontSize(19)
        .text(courseTitle, 100, 339, {
          width: pageWidth - 200,
          align: "center",
        });

      // --------------------------------------------------
      // CREDITS + DURATION
      // --------------------------------------------------

      doc
        .fillColor("#555555")
        .font("Helvetica")
        .fontSize(10.5)
        .text(
          `Credits: ${credits} CPD  •  Duration: ${durationHours} Hours`,
          0,
          369,
          {
            width: pageWidth,
            align: "center",
          },
        );

      // --------------------------------------------------
      // CERTIFICATE INFORMATION
      // --------------------------------------------------

      const detailsY = 398;

      // QR CODE — LEFT OF CERTIFICATE NUMBER

      const qrSize = 62;
      const qrX = 78;
      const qrY = detailsY - 13;

      doc.image(qrBuffer, qrX, qrY, {
        fit: [qrSize, qrSize],
      });

      doc
        .fillColor("#777777")
        .font("Helvetica")
        .fontSize(6.5)
        .text("Scan to verify", qrX - 2, qrY + qrSize + 2, {
          width: qrSize + 4,
          align: "center",
        });

      // Certificate number

      doc
        .fillColor("#555555")
        .font("Helvetica")
        .fontSize(9)
        .text(`Certificate No: ${certificateNumber}`, 155, detailsY, {
          width: 260,
          align: "left",
        });

      // Date of issue

      doc.text(`Date of Issue: ${issuedDate}`, pageWidth - 380, detailsY, {
        width: 260,
        align: "right",
      });

      // --------------------------------------------------
      // SIGNATURES
      // --------------------------------------------------

      const signatureY = pageHeight - 82;

      const leftSignatureX = 110;
      const rightSignatureX = pageWidth - 335;

      // Provider signature — larger

      if (fs.existsSync(providerSignature)) {
        doc.image(providerSignature, leftSignatureX, signatureY - 72, {
          fit: [225, 70],
          align: "center",
          valign: "center",
        });
      }

      // Chairman signature — larger

      if (fs.existsSync(chairmanSignature)) {
        doc.image(chairmanSignature, rightSignatureX, signatureY - 72, {
          fit: [225, 70],
          align: "center",
          valign: "center",
        });
      }

      // Signature lines

      doc
        .moveTo(leftSignatureX, signatureY)
        .lineTo(leftSignatureX + 225, signatureY)
        .lineWidth(0.8)
        .strokeColor("#555555")
        .stroke();

      doc
        .moveTo(rightSignatureX, signatureY)
        .lineTo(rightSignatureX + 225, signatureY)
        .lineWidth(0.8)
        .strokeColor("#555555")
        .stroke();

      // Provider title

      doc
        .fillColor("#333333")
        .font("Helvetica-Bold")
        .fontSize(8.5)
        .text("CPD Service Provider", leftSignatureX, signatureY + 6, {
          width: 225,
          align: "center",
        });

      // Instructor name

      doc
        .font("Helvetica")
        .fontSize(8)
        .text(instructorName || "", leftSignatureX, signatureY + 19, {
          width: 225,
          align: "center",
        });

      // Chairman title

      doc
        .font("Helvetica-Bold")
        .fontSize(8.5)
        .text("RCVD Chairman", rightSignatureX, signatureY + 6, {
          width: 225,
          align: "center",
        });

      // Chairman name

      doc
        .font("Helvetica")
        .fontSize(8)
        .text("Charles KAYUMBA", rightSignatureX, signatureY + 19, {
          width: 225,
          align: "center",
        });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

export default generateCertificate;
