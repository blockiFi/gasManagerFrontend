
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
import { useNavigate, useLocation } from 'react-router-dom';
const Addlocation = ({business_id , users}) => {
    const token = useSelector((state) => state.authentication.token);
    const navigate = useNavigate();
    const location = useLocation();
    console.log(users);
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
        data.business_id = business_id;
        console.log("data")
        console.log(data)

            setLoading(true)
            axios.post("api/business/add_location" , data ,{ headers: {"Authorization" : `Bearer ${token}`} } ).then((responce)=>{
                console.log(responce)
                setLoading(false)
                if(responce.status){
                    setSuccess("Location Added Successfully!!!");
                    navigate(location.pathname, { replace: true });
                }else{
                    setError("Error Occured While Adding Location  !!!");
                }
            }).catch((error)=>{
                console.log(error)
                setError("Error Occured While Adding Location  !!!");

            })
       


      }

      return (
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 hover:scale-100">
              <Plus className="mr-2 h-4 w-4" />
              Add Location
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Location</DialogTitle>
              <DialogDescription>
                
                {error && {error}}
                
              </DialogDescription>
            </DialogHeader>
            {success ? 
            <div className="bg-green-500 text-white px-4 py-6 rounded-lg flex justify-between" ><h1 >{success} </h1> <RefreshCcw  onClick={refresh} /> </div>:

            <form  onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col gap-2 w-full">
                <Label>Location Name</Label>
                <Input {...register("name" ,{ required: true })} type="text" className="w-full" />
                {errors.name?.type === "required" && (
                <p role="alert" className="text-xs text-red-500 mt-1">
                  Name  is required!!!
                </p>
              )}
              </div>
              <div className="flex flex-col gap-2 w-full">
                <Label>Location Address</Label>
                <Textarea {...register("address" ,{ required: true })}  className="w-full" />
                {errors.address?.type === "required" && (
                <p role="alert" className="text-xs text-red-500 mt-1">
                  Address  is required!!!
                </p>
              )}
              </div>
              <div className="flex flex-col   mt-5">
              <h2>Select Manager *</h2>
              <select {...register("user_id" ,{ required: true })}  className="border py-2 rounded-lg pl-2">
                {users?.map((user) => {
                
                    return (<option value={user.user.id} key={user.user.id}>{user.user.name} - ({user.user.email})</option>)
                })}                
            </select>

              
              {errors.user_id?.type === "required" && (
                <p role="alert" className="text-xs text-red-500 mt-1">
                  Select  location Manager
                </p>
              )}
            </div>
            </div>
            <DialogFooter>
              <Button type="submit">{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Add Location</Button>
            </DialogFooter>
            </form>
            }
           
          </DialogContent>
        </Dialog>
      )

}

export default Addlocation