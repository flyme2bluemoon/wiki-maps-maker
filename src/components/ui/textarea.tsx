import * as React from "react"
import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "w-full resize-y rounded-[7px] border border-line bg-canvas px-[10px] py-2 font-sans text-[13px] text-ink leading-[1.45] outline-none transition-[border-color,background-color] placeholder:text-ink-3 focus-visible:border-accent focus-visible:bg-paper focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 min-h-16",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
