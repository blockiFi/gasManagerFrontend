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
import { useSelector } from "react-redux";
const ResetPassword = ({user}) => {
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
    }
      const onSubmit = async (data) => {

        data.business_id = user.business_id;
        data.user_id =  user.user_id;
        console.log(data)
        
            console.log(data)
            setLoading(true)
            axios.post("api/business/users/reset_password" , data ,{ headers: {"Authorization" : `Bearer ${token}`} } ).then((responce)=>{
                console.log(responce)
                setLoading(false)
                if(responce.status){
                    setSuccess("Password Set Successfully!!!");
                }else{
                    setError("Error Occured While Setting Password  !!!");
                }
            }).catch((error)=>{
                console.log(error)
                setError("Error Occured While Setting Password !!!");

            })
        


      }

      return (
        <Dialog>
          <DialogTrigger asChild>
            <Button >Reset Password</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
              <DialogDescription>
                
                {error && {error}}
                
              </DialogDescription>
            </DialogHeader>
            {success ? 
            <div className="bg-green-500 text-white px-4 py-6 rounded-lg flex justify-between" ><h1 >{success} </h1> <RefreshCcw  onClick={refresh} /> </div>:

            <form  onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col gap-2 w-full">
                <Label> Password</Label>
                <Input {...register("password" ,{ required: true })} type="text" className="w-full" />
                {errors.password?.type === "required" && (
                <p role="alert" className="text-xs text-red-500 mt-1">
                  Password Value is required!!!
                </p>
              )}
              </div>
             
            </div>
            <DialogFooter>
              <Button type="submit">{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Set Password</Button>
            </DialogFooter>
            </form>
            }
           
          </DialogContent>
        </Dialog>
      )
}

export default ResetPassword