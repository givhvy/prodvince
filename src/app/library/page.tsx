import { LibraryView } from "@/components/library/LibraryView";
import { getCurrentUser } from "@/lib/auth";
import { getAllBeats, getPurchasesForUser } from "@/lib/catalog";

export default async function LibraryPage() {
  const user = await getCurrentUser();
  const purchases = user ? getPurchasesForUser(user.id) : [];

  return <LibraryView user={user} purchases={purchases} beats={getAllBeats()} />;
}
