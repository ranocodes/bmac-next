import { vi } from "vitest";

vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: any) => {
    const NextImage = "img";
    return <NextImage src={src} alt={alt} {...props} />;
  },
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => {
    const Link = "a";
    return <Link href={href} {...props}>{children}</Link>;
  },
}));

const mockUsePathname = vi.fn().mockReturnValue("/");
vi.mock("next/navigation", () => ({
  usePathname: (...args: any[]) => mockUsePathname(...args),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}));

export { mockUsePathname };

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
    h3: ({ children, ...props }: any) => <h3 {...props}>{children}</h3>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));
