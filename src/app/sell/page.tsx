import Link from "next/link";
import { ArrowRight, CreditCard, Mail, Upload } from "lucide-react";
import Container from "@/components/global/container";
import Wrapper from "@/components/global/wrapper";
import { SellerStudioSignInButton } from "@/components/auth/DemoSignInButtons";
import { Button } from "@/components/ui/button";
import { MagicCard } from "@/components/ui/magic-card";

const steps = [
  {
    title: "Upload & tag beats",
    description: "WAV/MP3 previews, BPM, key, genres, and license tiers.",
    icon: Upload,
  },
  {
    title: "Connect Whop checkout",
    description: "Live MP3, WAV, and exclusive plans with instant delivery.",
    icon: CreditCard,
  },
  {
    title: "Email your buyers",
    description: "Campaigns to followers and past customers from Studio.",
    icon: Mail,
  },
] as const;

export default function SellPage() {
  return (
    <Wrapper className="py-10 sm:py-14 md:py-16">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-heading text-3xl font-medium md:text-5xl">
            Start selling <span className="font-subheading italic">beats</span>
          </h1>
          <p className="mt-4 text-sm text-muted-foreground sm:text-base">
            Open Studio to upload tracks, set license tiers, connect Whop payouts, and email your
            audience, all in one BeatStars-style workflow.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <SellerStudioSignInButton />
            <Link href="/login?redirect=/studio">
              <Button size="lg" variant="secondary">
                Sign in with email
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="secondary">
                View pricing
              </Button>
            </Link>
          </div>
        </div>
      </Container>

      <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-4 px-4 sm:grid-cols-3 sm:px-6">
        {steps.map((step) => (
          <MagicCard
            key={step.title}
            gradientFrom="#38bdf8"
            gradientTo="#3b82f6"
            gradientColor="rgba(59,130,246,0.1)"
            className="rounded-2xl p-5 lg:rounded-3xl"
          >
            <step.icon className="size-5 text-blue-400" />
            <h2 className="mt-4 text-lg font-semibold">{step.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
          </MagicCard>
        ))}
      </div>
    </Wrapper>
  );
}
