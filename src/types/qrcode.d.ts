declare module "qrcode" {
  interface QRCodeToDataURLOptions {
    width?: number;
    margin?: number;
    errorCorrectionLevel?: "L" | "M" | "Q" | "H";
    color?: { dark?: string; light?: string };
  }
  export function toDataURL(
    text: string,
    options?: QRCodeToDataURLOptions
  ): Promise<string>;
  export function toDataURL(
    text: string,
    callback: (err: Error | null, url: string) => void
  ): void;
  export function toDataURL(
    text: string,
    options: QRCodeToDataURLOptions,
    callback: (err: Error | null, url: string) => void
  ): void;
  const _default: {
    toDataURL: typeof toDataURL;
  };
  export default _default;
}
