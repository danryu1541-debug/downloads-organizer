export function mapDonationEvent(message) {
  return {
    supporterName: message.donatorNickname || "익명",
    amount: Number(message.payAmount || 0),
    message: message.donationText || "",
    raw: message
  };
}
