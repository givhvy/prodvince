import { LegalPage, legalMetadata } from "@/components/legal/LegalPage";
import { TERMS } from "@/lib/legal-documents";

export const metadata = legalMetadata(
  "Terms of Service",
  "Terms for licensing beats on Velta and prodvince.com, including payments, playlists, and acceptable use.",
);

export default function TermsRoute() {
  return (
    <LegalPage
      title={TERMS.title}
      intro={TERMS.intro}
      sections={TERMS.sections}
      otherHref="/privacy"
      otherLabel="Privacy Policy"
    />
  );
}
