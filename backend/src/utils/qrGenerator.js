const QRCode = require('qrcode');

/**
 * Generates a QR code data URL pointing to the review page for a given token.
 * @param {string} qrToken - UUID token for the job
 * @param {string} baseUrl - Frontend base URL (e.g., http://localhost:5173)
 * @returns {Promise<string>} Base64 data URL of the QR image
 */
const generateQRCode = async (qrToken, baseUrl = process.env.CLIENT_URL || 'http://localhost:5173') => {
  const reviewUrl = `${baseUrl}/review/${qrToken}`;
  try {
    const dataUrl = await QRCode.toDataURL(reviewUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 2,
      color: {
        dark: '#1a1a2e',
        light: '#ffffff',
      },
    });
    return { dataUrl, reviewUrl };
  } catch (err) {
    throw new Error(`QR generation failed: ${err.message}`);
  }
};

module.exports = { generateQRCode };
