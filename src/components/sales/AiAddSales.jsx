"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addSalesRecord, analyseImage } from "@/lib/request"
import { cn } from "@/lib/utils"
import { DatePickerField } from "@/components/ui/date-picker-field"
import { Fuel, ImageUp, Loader2, Sparkles } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { useSelector } from "react-redux"
import { useLocation, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"

const selectClass = cn(
  "flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm shadow-sm",
  "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
)

const fileInputClass = cn(
  "flex h-10 w-full cursor-pointer rounded-md border border-dashed border-slate-300 bg-slate-50/80 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:border-slate-400 hover:bg-slate-50"
)

// eslint-disable-next-line react/prop-types -- API payload `{ success, data }` from parent
const AiAddSales = ({ dispensers = {} }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const token = useSelector((state) => state.authentication.token)
  const list = useMemo(
    () => (Array.isArray(dispensers?.data) ? dispensers.data : []),
    [dispensers?.data]
  )
  const hasDispensers = dispensers?.success === true && list.length > 0

  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState(new Date())
  const [selectedDispenser, setSelectedDispenser] = useState(() => String(list[0]?.id ?? ""))
  const [hasOpeningSales, setHasOpeningSales] = useState(false)
  const [openingFile, setOpeningFile] = useState(null)
  const [closingFile, setClosingFile] = useState(null)
  const [openingKg, setOpeningKg] = useState(0)
  const [openingSales, setOpeningSales] = useState(0)
  const [closingKg, setClosingKg] = useState(0)
  const [closingSales, setClosingSales] = useState(0)
  const [error, setError] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { dispenser_id: list[0]?.id ? String(list[0].id) : "" },
  })

  useEffect(() => {
    if (!list.length) return
    const d = list.find((x) => String(x.id) === String(selectedDispenser))
    setHasOpeningSales((d?.sales?.length ?? 0) > 0)
  }, [list, selectedDispenser])

  const handleOpeningFileChange = async (e) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return
    setError(null)
    setLoading(true)
    setOpeningFile(selectedFile)
    const fd = new FormData()
    fd.append("image", selectedFile)
    const responce = await analyseImage(token, fd)
    if (responce.success && Array.isArray(responce.data?.data)) {
      const openingData = responce.data.data
      setOpeningKg(openingData[0])
      setOpeningSales(openingData[1])
      toast.success("Opening image processed")
    } else {
      toast.error("Could not read opening image. Try a clearer photo of the meter.")
    }
    setLoading(false)
  }

  const handleClosingFileChange = async (e) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return
    setError(null)
    setLoading(true)
    setClosingFile(selectedFile)
    const fd = new FormData()
    fd.append("image", selectedFile)
    const responce = await analyseImage(token, fd)
    if (responce.success && Array.isArray(responce.data?.data)) {
      const closingData = responce.data.data
      setClosingKg(closingData[0])
      setClosingSales(closingData[1])
      toast.success("Closing image processed")
    } else {
      toast.error("Could not read closing image. Try a clearer photo of the meter.")
    }
    setLoading(false)
  }

  const onSubmit = async (data) => {
    setError(null)
    if (!hasDispensers) return

    if (!hasOpeningSales) {
      if (Number(openingKg) === 0 || Number(openingSales) === 0) {
        setError("Upload an opening meter image first (or use manual entry).")
        return
      }
    }

    if (Number(closingKg) === 0 || Number(closingSales) === 0) {
      setError("Upload a closing meter image first.")
      return
    }

    setLoading(true)
    data.sales_date = startDate
    data.business_id = list[0].business_id
    data.location_id = list[0].location_id
    data.closing_kg = closingKg
    data.closing_sales = closingSales
    if (!hasOpeningSales) {
      data.opening_kg = openingKg
      data.opening_sales = openingSales
    } else {
      data.opening_kg = 0
      data.opening_sales = 0
    }

    const res = await addSalesRecord(token, data)
    setLoading(false)
    if (res.success) {
      toast.success("Sale added successfully")
      navigate(location.pathname, { replace: true })
    } else {
      toast.error("Could not add sale. Check readings and try again.")
      if (Array.isArray(res.error)) {
        res.error.forEach((msg) => toast.error(msg))
      }
    }
  }

  const refreshData = () => {
    setClosingFile(null)
    setOpeningFile(null)
    setClosingKg(0)
    setClosingSales(0)
    setOpeningKg(0)
    setOpeningSales(0)
    setError(null)
  }

  const dispenserField = register("dispenser_id", { required: true })

  if (!hasDispensers) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-10 text-center">
        <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-500">
          <Fuel className="h-6 w-6" aria-hidden />
        </div>
        <p className="text-sm font-medium text-slate-800">No dispensers for this location</p>
        <p className="mt-1 max-w-xs text-xs text-slate-500">Add a dispenser first, then you can use AI-assisted entry.</p>
      </div>
    )
  }

  return (
    <div className="relative flex flex-col gap-5">
      {loading ? (
        <div className="flex items-center gap-2 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2.5 text-sm text-indigo-900">
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
          <span>Analyzing image…</span>
        </div>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800"
        >
          {error}
        </div>
      ) : null}

      <div className="flex items-start gap-3 rounded-lg border border-violet-100 bg-violet-50/60 px-3 py-2.5 text-xs text-violet-900 sm:text-sm">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" aria-hidden />
        <p>
          Upload clear photos of the meter display. Values are suggestions—edit the numbers below if
          anything looks wrong before saving.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700">Dispenser</Label>
          <select
            {...dispenserField}
            onChange={(e) => {
              dispenserField.onChange(e)
              setSelectedDispenser(e.target.value)
              refreshData()
            }}
            className={selectClass}
          >
            {list.map((dispenser) => (
              <option value={dispenser.id} key={dispenser.id}>
                {dispenser.name}
              </option>
            ))}
          </select>
          {errors.dispenser_id?.type === "required" ? (
            <p role="alert" className="text-xs font-medium text-rose-600">
              Select a dispenser
            </p>
          ) : null}
        </div>

        {!hasOpeningSales ? (
          <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <ImageUp className="h-4 w-4 text-slate-500" aria-hidden />
              Opening meter
            </div>
            <p className="text-xs text-slate-500">Required for the first sale on this dispenser.</p>
            <Input
              type="file"
              accept="image/*"
              className={fileInputClass}
              disabled={loading}
              onChange={(e) => {
                handleOpeningFileChange(e)
                e.target.value = ""
              }}
            />
            {openingFile ? (
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                <img
                  src={URL.createObjectURL(openingFile)}
                  alt="Opening meter preview"
                  className="max-h-44 w-full object-contain"
                />
              </div>
            ) : null}
            {Number(openingKg) > 0 && Number(openingSales) > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-600">Opening kg</Label>
                  <Input
                    type="number"
                    step="0.0001"
                    className="border-slate-200 shadow-sm"
                    value={openingKg}
                    onChange={(e) => setOpeningKg(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-600">Opening sales (₦)</Label>
                  <Input
                    type="number"
                    step="0.0001"
                    className="border-slate-200 shadow-sm"
                    value={openingSales}
                    onChange={(e) => setOpeningSales(e.target.value)}
                  />
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
            This dispenser already has sales—opening readings come from the last recorded sale.
          </p>
        )}

        <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <ImageUp className="h-4 w-4 text-slate-500" aria-hidden />
            Closing meter
          </div>
          <p className="text-xs text-slate-500">Always required—this defines the end of the sale period.</p>
          <Input
            type="file"
            accept="image/*"
            className={fileInputClass}
            disabled={loading}
            onChange={(e) => {
              handleClosingFileChange(e)
              e.target.value = ""
            }}
          />
          {closingFile ? (
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
              <img
                src={URL.createObjectURL(closingFile)}
                alt="Closing meter preview"
                className="max-h-44 w-full object-contain"
              />
            </div>
          ) : null}
          {Number(closingKg) > 0 && Number(closingSales) > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600">Closing kg</Label>
                <Input
                  type="number"
                  step="0.0001"
                  className="border-slate-200 shadow-sm"
                  value={closingKg}
                  onChange={(e) => setClosingKg(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600">Closing sales (₦)</Label>
                <Input
                  type="number"
                  step="0.0001"
                  className="border-slate-200 shadow-sm"
                  value={closingSales}
                  onChange={(e) => setClosingSales(e.target.value)}
                />
              </div>
            </div>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700">Sales date</Label>
          <DatePickerField
            value={startDate}
            onChange={(d) => d && setStartDate(d)}
            disabled={loading}
            placeholder="Select sales date"
          />
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
          <Button type="submit" disabled={loading} className="min-w-[140px] gap-2 bg-indigo-600 hover:bg-indigo-700">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
            {loading ? "Saving…" : "Save sale"}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default AiAddSales
