/* eslint-disable react/prop-types -- dispenser is API model shape */
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useState } from "react";
import { ChevronRight, Eye } from "lucide-react";
import axios from "@/lib/axios";
import DispenserData from "./DispenserData";
import { Switch } from "../ui/switch";
import {  toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import Tank from "./TankPage";

const ViewDispenser = ({ dispenser, triggerVariant = "outline" }) => {
    const token = useSelector((state) => state.authentication.token);
    const navigate = useNavigate();
    const location = useLocation();
      const [, setLoading] = useState(false);
    const handleSwitchChange = () => {
            const data = {
                business_id: dispenser.business_id,
                location_id: dispenser.location_id,
                dispenser_id: dispenser.id,
            };
            setLoading(true)
            axios.post("api/business/update_dispenser/setting" , data ,{ headers: {"Authorization" : `Bearer ${token}`} } ).then((responce)=>{
                setLoading(false)
                if(responce.status){
                    
                    toast.success("Settings Updated Successfully!!!")
                    navigate(location.pathname, { replace: true });
                }else{
                    toast.error("Error Updating Settiings!!!")

                }
            }).catch((err)=>{
                console.log(err)
                setLoading(false)
                toast.error("Error Updating Settiings!!!")

            })
       
      };
    
  

      const triggerClasses =
        triggerVariant === "ghost"
          ? "w-full justify-between gap-2 rounded-lg border border-transparent bg-transparent px-2 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
          : "w-full gap-2 rounded-lg border-slate-200 font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"

      return (
        <Dialog>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant={triggerVariant === "ghost" ? "ghost" : "outline"}
              className={triggerClasses}
            >
              {triggerVariant === "ghost" ? (
                <>
                  <span className="flex items-center gap-2">
                    <Eye className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
                    View dispenser
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 shrink-0" aria-hidden />
                  View dispenser
                </>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Dispenser</DialogTitle>
              <DialogDescription>
                Settings and tank preview for this dispenser.
              </DialogDescription>
            </DialogHeader>
            <>
            <DispenserData dispenser={dispenser} />
            <Tank dispenser={dispenser}  />
            <div className="w-full h-1 bg-black"></div>
            <div>
                <h1 className="text-center text-bold mb-4">Settings</h1>
                <div className="flex justify-between text-xs "><h1 className="">Empty Sales Settting</h1> <Switch checked={dispenser.empty_sale === 'true' ? true : false} onCheckedChange={handleSwitchChange}   /></div>
            </div>
         
            <DialogFooter>
              {/* <Button type="submit">{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}</Button> */}
            </DialogFooter>
            </>
            
           
          </DialogContent>
        </Dialog>
      )

}

export default ViewDispenser