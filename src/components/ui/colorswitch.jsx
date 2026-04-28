
import { useState } from "react"
import { cn } from "@/lib/utils"



export default function ColorSwitch({
  initialState = false,
  primaryColor = "#10b981", // Green
  secondaryColor = "#ec4899", // Pink
  size = "md",
  label,
  labelPosition = "right",
  disabled = false,
  onChange,
  className,
}) {
  const [checked, setChecked] = useState(initialState)

  const handleToggle = () => {
    if (disabled) return

    const newState = !checked
    setChecked(newState)
    onChange?.(newState)
  }

  const handleKeyDown = (e) => {
    if (disabled) return

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      handleToggle()
    }
  }

  // Size mappings
  const sizeClasses = {
    sm: {
      switch: "w-8 h-4",
      thumb: "w-3 h-3",
      thumbTranslate: "translate-x-4",
      label: "text-sm",
    },
    md: {
      switch: "w-12 h-6",
      thumb: "w-5 h-5",
      thumbTranslate: "translate-x-6",
      label: "text-base",
    },
    lg: {
      switch: "w-16 h-8",
      thumb: "w-7 h-7",
      thumbTranslate: "translate-x-8",
      label: "text-lg",
    },
  }

  const currentSize = sizeClasses[size]

  return (
    <div className={cn("flex items-center", className)}>
      {label && labelPosition === "left" && (
        <label className={cn("mr-3", currentSize.label, disabled && "opacity-50")}>{label}</label>
      )}

      <div
        role="switch"
        aria-checked={checked}
        tabIndex={disabled ? -1 : 0}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={cn(
          "relative inline-flex items-center rounded-full transition-colors duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
          currentSize.switch,
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
          checked ? "bg-current" : "bg-current",
        )}
        style={{ color: checked ? primaryColor : secondaryColor }}
      >
        <span
          className={cn(
            "absolute rounded-full bg-white shadow-md transform transition-transform duration-300 ease-in-out",
            currentSize.thumb,
            checked ? currentSize.thumbTranslate : "translate-x-0.5",
          )}
        />
      </div>

      {label && labelPosition === "right" && (
        <label className={cn("ml-3", currentSize.label, disabled && "opacity-50")}>{label}</label>
      )}
    </div>
  )
}
