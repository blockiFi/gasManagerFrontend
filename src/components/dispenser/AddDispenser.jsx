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

import { useState } from "react";
import { Loader2, Plus, RefreshCcw } from "lucide-react";
import axios from "@/lib/axios";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

const AddDispenser = ({business_id ,location_id}) => {
    const token = useSelector((state) => state.authentication.token);
    const navigate = useNavigate();
    const location = useLocation();
    const {
        register,
        handleSubmit,
        formState: { errors },
      } = useForm();
      const [loading, setLoading] = useState(false);
      const [success, setSuccess] = useState();
      const [error, setError] = useState();
      const refresh = () => {
        setSuccess(null)
    }
      const onSubmit = async (data) => {
        console.log(location);
        data.business_id = business_id;
        data.location_id = location_id;
        
            console.log(data)
            setLoading(true)
            axios.post("api/business/add_dispenser" , data ,{ headers: {"Authorization" : `Bearer ${token}`} } ).then((responce)=>{
                console.log(responce)
                setLoading(false)
                if(responce.status){
                    setSuccess("Dispenser Added Successfully!!!");
                    navigate(location.pathname, { replace: true });
                }else{
                    setError("Error Occured While Adding Dispenser  !!!");
                }
            }).catch((error)=>{
                console.log(error)
                setError("Error Occured While Adding Dispenser  !!!");

            })
      


      }

      return (
        <Dialog>
          <DialogTrigger asChild>
            <Button ><Plus /> Add Dispenser</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Dispenser</DialogTitle>
              <DialogDescription>
                
                {error && {error}}
                
              </DialogDescription>
            </DialogHeader>
            {success ? 
            <div className="bg-green-500 text-white px-4 py-6 rounded-lg flex justify-between" ><h1 >{success} </h1> <RefreshCcw  onClick={refresh} /> </div>:

            <form  onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col gap-2 w-full">
                <Label>Dispenser Name</Label>
                <Input {...register("name" ,{ required: true })} type="text" className="w-full" />
                {errors.name?.type === "required" && (
                <p role="alert" className="text-xs text-red-500 mt-1">
                  Name  is required!!!
                </p>
              )}
              </div>
              <div className="flex flex-col gap-2 w-full">
                <Label>Dispenser Capacity</Label>
                <Input {...register("capacity" ,{ required: true })}  type="number" className="w-full" />
                {errors.capacity?.type === "required" && (
                <p role="alert" className="text-xs text-red-500 mt-1">
                  Capacity  is required!!!
                </p>
              )}
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Add Dispenser</Button>
            </DialogFooter>
            </form>
            }
           
          </DialogContent>
        </Dialog>
      )

}

export default AddDispenser
