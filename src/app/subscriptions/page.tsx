import Container from "@/components/global/container";
import Wrapper from "@/components/global/wrapper";
import { SubscribeButton } from "@/components/subscriptions/SubscribeButton";
import { getCurrentUser } from "@/lib/auth";
import { getSubscriptionPlans, getSubscriptionsForEmail } from "@/lib/catalog";

export default async function SubscriptionsPage() {
  const user = await getCurrentUser();
  const [plans, active] = await Promise.all([
    getSubscriptionPlans(),
    user ? getSubscriptionsForEmail(user.email) : Promise.resolve([]),
  ]);
  const activeIds = new Set(active.map((subscription) => subscription.planId));

  return (
    <Wrapper className="py-10 sm:py-14">
      <Container className="space-y-8">
        <header className="max-w-2xl space-y-2">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Subscriptions</h1>
          <p className="text-sm text-muted-foreground">
            Artist and producer memberships on Velta. Beat leases stay separate from the monthly plan.
          </p>
        </header>
        <div className="grid gap-4 md:grid-cols-2">
          {plans.map((plan) => (
            <article key={plan.id} className="rounded-xl border border-white/[0.08] bg-zinc-900/50 p-6">
              <p className="text-xs font-medium uppercase tracking-wide text-sky-400">{plan.audience}</p>
              <h2 className="mt-2 text-2xl font-semibold">{plan.name}</h2>
              <p className="mt-2 text-3xl font-semibold tabular-nums">
                ${plan.price}
                <span className="text-base font-normal text-muted-foreground"> / month</span>
              </p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {plan.perks.map((perk) => (
                  <li key={perk}>{perk}</li>
                ))}
              </ul>
              <div className="mt-6">
                <SubscribeButton planId={plan.id} signedIn={Boolean(user)} active={activeIds.has(plan.id)} />
              </div>
            </article>
          ))}
        </div>
      </Container>
    </Wrapper>
  );
}
