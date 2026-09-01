import { AlreadySignedIn } from "@/components/auth/AlreadySignedIn";
import { LoginForm } from "@/components/auth/LoginForm";
import AuthSection from "@/components/ui/auth-section-2";
import { getCurrentUser } from "@/lib/auth";

type LoginPageProps = PageProps<"/login">;

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getCurrentUser();
  const query = await searchParams;
  const redirectTo =
    typeof query.redirect === "string" && query.redirect.startsWith("/")
      ? query.redirect
      : "/explore";

  return (
    <AuthSection>
      {user ? (
        <AlreadySignedIn user={user} redirectTo={redirectTo} />
      ) : (
        <LoginForm redirectTo={redirectTo} />
      )}
    </AuthSection>
  );
}
