import type { LicenseTier } from "@/types";

export type TierGrant = {
  label: string;
  exclusive: boolean;
  fileFormat: string;
  streamCap: string;
  videoCap: string;
  distribution: string;
};

export const TIER_GRANTS: Record<LicenseTier, TierGrant> = {
  mp3: {
    label: "MP3 Lease",
    exclusive: false,
    fileFormat: "Tagged MP3",
    streamCap: "50,000 audio streams",
    videoCap: "1 music video",
    distribution: "Non-exclusive. Velta may license this beat to other buyers.",
  },
  wav: {
    label: "WAV Lease",
    exclusive: false,
    fileFormat: "Untagged WAV",
    streamCap: "150,000 audio streams",
    videoCap: "2 music videos",
    distribution: "Non-exclusive. Velta may license this beat to other buyers.",
  },
  exclusive: {
    label: "Exclusive",
    exclusive: true,
    fileFormat: "Untagged WAV and MP3",
    streamCap: "Unlimited audio streams",
    videoCap: "Unlimited music videos",
    distribution:
      "Exclusive. This beat is removed from the Velta store and will not be licensed to anyone else.",
  },
};

export function buildLicenseTerms(input: {
  number: string;
  licenseeName: string;
  licenseeEmail: string;
  licensorName: string;
  beatTitle: string;
  tier: LicenseTier;
  price: number;
  issuedAt: string;
}) {
  const grant = TIER_GRANTS[input.tier];
  const issued = new Date(input.issuedAt).toUTCString();

  return [
    `License ${input.number}`,
    `This license is issued by ${input.licensorName} ("Licensor") to ${input.licenseeName} (${input.licenseeEmail}) ("Licensee") for the beat "${input.beatTitle}".`,
    `Grant. Licensee receives a ${grant.exclusive ? "exclusive" : "non-exclusive"}, worldwide license to use the beat in one new musical composition that includes Licensee's own vocals or other original material. Delivered file: ${grant.fileFormat}. Stream cap: ${grant.streamCap}. Video cap: ${grant.videoCap}. ${grant.distribution}`,
    `Price. The license fee is USD ${input.price.toFixed(2)}, paid through the checkout shown on the receipt.`,
    `Restrictions. Licensee may not resell, lease, or upload the beat as a beat; redistribute the instrumental by itself; claim to have produced the beat; or register the beat alone in a way that claims the Licensor's composition. Use beyond the caps above needs a new license.`,
    `Ownership. This is a license, not a sale of the copyright. The Licensor keeps ownership of the composition and master except for the rights expressly granted here. An exclusive license removes the beat from sale on Velta. It is not a separate songwriter or publishing assignment.`,
    `Term. This license starts on ${issued} and continues for the rights granted above. Exclusive licenses are perpetual for those rights. Velta may revoke a license for fraud, chargeback, or non-payment.`,
    `Issued ${issued} on prodvince.com.`,
  ].join("\n\n");
}

export function buildReceiptText(input: {
  number: string;
  licenseNumber: string;
  licenseeName: string;
  licenseeEmail: string;
  sellerName: string;
  beatTitle: string;
  tierLabel: string;
  amount: number;
  paymentRef: string;
  issuedAt: string;
}) {
  const issued = new Date(input.issuedAt).toUTCString();
  return [
    `Receipt ${input.number}`,
    `Date: ${issued}`,
    `Status: Paid`,
    `Billed to: ${input.licenseeName} <${input.licenseeEmail}>`,
    `Seller: ${input.sellerName}`,
    `Item: ${input.beatTitle} — ${input.tierLabel}`,
    `Amount: USD ${input.amount.toFixed(2)}`,
    `Payment reference: ${input.paymentRef}`,
    `License: ${input.licenseNumber}`,
    `This receipt confirms payment for the license named above. It is not the license. Keep both.`,
  ].join("\n");
}
