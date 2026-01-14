import * as React from "react";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingButtonProps extends React.ComponentProps<typeof Button> {
  loading: boolean;
}

export function LoadingButton({
  loading,
  disabled,
  children,
  ...props
}: LoadingButtonProps) {
  return (
    <Button disabled={loading || disabled} {...props}  className={cn(
        loading || disabled
          ? "cursor-not-allowed"
          : "cursor-pointer"
      )}>
      {loading ? <Loader2 className="animate-spin" /> : children}
    </Button>
  );
}