export const ADMIN_FORM_TYPES = ["partner", "volunteer", "member"] as const;
export type AdminFormType = (typeof ADMIN_FORM_TYPES)[number];

export const FORM_TYPE_ALIASES: Record<string, string> = {
  membership: "member",
};
