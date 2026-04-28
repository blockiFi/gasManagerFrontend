import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form";
import  { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Loader2, RefreshCcw } from "lucide-react";
import axios from "@/lib/axios";
import { useSelector } from "react-redux";
const ChangeManager = ({users =[] , business_id , location_id , isOpen, onOpenChange }) => {
    const token = useSelector((state) => state.authentication.token);
    console.log("users")
    console.log(users)
    const {
        register,
        handleSubmit,
        formState: { errors },
      } = useForm();
      const refresh = () => {
        setSuccess(null)
    }
      const [startDate, setStartDate] = useState(new Date());
      const [loading, setLoading] = useState(false);
      const [success, setSuccess] = useState();
      const [error, setError] = useState();
      const onSubmit = async (data) => {   
        data.business_id = business_id;
        data.location_id = location_id;
        console.log(data)
            
                setLoading(true)
                axios.post("api/business/location/change_manager" , data ,{ headers: {"Authorization" : `Bearer ${token}`} } ).then((responce)=>{
                    console.log(responce)
                    setLoading(false);
                    if(responce.status){
                        setSuccess("Manager Changed Successfully!!!");
                       
                        setLoading(false);
                    }else{
                        setError("Error Occured While Changing Manager!!!");
                        setLoading(false);
                    }
                }).catch((error)=>{
                    console.log(error)
                    setError("Error Occured While Changing Manager!!!");
                    setLoading(false);

                })
           
           
        
      }


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
   
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Change Manager</DialogTitle>
        {error && <DialogDescription>{error}</DialogDescription>}
      </DialogHeader>
      <div className="flex flex-col gap-2">
      {users.lenght === 0 ? 
       <p className="text-red-500">No Users </p> :
      
       <>
       {success ? 
       <div className="bg-green-500 text-white px-4 py-6 rounded-lg flex justify-between" ><h1 >{success} </h1> <RefreshCcw  onClick={refresh} /> </div>
        :
        <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col   mt-5">
              <h2>Select Manager *</h2>
              <select {...register("user_id" ,{ required: true })}  className="border py-2 rounded-lg pl-2">
                {users?.map((user) => {
                
                    return (<option value={user.user.id} key={user.user.id}>{user.user.name}</option>)
                })}                
            </select>

              
              {errors.user_id?.type === "required" && (
                <p role="alert" className="text-xs text-red-500 mt-1">
                  Select a new Manager
                </p>
              )}
            </div>
        

            <div className="flex justify-end mt-4"><Button className="bg-blue-500">{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Change Manager</Button></div>
       </form>
        }
       </>
      
        }
      </div>
      
    </DialogContent>
  </Dialog>
  )
}

export default ChangeManager