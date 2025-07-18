import { cn } from "@/lib/utils"

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "w-4 h-4 border-2",
  md: "w-8 h-8 border-3",
  lg: "w-12 h-12 border-4"
};

export function Spinner({ size = "md", className, ...props }: SpinnerProps) {
  return (
    <div 
      className={cn(
        "spinner inline-block",
        sizeClasses[size],
        className
      )} 
      {...props}
    />
  );
}