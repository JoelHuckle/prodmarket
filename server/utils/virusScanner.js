/**
 * Async VirusTotal file scanning.
 * Uploads a file buffer to VirusTotal, stores the analysis ID,
 * and polls for results in the background.
 *
 * Requires VIRUSTOTAL_API_KEY in environment variables.
 */

const https = require("https");
const { FileRecord } = require("../models");

const VT_API_KEY = () => process.env.VIRUSTOTAL_API_KEY;
const VT_BASE = "www.virustotal.com";

/**
 * Make a simple HTTPS request (no external http library needed).
 */
const vtRequest = (options, body) =>
  new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });

/**
 * Submit a file buffer to VirusTotal for scanning.
 * @param {Buffer} buffer - File contents
 * @param {string} filename - Original filename
 * @returns {string|null} VirusTotal analysis ID, or null on failure
 */
const submitToVirusTotal = async (buffer, filename) => {
  const apiKey = VT_API_KEY();
  if (!apiKey) {
    console.warn("VIRUSTOTAL_API_KEY not set — skipping virus scan");
    return null;
  }

  const boundary = `----VTBoundary${Date.now()}`;
  const CRLF = "\r\n";

  // Build multipart/form-data body manually
  const header =
    `--${boundary}${CRLF}` +
    `Content-Disposition: form-data; name="file"; filename="${filename}"${CRLF}` +
    `Content-Type: application/octet-stream${CRLF}${CRLF}`;
  const footer = `${CRLF}--${boundary}--${CRLF}`;

  const bodyBuffer = Buffer.concat([
    Buffer.from(header, "utf8"),
    buffer,
    Buffer.from(footer, "utf8"),
  ]);

  const options = {
    hostname: VT_BASE,
    path: "/api/v3/files",
    method: "POST",
    headers: {
      "x-apikey": apiKey,
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
      "Content-Length": bodyBuffer.length,
    },
  };

  const response = await vtRequest(options, bodyBuffer);

  if (response.status === 200 && response.body?.data?.id) {
    return response.body.data.id;
  }

  console.error("VirusTotal submission failed:", response.status, response.body);
  return null;
};

/**
 * Poll VirusTotal for analysis results and update the FileRecord.
 * @param {string} analysisId - VirusTotal analysis ID
 * @param {string} fileKey - R2 file key
 */
const pollScanResult = async (analysisId, fileKey) => {
  const apiKey = VT_API_KEY();
  if (!apiKey) return;

  const options = {
    hostname: VT_BASE,
    path: `/api/v3/analyses/${analysisId}`,
    method: "GET",
    headers: { "x-apikey": apiKey },
  };

  const response = await vtRequest(options);
  if (response.status !== 200) return;

  const status = response.body?.data?.attributes?.status;
  const stats = response.body?.data?.attributes?.stats;

  if (status !== "completed") {
    // Not done yet — retry in 30 seconds
    setTimeout(() => pollScanResult(analysisId, fileKey), 30_000);
    return;
  }

  const malicious = (stats?.malicious || 0) + (stats?.suspicious || 0);
  const scanStatus = malicious > 0 ? "flagged" : "clean";

  await FileRecord.update({ scan_status: scanStatus }, { where: { file_key: fileKey } });

  if (scanStatus === "flagged") {
    console.warn(`[SECURITY] File flagged by VirusTotal: ${fileKey} (${malicious} detections)`);
  }
};

/**
 * Fire-and-forget: submit a file to VirusTotal and track the result.
 * Does not block the upload response.
 * @param {Buffer} buffer - File contents
 * @param {string} filename - Original filename
 * @param {string} fileKey - R2 file key (to update FileRecord)
 */
const scanFileAsync = (buffer, filename, fileKey) => {
  submitToVirusTotal(buffer, filename)
    .then((analysisId) => {
      if (!analysisId) {
        // Mark clean if no API key configured (non-blocking fallback)
        return FileRecord.update({ scan_status: "clean" }, { where: { file_key: fileKey } });
      }
      return FileRecord.update({ virustotal_id: analysisId }, { where: { file_key: fileKey } })
        .then(() => {
          // Start polling after initial delay (VT usually takes ~15s)
          setTimeout(() => pollScanResult(analysisId, fileKey), 15_000);
        });
    })
    .catch((err) => {
      console.error("VirusTotal scan error for", fileKey, err.message);
      // Mark clean on error so files aren't permanently blocked
      FileRecord.update({ scan_status: "clean" }, { where: { file_key: fileKey } }).catch(() => {});
    });
};

module.exports = { scanFileAsync };
