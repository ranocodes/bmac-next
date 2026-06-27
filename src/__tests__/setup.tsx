import "@testing-library/jest-dom/vitest";

import { vi } from "vitest";

vi.mock("@clerk/nextjs", () => ({
  ClerkProvider: ({ children }: any) => <>{children}</>,
  useAuth: () => ({ isSignedIn: false, userId: null, getToken: () => null }),
  useUser: () => ({ isLoaded: true, user: null }),
  useClerk: () => ({ client: { signUp: { create: () => {} }, signIn: { create: () => {} } }, setActive: () => {} }),
  SignInButton: ({ children }: any) => <button>{children || "Sign In"}</button>,
  SignUpButton: ({ children }: any) => <button>{children || "Sign Up"}</button>,
  SignOutButton: ({ children }: any) => <button>{children || "Sign Out"}</button>,
  Show: ({ children }: any) => <>{children}</>,
  UserButton: () => <button>User</button>,
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth: () => ({ userId: "test-user", protect: () => {} }),
  clerkMiddleware: () => {},
  currentUser: () => null,
  createRouteMatcher: () => () => false,
}));

vi.mock("@clerk/ui", () => ({
  ui: {},
}));

vi.mock("@clerk/ui/themes", () => ({
  shadcn: {},
  dark: {},
  neobrutalism: {},
}));
