import { LibraryView } from "@/components/library/LibraryView";
import { getCurrentUser } from "@/lib/auth";
import { getBeatById } from "@/lib/catalog";
import { listSalesForUser } from "@/lib/fulfillment";

export default async function LibraryPage() {
  const user = await getCurrentUser();
  const sales = user ? await listSalesForUser(user.id) : [];
  const beats = (
    await Promise.all(sales.map((sale) => getBeatById(sale.beatId)))
  ).filter((beat) => beat !== undefined);

  return <LibraryView user={user} sales={sales} beats={beats} />;
}
