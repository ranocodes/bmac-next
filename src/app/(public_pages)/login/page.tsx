import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your BMAC member account.',
  alternates: { canonical: "login" },
};


export const dynamic = "force-dynamic";

export default function LoginPage() {
  return <LoginForm />;
}
