import * as React from "react"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "w-full rounded-[7px] border border-line bg-canvas px-[10px] py-2 font-sans text-[13px] text-ink outline-none transition-[border-color,background-color] placeholder:text-ink-3 focus-visible:border-accent focus-visible:bg-paper focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
