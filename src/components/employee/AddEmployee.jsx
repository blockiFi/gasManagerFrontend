"use client"
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
import { Loader2, RefreshCcw } from "lucide-react";
import axios from "@/lib/axios";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

// eslint-disable-next-line react/prop-types
const AddEmployee = ({business_id}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const token = useSelector((state) => state.authentication.token);
    
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
        setError("")
    }
      const onSubmit = async (data) => {
        
        data.business_id = business_id;
        console.log(data)
        
            console.log(data)
            setLoading(true)
           try {
            axios.post("api/business/users/add_employee" , data ,{ headers: {"Authorization" : `Bearer ${token}`} } ).then((responce)=>{
               
                console.log(responce)
                setLoading(false)
                setError("");
                if(responce.status){
                    setSuccess("Employee Added Successfully!!!");
                    navigate(location.pathname, { replace: true });
                }else{
                    setLoading(false);
                    setError("Error Occured While Adding Employee  !!!");
                }
            }).catch((err)=>{
                console.log(err)
                setLoading(false);
                setError("Error Occured While Adding Employee !!!");

            })
           } catch (err) {
            console.log(err)
           }
        


      }

      return (
        <Dialog>
          <DialogTrigger asChild>
            <Button type="button" size="sm" className="bg-indigo-600 font-medium hover:bg-indigo-700">
              Add user
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl sm:max-w-[425px]">
            <DialogHeader>
            <DialogTitle className="text-xl font-semibold tracking-tight">Add user</DialogTitle>
              {error ? (
                <DialogDescription className="text-rose-600">{error}</DialogDescription>
              ) : (
                <DialogDescription className="text-slate-500">
                  Create an account for a new team member. They can sign in with this email and password.
                </DialogDescription>
              )}
            </DialogHeader>
            {success ? 
            <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-emerald-900" ><p className="text-sm font-semibold">{success}</p> <RefreshCcw className="h-4 w-4 shrink-0 cursor-pointer" onClick={refresh} /> </div>:

            <form  onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-2">
              <div className="flex flex-col gap-2 w-full">
                <Label className="text-slate-700">Name</Label>
                <Input {...register("name" ,{ required: true })} type="text" className="w-full border-slate-200" />
                {errors.name?.type === "required" && (
                <p role="alert" className="text-xs text-red-500 mt-1">
                  Name is required!!!
                </p>
              )}
              </div>
              <div className="flex flex-col gap-2 w-full">
                <Label className="text-slate-700">Email</Label>
                <Input {...register("email" ,{ required: true })} type="email" className="w-full border-slate-200" autoComplete="off" />
                {errors.email?.type === "required" && (
                <p role="alert" className="text-xs text-red-500 mt-1">
                  Email is required!!!
                </p>
              )}
              </div>
              <div className="flex flex-col gap-2 w-full">
                <Label className="text-slate-700">Password</Label>
                <Input {...register("password" ,{ required: true })} type="password" className="w-full border-slate-200" autoComplete="new-password" />
                {errors.password?.type === "required" && (
                <p role="alert" className="text-xs text-red-500 mt-1">
                  Password is required!!!
                </p>
              )}
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> : null}
                {loading ? "Adding…" : "Add user"}
              </Button>
            </DialogFooter>
            </form>
            }
           
          </DialogContent>
        </Dialog>
      )
}

export default AddEmployee