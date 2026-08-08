/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi } from "vitest";

vi.mock("next/image", () => ({
  default: (props: any) => {
    const { src, alt, fill, priority, ...rest } = props;
    void fill;
    void priority;
    const NextImage = "img";
    return <NextImage src={src} alt={alt} {...rest} />;
  },
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => {
    const Link = "a";
    return <Link href={href} {...props}>{children}</Link>;
  },
}));

const mockUsePathname = vi.fn().mockReturnValue("/");
const mockUseRouter = vi.fn((...args: any[]) => { void args; return { push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }; });
const mockRedirect = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: (...args: any[]) => mockUsePathname(...args),
  useRouter: (...args: any[]) => mockUseRouter(...args),
  redirect: (...args: any[]) => mockRedirect(...args),
}));

export { mockUsePathname, mockUseRouter, mockRedirect };

const motionOnlyProps = [
  "animate", "whileHover", "whileTap", "whileInView", "whileFocus", "whileDrag",
  "initial", "transition", "variants", "viewport", "exit", "layout", "layoutId",
];

function domProps(props: any) {
  const rest = { ...props };
  motionOnlyProps.forEach((p) => delete rest[p]);
  return rest;
}

const motionTag = (Tag: string) => {
  const Comp = ({ children, ...props }: any) => {
    const El = Tag as any;
    return <El {...domProps(props)}>{children}</El>;
  };
  Comp.displayName = `motion.${Tag}`;
  return Comp;
};

vi.mock("framer-motion", () => ({
  motion: {
    div: motionTag("div"),
    section: motionTag("section"),
    span: motionTag("span"),
    p: motionTag("p"),
    h2: motionTag("h2"),
    h3: motionTag("h3"),
    button: motionTag("button"),
    img: motionTag("img"),
    a: motionTag("a"),
    ul: motionTag("ul"),
    li: motionTag("li"),
    circle: motionTag("circle"),
    g: motionTag("g"),
    path: motionTag("path"),
    rect: motionTag("rect"),
    text: motionTag("text"),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));
