import { SignupForm } from "@/components/auth/SignupForm";
import { AlreadySignedIn } from "@/components/auth/AlreadySignedIn";
import AuthSection from "@/components/ui/auth-section-2";
import { getCurrentUser } from "@/lib/auth";

type SignupPageProps = PageProps<"/signup">;

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const user = await getCurrentUser();
  const query = await searchParams;
  const redirectTo =
    typeof query.redirect === "string" && query.redirect.startsWith("/")
      ? query.redirect
      : "/studio";

  return (
    <AuthSection>
      {user ? (
        <AlreadySignedIn user={user} redirectTo={redirectTo} />
      ) : (
        <SignupForm redirectTo={redirectTo} />
      )}
    </AuthSection>
  );
}
