import { Toaster as Sonner } from "sonner";
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from "lucide-react";

const Toaster = ({
  ...props
}) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      richColors
      position="top-right"
      style={{
        "--normal-bg": "#ffffff",
        "--normal-text": "#111827",
        "--normal-border": "#e5e7eb",
        "--border-radius": "12px",
      }}
      toastOptions={{
        classNames: {
          toast: "!border !border-gray-200 !shadow-none",
          title: "!text-sm !font-medium",
          description: "!text-sm !text-gray-500",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
