import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 rounded-full font-mono text-[10.5px] whitespace-nowrap transition-all",
  {
    variants: {
      variant: {
        default:   "bg-canvas text-ink-3 px-[7px] py-[3px]",
        secondary: "bg-canvas text-ink-3 px-[7px] py-[3px]",
        outline:   "border border-line text-ink-3 px-[7px] py-[3px]",
        pill:      "bg-canvas text-ink-3 px-[7px] py-0.5 text-[10px] letter-spacing-[0.02em]",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"
  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
