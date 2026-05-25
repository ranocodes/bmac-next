import React from "react";
import * as LucideIcons from "lucide-react";

export const getIcon = (name: string, props: any = {}) => {
  const IconComponent = (LucideIcons as any)[name];
  return IconComponent ? React.createElement(IconComponent, props) : null;
};
