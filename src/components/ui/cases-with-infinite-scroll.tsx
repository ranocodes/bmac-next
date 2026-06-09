"use client";

import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

interface PartnerLogo {
  id: string;
  name: string;
  logo?: string;
  url?: string;
}

function Case({ partners, hideHeading }: { partners?: PartnerLogo[]; hideHeading?: boolean }) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    const timer = setTimeout(() => {
      if (api.selectedScrollSnap() + 1 === api.scrollSnapList().length) {
        setCurrent(0);
        api.scrollTo(0);
      } else {
        api.scrollNext();
        setCurrent(current + 1);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [api, current]);

  const items = partners || Array.from({ length: 15 });

  return (
    <div className={`w-full ${hideHeading ? "" : "py-20 lg:py-40"}`}>
      <div className="container mx-auto">
        <div className="flex flex-col gap-6 md:gap-8">
          {!hideHeading && (
            <h2 className="text-xl md:text-3xl md:text-5xl tracking-tighter lg:max-w-xl font-regular text-left">
              Trusted by thousands of businesses worldwide
            </h2>
          )}
          <Carousel setApi={setApi} className="w-full">
            <CarouselContent>
              {items.map((item: PartnerLogo | number, index: number) => {
                if (typeof item === "number") {
                  return (
                    <CarouselItem className="basis-1/2 md:basis-1/4 lg:basis-1/6" key={index}>
                      <div className="flex rounded-md aspect-square bg-muted items-center justify-center p-6">
                        <span className="text-sm">Logo {index + 1}</span>
                      </div>
                    </CarouselItem>
                  );
                }
                const partner = item as PartnerLogo;
                return (
                  <CarouselItem className="basis-1/2 md:basis-1/4 lg:basis-1/6" key={partner.id}>
                    <div className="flex rounded-md aspect-square bg-muted items-center justify-center p-6 overflow-hidden">
                      {partner.logo && !partner.logo.includes("placeholder") ? (
                        <img src={partner.logo} alt={partner.name} className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-sm font-medium text-center leading-tight">{partner.name}</span>
                      )}
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </div>
  );
};

export { Case };
