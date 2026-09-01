import whopConfig from "@/data/whop-config.json";
import type { Beat, LicenseTier } from "@/types";

export function getWhopPlanId(beatId: string, tier: LicenseTier): string | null {
  const plans = whopConfig.plans as Record<string, Partial<Record<LicenseTier, string>>>;
  return plans[beatId]?.[tier] ?? null;
}

export function hydrateBeatWhopPlans(beat: Beat): Beat {
  return {
    ...beat,
    licenses: beat.licenses.map((license) => ({
      ...license,
      whopPlanId: getWhopPlanId(beat.id, license.tier) ?? license.whopPlanId,
    })),
  };
}

export function getWhopProductId() {
  return whopConfig.productId;
}

export function getWhopAccountIdFromConfig() {
  return whopConfig.accountId;
}
