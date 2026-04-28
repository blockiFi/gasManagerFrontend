"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DatePickerField } from "@/components/ui/date-picker-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronUp,
  Fuel,
  Images,
  ListPlus,
  Loader2,
  RefreshCw,
  Trash2,
  Upload,
} from "lucide-react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { addSalesRecord, analyseImage } from "@/lib/request";

const rowKey = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

function toYmd(d) {
  const x = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(x.getTime())) return "";
  const m = String(x.getMonth() + 1).padStart(2, "0");
  const day = String(x.getDate()).padStart(2, "0");
  return `${x.getFullYear()}-${m}-${day}`;
}

function dayStartMs(d) {
  const x = d instanceof Date ? new Date(d) : new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

const MS_PER_DAY = 86400000;

function revokeRowPreviewUrls(r) {
  if (r?.closing_preview_url) {
    URL.revokeObjectURL(r.closing_preview_url);
  }
  if (r?.opening_preview_url) {
    URL.revokeObjectURL(r.opening_preview_url);
  }
}

const newRow = () => ({
  key: rowKey(),
  sales_date: new Date(),
  closing_kg: 0,
  closing_sales: 0,
  opening_kg: 0,
  opening_sales: 0,
  closing_preview_url: null,
  opening_preview_url: null,
  /** Original file for re-running closing OCR after bulk failure */
  closingSourceFile: null,
  closingOcrFailed: false,
  status: "pending",
  error: null,
});

const selectClass = cn(
  "flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm shadow-sm",
  "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
);

const fileInputClass = cn(
  "flex h-10 w-full cursor-pointer rounded-md border border-dashed border-slate-300 bg-slate-50/80 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:border-slate-400 hover:bg-slate-50"
);

function statusBadge(status) {
  const map = {
    pending: "bg-slate-100 text-slate-700 ring-slate-200",
    saving: "animate-pulse bg-indigo-50 text-indigo-800 ring-indigo-200",
    saved: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    failed: "bg-rose-50 text-rose-800 ring-rose-200",
  };
  const labels = {
    pending: "Pending",
    saving: "Saving…",
    saved: "Saved",
    failed: "Failed",
  };
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
        map[status] ?? map.pending
      )}
    >
      {labels[status] ?? status}
    </span>
  );
}

// eslint-disable-next-line react/prop-types -- API payload `{ success, data }` from parent
export default function BulkAddSales({ dispensers = {} }) {
  const navigate = useNavigate();
  const location = useLocation();
  const token = useSelector((state) => state.authentication.token);

  const list = useMemo(() => dispensers?.data ?? [], [dispensers?.data]);
  const [selectedDispenserId, setSelectedDispenserId] = useState(
    list[0]?.id ?? ""
  );
  const [rows, setRows] = useState([newRow()]);
  const [bulkFirstDate, setBulkFirstDate] = useState(() => new Date());
  const [bulkMultiLoading, setBulkMultiLoading] = useState(false);
  const [ocrRowKey, setOcrRowKey] = useState(null);
  const [ocrKind, setOcrKind] = useState(null);
  const [running, setRunning] = useState(false);
  const rowsRef = useRef(rows);
  rowsRef.current = rows;

  const activeDispenser = useMemo(
    () => list.find((d) => String(d.id) === String(selectedDispenserId)),
    [list, selectedDispenserId]
  );

  const hasOpeningSales = activeDispenser?.sales?.length > 0;

  useEffect(() => {
    return () => {
      rowsRef.current?.forEach(revokeRowPreviewUrls);
    };
  }, []);

  useEffect(() => {
    if (!list.length) return;
    if (!list.some((d) => String(d.id) === String(selectedDispenserId))) {
      setSelectedDispenserId(list[0].id);
    }
  }, [list, selectedDispenserId]);

  const businessId = activeDispenser?.business_id ?? list[0]?.business_id;
  const locationId = activeDispenser?.location_id ?? list[0]?.location_id;

  const updateRow = useCallback((key, patch) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.key !== key) return r;
        if (
          patch.closing_preview_url !== undefined &&
          r.closing_preview_url &&
          patch.closing_preview_url !== r.closing_preview_url
        ) {
          URL.revokeObjectURL(r.closing_preview_url);
        }
        if (
          patch.opening_preview_url !== undefined &&
          r.opening_preview_url &&
          patch.opening_preview_url !== r.opening_preview_url
        ) {
          URL.revokeObjectURL(r.opening_preview_url);
        }
        const next = { ...r, ...patch };
        if (
          patch.closing_kg != null ||
          patch.closing_sales != null ||
          patch.opening_kg != null ||
          patch.opening_sales != null ||
          patch.sales_date != null
        ) {
          if (next.status === "failed") {
            next.status = "pending";
            next.error = null;
          }
          if (
            patch.closing_kg != null ||
            patch.closing_sales != null
          ) {
            if (
              Number(next.closing_kg) > 0 &&
              Number(next.closing_sales) > 0
            ) {
              next.closingOcrFailed = false;
            }
          }
        }
        return next;
      })
    );
  }, []);

  const addRow = () => setRows((prev) => [...prev, newRow()]);

  const removeRow = (key) => {
    setRows((prev) => {
      const row = prev.find((r) => r.key === key);
      if (row?.status === "saved") {
        toast.warn("Cannot remove a row that was already saved.");
        return prev;
      }
      if (prev.length <= 1) {
        toast.warn("Keep at least one row.");
        return prev;
      }
      revokeRowPreviewUrls(row);
      return prev.filter((r) => r.key !== key);
    });
  };

  const readjustRowDates = useCallback((ordered) => {
    if (!Array.isArray(ordered) || ordered.length === 0) return ordered;
    const baseMs = dayStartMs(ordered[0].sales_date || new Date());
    return ordered.map((r, idx) => ({
      ...r,
      sales_date: new Date(baseMs + idx * MS_PER_DAY),
    }));
  }, []);

  const moveRow = (key, dir) => {
    setRows((prev) => {
      const i = prev.findIndex((r) => r.key === key);
      if (i < 0) return prev;
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      if (prev[i].status === "saved" || prev[j].status === "saved") {
        toast.warn("Cannot reorder rows that are already saved.");
        return prev;
      }
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return readjustRowDates(next);
    });
  };

  const handleMultiClosingImages = async (e) => {
    const files = Array.from(e.target.files ?? []).filter((f) =>
      f.type.startsWith("image/")
    );
    e.target.value = "";
    if (files.length === 0) return;

    setBulkMultiLoading(true);
    try {
      const prevRows = rowsRef.current;
      const hasSaved = prevRows.some((r) => r.status === "saved");
      let built = [];

      if (hasSaved) {
        const maxMs = Math.max(
          ...prevRows.map((r) => dayStartMs(r.sales_date))
        );
        built = files.map((file, i) => {
          const r = newRow();
          r.sales_date = new Date(maxMs + (i + 1) * MS_PER_DAY);
          r.closing_preview_url = URL.createObjectURL(file);
          r.closingSourceFile = file;
          return r;
        });
      } else {
        const base = new Date(bulkFirstDate);
        base.setHours(0, 0, 0, 0);
        built = files.map((file, i) => {
          const r = newRow();
          const d = new Date(base);
          d.setDate(d.getDate() + i);
          r.sales_date = d;
          r.closing_preview_url = URL.createObjectURL(file);
          r.closingSourceFile = file;
          return r;
        });
      }

      for (let i = 0; i < files.length; i++) {
        const fd = new FormData();
        fd.append("image", files[i]);
        const res = await analyseImage(token, fd);
        if (res.success && Array.isArray(res.data?.data)) {
          const [kg, amt] = res.data.data;
          built[i] = {
            ...built[i],
            closing_kg: Number(kg) || 0,
            closing_sales: Number(amt) || 0,
            closingOcrFailed: false,
          };
        } else {
          built[i] = {
            ...built[i],
            closingOcrFailed: true,
          };
          toast.error(
            `Image ${i + 1}: OCR failed — use Retry AI or enter values manually.`
          );
        }
      }

      if (hasSaved) {
        setRows((prev) => [...prev, ...built]);
        toast.success(
          `Added ${files.length} row(s) from images (dates after your latest row).`
        );
      } else {
        prevRows.forEach(revokeRowPreviewUrls);
        setRows(built);
        toast.success(
          `${files.length} row(s) created from images (one row per image).`
        );
      }
    } finally {
      setBulkMultiLoading(false);
    }
  };

  const runClosingOcr = async (key, file) => {
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    updateRow(key, {
      closing_preview_url: previewUrl,
      closingSourceFile: file,
      closingOcrFailed: false,
    });
    setOcrRowKey(key);
    setOcrKind("closing");
    const fd = new FormData();
    fd.append("image", file);
    const res = await analyseImage(token, fd);
    setOcrRowKey(null);
    setOcrKind(null);
    if (res.success && Array.isArray(res.data?.data)) {
      const [kg, amt] = res.data.data;
      updateRow(key, {
        closing_kg: Number(kg) || 0,
        closing_sales: Number(amt) || 0,
        closingOcrFailed: false,
      });
      toast.success("Closing image processed.");
    } else {
      updateRow(key, { closingOcrFailed: true });
      toast.error(
        Array.isArray(res.error) ? res.error[0] : "Closing image OCR failed."
      );
    }
  };

  const retryClosingOcr = async (key) => {
    const row = rowsRef.current.find((r) => r.key === key);
    if (!row?.closingSourceFile) {
      toast.error(
        "No stored image for this row — choose a closing image again."
      );
      return;
    }
    setOcrRowKey(key);
    setOcrKind("closing");
    const fd = new FormData();
    fd.append("image", row.closingSourceFile);
    const res = await analyseImage(token, fd);
    setOcrRowKey(null);
    setOcrKind(null);
    if (res.success && Array.isArray(res.data?.data)) {
      const [kg, amt] = res.data.data;
      updateRow(key, {
        closing_kg: Number(kg) || 0,
        closing_sales: Number(amt) || 0,
        closingOcrFailed: false,
      });
      toast.success("Closing image re-analyzed.");
    } else {
      updateRow(key, { closingOcrFailed: true });
      toast.error(
        Array.isArray(res.error) ? res.error[0] : "Closing OCR failed again."
      );
    }
  };

  const runOpeningOcr = async (key, file) => {
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    updateRow(key, { opening_preview_url: previewUrl });
    setOcrRowKey(key);
    setOcrKind("opening");
    const fd = new FormData();
    fd.append("image", file);
    const res = await analyseImage(token, fd);
    setOcrRowKey(null);
    setOcrKind(null);
    if (res.success && Array.isArray(res.data?.data)) {
      const [kg, amt] = res.data.data;
      updateRow(key, {
        opening_kg: Number(kg) || 0,
        opening_sales: Number(amt) || 0,
      });
      toast.success("Opening image processed.");
    } else {
      toast.error(
        Array.isArray(res.error) ? res.error[0] : "Opening image OCR failed."
      );
    }
  };

  const buildPayload = (row, rowIndex) => {
    const payload = {
      dispenser_id: selectedDispenserId,
      business_id: String(businessId),
      location_id: String(locationId),
      closing_kg: Number(row.closing_kg),
      closing_sales: Number(row.closing_sales),
      sales_date: toYmd(row.sales_date),
    };
    if (rowIndex === 0 && !hasOpeningSales) {
      payload.opening_kg = Number(row.opening_kg);
      payload.opening_sales = Number(row.opening_sales);
    } else {
      payload.opening_kg = 0;
      payload.opening_sales = 0;
    }
    return payload;
  };

  const validateAll = (snapshot) => {
    if (!selectedDispenserId) {
      toast.error("Select a dispenser.");
      return false;
    }
    if (!snapshot.length) {
      toast.error("Add at least one row.");
      return false;
    }
    for (let i = 0; i < snapshot.length; i++) {
      const r = snapshot[i];
      if (!toYmd(r.sales_date)) {
        toast.error(`Row ${i + 1}: sales date is required.`);
        return false;
      }
      if (r.status === "saved") continue;
      if (Number(r.closing_kg) <= 0 || Number(r.closing_sales) <= 0) {
        toast.error(
          `Row ${i + 1}: closing kg and closing sales must be greater than 0.`
        );
        return false;
      }
      if (i === 0 && !hasOpeningSales) {
        if (Number(r.opening_kg) <= 0 || Number(r.opening_sales) <= 0) {
          toast.error(
            `Row ${i + 1}: opening kg and opening sales are required (first sale for this dispenser).`
          );
          return false;
        }
      }
    }
    for (let i = 1; i < snapshot.length; i++) {
      const a = dayStartMs(snapshot[i - 1].sales_date);
      const b = dayStartMs(snapshot[i].sales_date);
      if (b <= a) {
        toast.error(
          `Rows must use strictly increasing dates (row ${i} vs row ${i + 1}).`
        );
        return false;
      }
    }
    return true;
  };

  const allSaved =
    rows.length > 0 && rows.every((r) => r.status === "saved");

  const saveSequential = async () => {
    if (allSaved) return;
    const snapshot = rows.map((r) => ({ ...r }));
    if (!validateAll(snapshot)) return;

    setRunning(true);
    for (let i = 0; i < snapshot.length; i++) {
      if (snapshot[i].status === "saved") continue;

      snapshot[i] = { ...snapshot[i], status: "saving", error: null };
      setRows([...snapshot]);

      const payload = buildPayload(snapshot[i], i);
      const res = await addSalesRecord(token, payload);

      if (!res.success) {
        const msg = Array.isArray(res.error)
          ? res.error[0]
          : res.error || "Request failed";
        snapshot[i] = { ...snapshot[i], status: "failed", error: msg };
        setRows([...snapshot]);
        setRunning(false);
        toast.error(`Row ${i + 1} failed — fix it, then continue. ${msg}`);
        return;
      }

      snapshot[i] = { ...snapshot[i], status: "saved", error: null };
      setRows([...snapshot]);
      toast.success(`Row ${i + 1} saved.`);
    }

    setRunning(false);
    toast.success("All sales saved.");
    navigate(location.pathname, { replace: true });
  };

  if (!list.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-10 text-center">
        <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-500">
          <Fuel className="h-6 w-6" aria-hidden />
        </div>
        <p className="text-sm font-medium text-slate-800">No dispensers for this location</p>
        <p className="mt-1 max-w-xs text-xs text-slate-500">Add a dispenser first to use bulk entry.</p>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-full flex-col gap-5">
      <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-xs text-slate-700 sm:text-sm">
        <Images className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden />
        <p>
          Each row is one sale day. Use <strong>multi-select images</strong> to create many rows at once, or add
          rows manually. Saving runs top to bottom; fix any failed row, then continue.
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-slate-700">Dispenser</Label>
        <select
          className={selectClass}
          value={selectedDispenserId}
          onChange={(e) => {
            rowsRef.current?.forEach(revokeRowPreviewUrls);
            setSelectedDispenserId(e.target.value);
            setRows([newRow()]);
          }}
        >
          {list.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        <p className="text-xs leading-relaxed text-slate-500">
          {hasOpeningSales
            ? "This dispenser already has sales — opening readings for row 1 come from the last sale."
            : "Row 1 must include opening readings (image or manual fields)."}
        </p>
      </div>

      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Upload className="h-4 w-4 text-indigo-600" aria-hidden />
          Bulk from closing images
        </div>
        <p className="text-xs leading-relaxed text-slate-500">
          Select several images at once—one row per image. If nothing is saved yet, rows replace the list and dates
          start from the date below. If some rows are already saved, new images append with dates after your latest
          sale (one day apart).
        </p>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-slate-600">Start date for first image (replace mode)</Label>
          <DatePickerField
            value={bulkFirstDate}
            onChange={(d) => d && setBulkFirstDate(d)}
            disabled={running || bulkMultiLoading || rows.some((r) => r.status === "saved")}
            placeholder="Start date"
            compact
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-slate-600">Closing images (multi-select)</Label>
          <Input
            type="file"
            accept="image/*"
            multiple
            disabled={running || bulkMultiLoading}
            className={fileInputClass}
            onChange={handleMultiClosingImages}
          />
        </div>
        {bulkMultiLoading ? (
          <div className="flex items-center gap-2 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs font-medium text-indigo-900">
            <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" aria-hidden />
            Reading images and filling rows…
          </div>
        ) : null}
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5 border-slate-200"
          onClick={addRow}
          disabled={running || bulkMultiLoading}
        >
          <ListPlus className="h-4 w-4" aria-hidden />
          Add row
        </Button>
      </div>

      <div className="max-h-[min(52vh,480px)] space-y-4 overflow-y-auto pr-1">
        {rows.map((row, index) => {
          const locked = row.status === "saved";
          const busy =
            running ||
            bulkMultiLoading ||
            (ocrRowKey === row.key && ocrKind === "closing");
          const busyOpen =
            running ||
            bulkMultiLoading ||
            (ocrRowKey === row.key && ocrKind === "opening");

          return (
            <div
              key={row.key}
              className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/40 p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  {statusBadge(row.status)}
                  <span className="text-sm font-semibold text-slate-900">Row {index + 1}</span>
                </div>
                <div className="flex gap-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    disabled={locked || running || bulkMultiLoading || index === 0}
                    onClick={() => moveRow(row.key, -1)}
                    aria-label="Move up"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    disabled={
                      locked || running || bulkMultiLoading || index === rows.length - 1
                    }
                    onClick={() => moveRow(row.key, 1)}
                    aria-label="Move down"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                    disabled={
                      locked || running || bulkMultiLoading || rows.length <= 1
                    }
                    onClick={() => removeRow(row.key)}
                    aria-label="Remove row"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {row.status === "failed" && row.error ? (
                <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
                  {row.error}
                </p>
              ) : null}

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600">Sales date</Label>
                <DatePickerField
                  value={row.sales_date}
                  onChange={(date) =>
                    date && updateRow(row.key, { sales_date: date })
                  }
                  disabled={locked}
                  placeholder="Select date"
                  compact
                />
              </div>

              {index === 0 && !hasOpeningSales && (
                <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-3">
                  <Label className="text-sm font-medium text-slate-800">Opening meter (row 1 only)</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    className={fileInputClass}
                    disabled={locked || busyOpen}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) runOpeningOcr(row.key, f);
                      e.target.value = "";
                    }}
                  />
                  {row.opening_preview_url ? (
                    <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                      <img
                        src={row.opening_preview_url}
                        alt={`Row ${index + 1} opening meter`}
                        className="max-h-40 w-full object-contain"
                      />
                    </div>
                  ) : null}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-600">Opening kg</Label>
                      <Input
                        type="number"
                        step="0.0001"
                        className="border-slate-200"
                        disabled={locked}
                        value={row.opening_kg || ""}
                        onChange={(e) =>
                          updateRow(row.key, {
                            opening_kg: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-600">Opening sales (₦)</Label>
                      <Input
                        type="number"
                        step="0.0001"
                        className="border-slate-200"
                        disabled={locked}
                        value={row.opening_sales || ""}
                        onChange={(e) =>
                          updateRow(row.key, {
                            opening_sales: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Label className="text-sm font-medium text-slate-800">Closing meter</Label>
                  {row.closingOcrFailed && row.closingSourceFile && !locked ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1 border-slate-200 text-xs"
                      disabled={busy}
                      onClick={() => retryClosingOcr(row.key)}
                    >
                      {ocrRowKey === row.key && ocrKind === "closing" ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                      ) : (
                        <RefreshCw className="h-3.5 w-3.5" aria-hidden />
                      )}
                      Retry AI
                    </Button>
                  ) : null}
                </div>
                {row.closingOcrFailed && !row.closingSourceFile && !locked ? (
                  <p className="text-xs text-amber-800">
                    AI could not read this image. Upload a new closing image or enter kg and amount manually.
                  </p>
                ) : null}
                <Input
                  type="file"
                  accept="image/*"
                  className={fileInputClass}
                  disabled={locked || busy}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) runClosingOcr(row.key, f);
                    e.target.value = "";
                  }}
                />
                {row.closing_preview_url ? (
                  <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                    <img
                      src={row.closing_preview_url}
                      alt={`Row ${index + 1} closing meter`}
                      className="max-h-40 w-full object-contain"
                    />
                  </div>
                ) : null}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-600">Closing kg</Label>
                    <Input
                      type="number"
                      step="0.0001"
                      className="border-slate-200"
                      disabled={locked}
                      value={row.closing_kg || ""}
                      onChange={(e) =>
                        updateRow(row.key, { closing_kg: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-600">Closing sales (₦)</Label>
                    <Input
                      type="number"
                      step="0.0001"
                      className="border-slate-200"
                      disabled={locked}
                      value={row.closing_sales || ""}
                      onChange={(e) =>
                        updateRow(row.key, { closing_sales: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Button
        type="button"
        className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 sm:w-auto sm:min-w-[220px]"
        disabled={running || bulkMultiLoading || allSaved}
        onClick={saveSequential}
      >
        {running ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
        {rows.some((r) => r.status === "failed")
          ? "Continue from failed row"
          : rows.every((r) => r.status === "saved")
            ? "All rows saved"
            : "Save all sequentially"}
      </Button>
    </div>
  );
}
