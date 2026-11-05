import { MarketplaceExplore } from "@/components/marketplace/MarketplaceExplore";
import { PRODUCT_KINDS, type MarketplaceKind } from "@/lib/product-kinds";
import Wrapper from "@/components/global/wrapper";
import { getAllBeats, getUserById } from "@/lib/catalog";

type ExplorePageProps = {
  searchParams: Promise<{ genre?: string; seller?: string; kind?: string }>;
};

function kindFromQuery(value: string | undefined): MarketplaceKind {
  const match = PRODUCT_KINDS.find((kind) => kind.id === value);
  return match?.id ?? "all";
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const query = await searchParams;
  const genreFilter = typeof query.genre === "string" ? query.genre : undefined;
  const sellerId = typeof query.seller === "string" ? query.seller : undefined;
  const kind = kindFromQuery(typeof query.kind === "string" ? query.kind : undefined);
  const kindLabel = PRODUCT_KINDS.find((item) => item.id === kind)?.label;
  const seller = sellerId ? await getUserById(sellerId) : undefined;
  const beats = (await getAllBeats()).filter((beat) => !sellerId || beat.sellerId === sellerId);
  const title = seller
    ? `Beats by ${seller.name}`
    : kind !== "all" && kindLabel
      ? kindLabel
      : genreFilter
        ? `${genreFilter} beats`
        : "Explore beats";

  return (
    <Wrapper className="py-8 sm:py-10 md:py-12">
      <header className="mb-8 max-w-3xl space-y-2">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground md:text-base">
          Browse instrumentals, preview stems, and license instantly through Whop checkout.
        </p>
      </header>

      <MarketplaceExplore beats={beats} initialGenre={genreFilter} initialKind={kind} />
    </Wrapper>
  );
}
