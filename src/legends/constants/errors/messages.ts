export const RETRY_OR_SUPPORT_MESSAGE =
  'Please try again, and if the issue persists, contact our support team.'

export const ERROR_MESSAGES = {
  transactionRejected: 'Transaction has been rejected!',
  messageSigningFailed: `Message signing failed. ${RETRY_OR_SUPPORT_MESSAGE}`,
  transactionSigningFailed: `Transaction signing failed. ${RETRY_OR_SUPPORT_MESSAGE}`,
  networkSwitchFailed: `Failed to switch network. ${RETRY_OR_SUPPORT_MESSAGE}`,
  transactionProcessingFailed: `Failed to process the transaction. ${RETRY_OR_SUPPORT_MESSAGE}`
}
