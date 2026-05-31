import { BRAND_LOGO_SRC, BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand"
import { cn } from "@/lib/utils"

const sizeMap = {
  sm: { img: "h-8 w-8", text: "text-sm", tagline: "text-[10px]" },
  md: { img: "h-9 w-9", text: "text-sm", tagline: "text-[11px]" },
  lg: { img: "h-12 w-12", text: "text-lg", tagline: "text-xs" },
}

export default function BrandLogo({
  size = "md",
  showText = true,
  showTagline = false,
  className,
  textClassName,
  dark = false,
}) {
  const sizes = sizeMap[size] ?? sizeMap.md

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <img
        src={BRAND_LOGO_SRC}
        alt={`${BRAND_NAME} logo`}
        className={cn(sizes.img, "shrink-0 rounded-lg object-cover shadow-sm ring-1 ring-black/5")}
      />
      {showText ? (
        <div className="min-w-0">
          <p
            className={cn(
              "font-semibold tracking-tight",
              sizes.text,
              dark ? "text-white" : "text-slate-900",
              textClassName
            )}
          >
            {BRAND_NAME}
          </p>
          {showTagline ? (
            <p className={cn(sizes.tagline, dark ? "text-slate-400" : "text-slate-500")}>
              {BRAND_TAGLINE}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
