import { fulfillPurchase } from "../src/lib/fulfillment";

async function main() {
  const { sale, created } = await fulfillPurchase({
    userId: "user_demo_buyer",
    beatId: "beat_001",
    tier: "mp3",
    paymentRef: "preview_demo",
  });
  console.log(
    JSON.stringify({
      created,
      license: sale.licenseNumber,
      receipt: sale.receiptNumber,
    }),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
