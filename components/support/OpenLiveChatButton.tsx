"use client";

import type { ComponentProps, ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Headset } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { useSupportChat } from "./SupportChatContext";

type ButtonProps = ComponentProps<typeof Button>;

export function OpenLiveChatButton({
  className,
  children,
  ...props
}: Omit<ButtonProps, "onClick" | "type"> & {
  children?: ReactNode;
}) {
  const { openLiveChat } = useSupportChat();
  const t = useTranslations("support");

  return (
    <Button
      type="button"
      className={cn(className)}
      onClick={openLiveChat}
      {...props}
    >
      {children ?? (
        <>
          <Headset className="h-4 w-4" />
          {t("cta")}
        </>
      )}
    </Button>
  );
}
