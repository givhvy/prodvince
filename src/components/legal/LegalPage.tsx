import Wrapper from "@/components/global/wrapper";
import type { LegalSection } from "@/lib/legal-documents";
import { LEGAL_UPDATED } from "@/lib/legal-documents";
import type { Metadata } from "next";
import Link from "next/link";

type Props = {
  title: string;
  intro: string;
  sections: readonly LegalSection[];
  otherHref: string;
  otherLabel: string;
};

export function legalMetadata(title: string, description: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: `https://prodvince.com/${title.toLowerCase().includes("privacy") ? "privacy" : "terms"}` },
  };
}

export function LegalPage({ title, intro, sections, otherHref, otherLabel }: Props) {
  return (
    <Wrapper className="py-12 sm:py-16">
      <article className="mx-auto max-w-3xl">
        <p className="text-sm text-muted-foreground">
          <Link href={otherHref} className="hover:text-foreground">
            {otherLabel}
          </Link>
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated {LEGAL_UPDATED} · Velta / prodvince.com</p>
        <p className="mt-8 text-base leading-7 text-muted-foreground">{intro}</p>
        <div className="mt-10 space-y-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-lg font-medium text-foreground">{section.title}</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">{section.body}</p>
            </section>
          ))}
        </div>
        <p className="mt-12 text-sm text-muted-foreground">
          Contact{" "}
          <a className="text-foreground underline-offset-4 hover:underline" href="mailto:privacy@prodvince.com">
            privacy@prodvince.com
          </a>{" "}
          ·{" "}
          <a className="text-foreground underline-offset-4 hover:underline" href="mailto:support@prodvince.com">
            support@prodvince.com
          </a>
        </p>
      </article>
    </Wrapper>
  );
}
