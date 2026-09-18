import { AuthForm } from "@/components/auth/AuthForm";
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const nextPath = next === "/dashboard" ? "/dashboard" : "/studio";
  return <AuthForm mode="login" nextPath={nextPath}/>;
}
