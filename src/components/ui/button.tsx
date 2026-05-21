import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-[8px] border font-medium text-[13px] whitespace-nowrap transition-all cursor-pointer disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-ink text-paper border-ink hover:bg-[oklch(0.30_0.02_240)] hover:border-[oklch(0.30_0.02_240)]",
        outline:
          "bg-paper text-ink border-line hover:bg-canvas hover:border-line-2",
        ghost:
          "bg-transparent text-ink-2 border-line hover:text-ink hover:bg-canvas",
        destructive:
          "bg-red-600 text-white border-red-600 hover:bg-red-700",
      },
      size: {
        default: "px-3.5 py-2",
        sm:      "px-2.5 py-[5px] text-xs rounded-[6px]",
        lg:      "px-4 py-2.5",
        icon:    "size-[34px] text-[15px] border-0",
        "icon-sm": "size-[26px] text-xs rounded-[6px] border-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "button"
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
