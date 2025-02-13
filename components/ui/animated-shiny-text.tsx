import { ComponentPropsWithoutRef, CSSProperties, FC } from "react";

import { cn } from "@/lib/utils";

export interface AnimatedShinyTextProps
  extends ComponentPropsWithoutRef<"span"> {
  shimmerWidth?: number;
}

export const AnimatedShinyText: FC<AnimatedShinyTextProps> = ({
  children,
  className,
  shimmerWidth = 200,
  ...props
}) => {
  return (
    <span
      style={
        {
          "--shiny-width": `${shimmerWidth}px`,
        } as CSSProperties
      }
      className={cn(
        "inline-flex text-white relative",
        "animate-shiny-text [background-size:200%_auto] bg-clip-text text-transparent",
        "bg-gradient-to-r from-white via-white/25 to-white",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
