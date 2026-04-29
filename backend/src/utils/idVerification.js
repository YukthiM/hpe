/**
 * DigiLocker / Government ID Verification Simulation
 *
 * In production, this would integrate with:
 * - DigiLocker API (India): https://digilocker.gov.in/
 * - Aadhaar eKYC
 * - Signzy / CKYC APIs
 *
 * For this simulation, we:
 * 1. Accept document upload
 * 2. Return "pending" status immediately
 * 3. Auto-approve after simulated delay (configurable)
 * 4. Flag certain test IDs as rejected
 */

const simulateIDVerification = async (documentUrl, documentType = 'aadhar') => {
  // Simulate API processing delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Simulate rejection for test patterns (e.g., document URL contains "invalid")
  if (documentUrl && documentUrl.includes('invalid')) {
    return {
      status: 'rejected',
      reason: 'Document could not be verified. Please upload a clear, unobstructed copy.',
      verifiedAt: null,
    };
  }

  // In real integration: call DigiLocker API here
  // const response = await axios.post('https://api.digilocker.gov.in/verify', {...});

  // Simulate successful submission → mark as pending
  return {
    status: 'pending',
    reason: null,
    estimatedVerificationTime: '2-4 hours',
    submittedAt: new Date().toISOString(),
    message: 'Document submitted successfully. Verification is in progress.',
  };
};

/**
 * Simulate auto-approval (would be triggered by webhook in production)
 * Call this to mock the webhook callback from ID verification service
 */
const mockApproveVerification = async (User, userId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      idVerified: true,
      idVerificationStatus: 'verified',
    },
    { new: true }
  );
  return user;
};

module.exports = { simulateIDVerification, mockApproveVerification };
