"use client";

import { useState } from "react";
import Link from "next/link";

interface ConsentCheckboxProps {
  privacy?: boolean;
  marketing?: boolean;
  onChange?: (value: { privacy: boolean; marketing: boolean }) => void;
  showMarketing?: boolean;
  consentId?: string;
  dark?: boolean;
}

export default function ConsentCheckbox({
  privacy: privacyProp,
  marketing: marketingProp,
  onChange,
  showMarketing = true,
  consentId = "consent",
  dark = false,
}: ConsentCheckboxProps) {
  const controlled = privacyProp !== undefined;
  const [internal, setInternal] = useState({ privacy: false, marketing: false });
  const privacy = controlled ? Boolean(privacyProp) : internal.privacy;
  const marketing =
    (controlled ? marketingProp : internal.marketing) || false;

  const toggle = (field: "privacy" | "marketing") => {
    const next = { ...(controlled ? { privacy, marketing } : internal), [field]: !(controlled ? (field === "privacy" ? privacy : marketing) : internal[field]) };
    if (controlled) {
      onChange?.({ privacy: next.privacy, marketing: next.marketing });
    } else {
      setInternal(next);
      onChange?.(next);
    }
  };

  const labelClass = dark
    ? "text-xs text-white/70 leading-relaxed cursor-pointer"
    : "text-xs text-muted-foreground leading-relaxed cursor-pointer";

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3 group">
        <input
          id={`${consentId}-privacy`}
          type="checkbox"
          required
          checked={privacy}
          onChange={() => toggle("privacy")}
          className="mt-1 w-4 h-4 accent-primary shrink-0"
        />
        <label
          htmlFor={`${consentId}-privacy`}
          className={labelClass}
        >
          I agree to the{" "}
          <Link
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className={`${dark ? "text-accent" : "text-primary"} font-semibold underline underline-offset-2 hover:opacity-80`}
          >
            Privacy Policy
          </Link>{" "}
          and consent to BMAC processing my information to respond to this
          request.
        </label>
        <input type="hidden" name="privacy" value={privacy ? "on" : ""} />
      </div>

      {showMarketing && (
        <div className="flex items-start gap-3 group">
          <input
            id={`${consentId}-marketing`}
            type="checkbox"
            checked={marketing}
            onChange={() => toggle("marketing")}
            className="mt-1 w-4 h-4 accent-primary shrink-0"
          />
          <label
            htmlFor={`${consentId}-marketing`}
            className={labelClass}
          >
            I&apos;d like to receive news, updates, and opportunities from BMAC.
            (Optional)
          </label>
          <input type="hidden" name="marketing" value={marketing ? "on" : ""} />
        </div>
      )}
    </div>
  );
}
