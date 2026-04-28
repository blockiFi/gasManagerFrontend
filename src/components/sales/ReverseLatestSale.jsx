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

export default function ReverseLatestSale({ sale }) {
  const token = useSelector((state) => state.authentication.token);
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const reverse = async () => {
    setError(null);
    setLoading(true);
    try {
      const dispenserId = sale.dispenser?.id ?? sale.dispenser_id;
      const body = {
        business_id: sale.business_id,
        location_id: sale.location_id,
        dispenser_id: dispenserId,
      };

      const response = await axios.post(
        "/api/business/sales/reverse_latest_sale",
        body,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        toast.success(
          response.data?.message ?? "Latest sale reversed successfully"
        );
        setOpen(false);
        navigate(location.pathname, { replace: true });
        return;
      }

      setError("Could not reverse sale.");
    } catch (e) {
      const msg =
        e?.response?.data?.errors?.[0] ||
        e?.response?.data?.error ||
        "Could not reverse sale.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="text-sm">
          Reverse latest sale
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reverse latest sale</DialogTitle>
          <DialogDescription>
            This permanently deletes the most recent sale for this dispenser and
            restores the dispenser level and supply remaining to their previous
            values. Receipts attached to this sale will be removed. This cannot
            be undone.
          </DialogDescription>
        </DialogHeader>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={reverse} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm reverse
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
