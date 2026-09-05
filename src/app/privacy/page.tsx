import { LegalPage, legalMetadata } from "@/components/legal/LegalPage";
import { PRIVACY } from "@/lib/legal-documents";

export const metadata = legalMetadata(
  "Privacy Policy",
  "How Velta and prodvince.com collect, use, and share data in the beat marketplace iOS app and website.",
);

export default function PrivacyRoute() {
  return (
    <LegalPage
      title={PRIVACY.title}
      intro={PRIVACY.intro}
      sections={PRIVACY.sections}
      otherHref="/terms"
      otherLabel="Terms of Service"
    />
  );
}
