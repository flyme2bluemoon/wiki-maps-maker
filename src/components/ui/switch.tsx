import * as React from "react"
import { Switch as SwitchPrimitive } from "radix-ui"
import { cn } from "@/lib/utils"

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer group/switch relative inline-flex shrink-0 items-center rounded-full border-2 transition-colors outline-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 h-[18px] w-[30px] data-[state=checked]:border-ink data-[state=checked]:bg-ink data-[state=unchecked]:border-line-2 data-[state=unchecked]:bg-line-2",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block rounded-full bg-paper shadow-sm ring-0 transition-transform h-[10px] w-[10px] data-[state=checked]:translate-x-[12px] data-[state=unchecked]:translate-x-0"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
