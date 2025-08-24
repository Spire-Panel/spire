import { cn } from "@/lib/utils";

interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl";
  fullScreen?: boolean;
  text?: string;
}

export function Loading({
  className,
  size = "md",
  fullScreen = false,
  text,
  ...props
}: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-[3px]",
    xl: "h-16 w-16 border-[3px]",
  };

  const containerClasses = cn(
    "flex items-center justify-center",
    fullScreen ? "h-screen w-screen" : "w-full h-full",
    className
  );

  const spinnerClasses = cn(
    "animate-spin rounded-full border-gray-300 border-t-primary",
    sizeClasses[size],
    fullScreen ? "fixed" : ""
  );

  return (
    <div className={containerClasses} {...props}>
      <div className="flex flex-col items-center gap-4">
        <div className={spinnerClasses}>
          <span className="sr-only">Loading...</span>
        </div>
        {text && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{text}</p>
        )}
      </div>
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <Loading size="xl" />
    </div>
  );
}
