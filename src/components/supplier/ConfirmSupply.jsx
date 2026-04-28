import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/Textarea"
import { useState } from "react";
import { Loader2 } from "lucide-react";
import axios from "@/lib/axios";
import { useSelector } from "react-redux";

const todayYmd = () => {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
};

const ConfirmSupply = ({supply}) => {
    const token = useSelector((state) => state.authentication.token);
    const {
        register,
        handleSubmit,
        formState: { errors },
      } = useForm({
        defaultValues: {
          delivered_at: todayYmd(),
        },
      });
      const [loading, setLoading] = useState(false);
      const [success, setSuccess] = useState();
      const [error, setError] = useState();
      const onSubmit = async (data) => {
        data.business_id = supply.business_id;
        data.supply_id = supply.id;
            setLoading(true)
            axios.post("api/business/supply/confirm_business_supply" , data ,{ headers: {"Authorization" : `Bearer ${token}`} } ).then((responce)=>{
                setLoading(false)
                if(responce.status){
                    setSuccess("Supply Added Successfully!!!");
                }else{
                    setError("Error Occured While Adding Supply Check  Data!!!");
                }
            }).catch((error)=>{
                setError("Error Occured While Adding Supply Check  Data!!!");

            })
       


      }

    return (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="border-slate-200 text-slate-700 hover:bg-slate-50">
              Confirm delivery
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Confirm Supply</DialogTitle>
              <DialogDescription>
                Only submit after gas has been delivered to this site.
              </DialogDescription>
              {error ? (
                <p className="mt-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800" role="alert">
                  {error}
                </p>
              ) : null}
            </DialogHeader>
            {success ? 
            <h1 className="bg-green-500 text-white px-4 py-6 rounded-lg">{success}</h1> :

            <form  onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col gap-2 w-full">
                <label className="text-sm font-medium">Delivery date</label>
                <input
                  type="date"
                  className="border rounded-md h-10 px-2 w-full"
                  {...register("delivered_at", { required: true })}
                  aria-invalid={errors.delivered_at ? "true" : "false"}
                />
                {errors.delivered_at?.type === "required" && (
                  <p role="alert" className="text-xs text-red-500 mt-1">
                    Delivery date is required
                  </p>
                )}
                <Textarea {...register("note" ,{ required: true })} placeholder="Enter the delivery personel name and phone number.. Enter any other relivent details about this supply."  className="w-full" />
                {errors.note?.type === "required" && (
                <p role="alert" className="text-xs text-red-500 mt-1">
                  A Supply note is required!!!
                </p>
              )}
              </div>
             
            </div>
            <DialogFooter>
              <Button type="submit">{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Confirm</Button>
            </DialogFooter>
            </form>
            }
           
          </DialogContent>
        </Dialog>
      )
}

export default ConfirmSupply