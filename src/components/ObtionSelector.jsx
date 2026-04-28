import { useEffect, useState } from "react"

/**
 * Metric pill group. Pass `value` + `handleChange` for controlled mode; otherwise first option syncs on mount.
 */
const ObtionSelector = ({ options, handleChange, value: valueProp }) => {
  const firstId = options?.[0]?.id ?? ""
  const [internal, setInternal] = useState(valueProp ?? firstId)

  useEffect(() => {
    if (valueProp !== undefined) {
      setInternal(valueProp)
    }
  }, [valueProp])

  const selected = valueProp !== undefined ? valueProp : internal

  const handleClick = (id) => {
    if (valueProp === undefined) {
      setInternal(id)
    }
    handleChange(id)
  }

  return (
    <div className="flex flex-wrap justify-start gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
      {options.map((option) => {
        const IconComponent = option.icon
        const isSelected = selected === option.id
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => handleClick(option.id)}
            className={`
              flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors
              ${
                isSelected
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }
            `}
          >
            <IconComponent
              className={`h-4 w-4 shrink-0 ${isSelected ? "text-white" : "text-slate-400"}`}
              aria-hidden
            />
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export default ObtionSelector
