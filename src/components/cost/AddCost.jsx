/* eslint-disable react/prop-types */
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from '../ui/textarea'
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useState } from "react";

import { DatePickerField } from "@/components/ui/date-picker-field"
import { useForm } from "react-hook-form";
import { Loader2, RefreshCcw } from "lucide-react";
import axios from "@/lib/axios";
import { useSelector } from "react-redux";

const AddCost = ({ location }) => {
  const token = useSelector((state) => state.authentication.token);
    const [loading , setLoading] = useState(false);
    const [error , setError] = useState();
    const [success, setSuccess] = useState();
    const [date, setDate] =useState();
    const refresh = () => {
        setSuccess(null)
    }
    const {
        register,
        handleSubmit,
        formState: { errors },
      } = useForm();

      const onSubmit = async (data) => {
        var dateValue = "";
        data.business_id = location.business_id;
        data.location_id =  location.id;
        console.log(location)
        if(date){
            dateValue = date;
            // dateValue = `${date.getFullYear()}`;
        }else{
            dateValue = new Date();
        }

        data.paid_at = dateValue;
        console.log(data);
       
            console.log(data)
            setLoading(true)
            axios.post("api/business/location/add_operational_cost" , data ,{ headers: {"Authorization" : `Bearer ${token}`} } ).then((responce)=>{
                console.log(responce)
                setLoading(false)
                if(responce.status){
                    setSuccess("Cost Added  Successfully!!!");
                    
                }else{
                    setError("Error Occured While adding Cost  !!!");
                }
            }).catch((err)=>{
                console.log(err)
                setError("Error Occured While adding Cost !!!");

            })
       

      }
    return (
        <Dialog>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" size="sm" className="border-slate-200 font-medium shadow-sm">
              Add cost
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Operational Cost</DialogTitle>
              <DialogDescription className={error ? "text-rose-600" : ""}>
                {error || " "}
              </DialogDescription>
            </DialogHeader>
            {success ? 
            <div className="bg-green-500 text-white px-4 py-6 rounded-lg flex justify-between" ><h1 >{success} </h1> <RefreshCcw  onClick={refresh} /> </div>:

            <form  onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col gap-2 w-full">
                <Label>Title</Label>
                <Input {...register("title" ,{ required: true })} type="text" className="w-full" />
                {errors.title?.type === "required" && (
                <p role="alert" className="text-xs text-red-500 mt-1">
                  Title  is required!!!
                </p>
              )}
              </div>
              <div className="flex flex-col gap-2 w-full">
                <Label>Amount</Label>
                <Input {...register("amount" ,{ required: true })} type="number"  className="w-full" />
                {errors.amount?.type === "required" && (
                <p role="alert" className="text-xs text-red-500 mt-1">
                  Amount  is required!!!
                </p>
              )}
              </div>
              <div className="flex flex-col gap-2 w-full">
                <Label>Description</Label>
                <Textarea {...register("description" ,{ required: true })}  className="w-full" />
                {errors.description?.type === "required" && (
                <p role="alert" className="text-xs text-red-500 mt-1">
                  Description  is required!!!
                </p>
              )}
              </div>
              <div className="flex flex-col gap-2 w-full">
                <Label>Paid date</Label>
                <DatePickerField
                  value={date}
                  onChange={setDate}
                  placeholder="Select paid date"
                />
              </div>
             
            </div>
            <DialogFooter>
              <Button type="submit">{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Add Cost</Button>
            </DialogFooter>
            </form>
            }
           
          </DialogContent>
        </Dialog>
      )
}

export default AddCost