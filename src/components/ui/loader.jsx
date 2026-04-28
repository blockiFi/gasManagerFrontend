"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"


export function LoaderFunction({ size = "md", color = "primary", variant = "spinner", text, className }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Size mappings
  const sizeMap = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  }

  // Color mappings
  const colorMap = {
    default: "border-gray-300 border-t-gray-600",
    primary: "border-gray-300 border-t-rose-500",
    secondary: "border-gray-300 border-t-purple-500",
    success: "border-gray-300 border-t-emerald-500",
    warning: "border-gray-300 border-t-amber-500",
    danger: "border-gray-300 border-t-red-500",
  }

  // Dot color mappings
  const dotColorMap = {
    default: "bg-gray-600",
    primary: "bg-rose-500",
    secondary: "bg-purple-500",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-red-500",
  }

  if (!mounted) return null

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      {variant === "spinner" && (
        <div className={cn("animate-spin rounded-full border-4 border-solid", sizeMap[size], colorMap[color])} />
      )}

      {variant === "dots" && (
        <div className="flex space-x-2">
          <div
            className={cn(
              "animate-bounce rounded-full",
              sizeMap[size === "xl" ? "sm" : size === "lg" ? "sm" : size === "md" ? "sm" : "sm"],
              dotColorMap[color],
              "animation-delay-0",
            )}
          />
          <div
            className={cn(
              "animate-bounce rounded-full",
              sizeMap[size === "xl" ? "sm" : size === "lg" ? "sm" : size === "md" ? "sm" : "sm"],
              dotColorMap[color],
              "animation-delay-150",
            )}
            style={{ animationDelay: "0.15s" }}
          />
          <div
            className={cn(
              "animate-bounce rounded-full",
              sizeMap[size === "xl" ? "sm" : size === "lg" ? "sm" : size === "md" ? "sm" : "sm"],
              dotColorMap[color],
              "animation-delay-300",
            )}
            style={{ animationDelay: "0.3s" }}
          />
        </div>
      )}

      {variant === "pulse" && (
        <div className={cn("animate-pulse rounded-full", sizeMap[size], dotColorMap[color], "opacity-75")} />
      )}

      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  )
}
