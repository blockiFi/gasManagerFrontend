import AddSales from "./AddSales"
import AiAddSales from "./AiAddSales"
import BulkAddSales from "./BulkAddSales"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { PenLine, Plus, Rows3, Sparkles } from "lucide-react"

const tabTriggerClass =
  "rounded-lg px-3 py-2 text-xs font-semibold transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm data-[state=inactive]:text-slate-500 data-[state=inactive]:hover:text-slate-800 sm:text-sm"

// eslint-disable-next-line react/prop-types -- API payload `{ success, data }` from parent
const AddSalesMenu = ({ dispensers = {} }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2 border-slate-200 font-medium shadow-sm"
        >
          <Plus className="h-4 w-4 shrink-0" aria-hidden />
          Add sales
        </Button>
      </DialogTrigger>
      <DialogContent
        forceMount
        className={cn(
          "flex max-h-[min(90vh,820px)] w-[calc(100%-2rem)] max-w-xl flex-col gap-0 overflow-hidden rounded-2xl border border-slate-200 p-0 shadow-xl",
          "data-[state=closed]:hidden sm:max-w-xl"
        )}
      >
        <DialogHeader className="shrink-0 space-y-1 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white px-6 py-5 text-left">
          <DialogTitle className="text-xl font-semibold tracking-tight text-slate-900">
            Add sales
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-slate-500">
            Record a single sale, use AI on meter photos, or enter multiple days in bulk.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="manual" className="flex min-h-0 flex-1 flex-col px-6 pb-5 pt-4">
          <TabsList className="mb-4 grid h-auto w-full shrink-0 grid-cols-3 gap-1 rounded-xl border border-slate-200 bg-slate-100/80 p-1">
            <TabsTrigger value="manual" className={tabTriggerClass}>
              <span className="flex items-center justify-center gap-1.5">
                <PenLine className="hidden h-3.5 w-3.5 sm:inline" aria-hidden />
                Manual
              </span>
            </TabsTrigger>
            <TabsTrigger value="ai" className={tabTriggerClass}>
              <span className="flex items-center justify-center gap-1.5">
                <Sparkles className="hidden h-3.5 w-3.5 sm:inline" aria-hidden />
                AI
              </span>
            </TabsTrigger>
            <TabsTrigger value="bulk" className={tabTriggerClass}>
              <span className="flex items-center justify-center gap-1.5">
                <Rows3 className="hidden h-3.5 w-3.5 sm:inline" aria-hidden />
                Bulk
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="manual"
            forceMount
            className="mt-0 min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-1 focus-visible:outline-none"
          >
            <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-900">Manual entry</h3>
                <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                  Enter opening and closing readings for one sale period.
                </p>
              </div>
              <AddSales dispensers={dispensers} />
            </div>
          </TabsContent>

          <TabsContent
            value="ai"
            forceMount
            className="mt-0 min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-1 focus-visible:outline-none"
          >
            <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-900">AI-assisted</h3>
                <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                  Upload meter images and let the service suggest readings.
                </p>
              </div>
              <AiAddSales dispensers={dispensers} />
            </div>
          </TabsContent>

          <TabsContent
            value="bulk"
            forceMount
            className="mt-0 min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-1 focus-visible:outline-none"
          >
            <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-900">Bulk / multi-day</h3>
                <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                  Add several rows with their own dates and images. Rows save in order; fix and
                  continue if one fails.
                </p>
              </div>
              <BulkAddSales dispensers={dispensers} />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

export default AddSalesMenu
