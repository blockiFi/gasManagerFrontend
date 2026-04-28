import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import axios from "@/lib/axios";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const todayYmd = () => {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
};

const toYmd = (dateLike) => {
  if (!dateLike) return todayYmd();
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return todayYmd();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
};

export default function EditSaleDate({ sale }) {
  const token = useSelector((state) => state.authentication.token);
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [salesDate, setSalesDate] = useState(toYmd(sale?.sales_date));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const save = async () => {
    setError(null);
    setLoading(true);
    try {
      const body = {
        business_id: sale.business_id,
        location_id: sale.location_id,
        sales_id: sale.id,
        sales_date: salesDate,
      };

      const response = await axios.post(
        "/api/business/sales/edit_sale_date",
        body,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        toast.success("Sale date updated successfully");
        setOpen(false);
        navigate(location.pathname, { replace: true });
        return;
      }

      setError("Error updating sale date.");
    } catch (e) {
      setError(
        e?.response?.data?.errors?.[0] ||
          e?.response?.data?.error ||
          "Error updating sale date."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-sm">
          Edit date
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit sale date</DialogTitle>
          <DialogDescription>
            Update the recorded date for this sale.
          </DialogDescription>
        </DialogHeader>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Sale date</label>
          <input
            type="date"
            className="border rounded-md h-10 px-2"
            value={salesDate}
            onChange={(e) => setSalesDate(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button onClick={save} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

