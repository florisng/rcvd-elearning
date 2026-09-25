import path from "path";
import { fileURLToPath } from "url";
import generateCertificate from "./src/utils/generateCertificate.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputPath = path.join(
  __dirname,
  "assets",
  "certificates",
  "test-certificate.pdf",
);

await generateCertificate({
  certificateNumber: "RCVD-2026-00001",
  learnerName: "Floris Ngendahayo",
  professionalTitle: "Veterinary Doctor",
  courseTitle: "Veterinary Continuing Professional Development",
  instructorName: "Guy Bertrand Nkurunziza",
  issuedDate: "23 September 2026",
  credits: 5,
  durationHours: 5,
  outputPath,
});

console.log("Certificate created successfully:");
console.log(outputPath);
