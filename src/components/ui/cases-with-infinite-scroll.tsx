"use client";
import { Building2 } from "lucide-react";

interface PartnerLogo {
  id: string;
  name: string;
  logo?: string;
  url?: string;
}

function Case({ partners, hideHeading }: { partners?: PartnerLogo[]; hideHeading?: boolean }) {
  const items = partners || Array.from({ length: 15 });
  const doubled = [...items, ...items];

  return (
    <div className={`w-full ${hideHeading ? "" : "py-20 lg:py-40"}`}>
      <div className="container mx-auto">
        <div className="flex flex-col gap-6 md:gap-8">
          {!hideHeading && (
            <h2 className="text-xl md:text-3xl md:text-5xl tracking-tighter lg:max-w-xl font-regular text-left">
              Trusted by thousands of businesses worldwide
            </h2>
          )}
          <div className="overflow-hidden w-full">
            <div className="bmac-scroll-track flex">
              {doubled.map((item: PartnerLogo | number, index: number) => {
                if (typeof item === "number") {
                  return (
                    <div key={index} className="min-w-0 shrink-0 grow-0 basis-1/4 sm:basis-1/5 md:basis-1/8 lg:basis-1/10 pl-4">
                      <div className="flex rounded-md bg-muted items-center justify-center h-20 sm:h-24 md:h-28 px-3 md:px-6">
                        <span className="text-xs sm:text-sm">Logo {index + 1}</span>
                      </div>
                    </div>
                  );
                }
                const partner = item as PartnerLogo;
                return (
                  <div key={`${partner.id}-${index}`} className="min-w-0 shrink-0 grow-0 basis-1/4 sm:basis-1/5 md:basis-1/8 lg:basis-1/10 pl-4">
                    <div className="flex rounded-md bg-muted items-center justify-center h-20 sm:h-24 md:h-28 px-3 md:px-6 overflow-hidden">
                      {partner.logo && !partner.logo.includes("placeholder") ? (
                        <img src={partner.logo} alt={partner.name} className="w-full h-full object-contain" />
                      ) : (
                        <Building2 className="w-8 h-8 text-muted-foreground/40" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .bmac-scroll-track {
          animation: bmac-scroll 30s linear infinite;
          width: fit-content;
        }
        @keyframes bmac-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

export { Case };
