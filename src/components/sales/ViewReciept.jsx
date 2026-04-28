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
import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import { Button } from "../ui/button";
import { useSelector } from "react-redux";
const ViewReciept = ({businessID , locationID , salesID}) => {
    const [receipts , SetReceipts] = useState([])
    const [error ,setError] = useState();
    const token = useSelector((state) => state.authentication.token);
    const zoomProps = {
       zoomWidth: 500, // Width of the zoomed image
        imgAlt: 'Zoomed Image',
        className: 'image-zoom'
    };


     useEffect(()=> {
     
     const body = {
        'business_id' : businessID,
        'location_id' : locationID,
        'sales_id' : salesID
    }
    console.log(body)

      axios.post('api/business/sales/get_reciept' , 
         body
        ,{ headers: {"Authorization" : `Bearer ${token}`} }).then((response)=> {
            console.log(response)
            if(response.status === 200){
                SetReceipts(response.data.data);
             }else{
                setError("Error while get receipts ")
             }
        })
    } 
      ,[])
      
  return (
 

        <Dialog>
    <DialogTrigger asChild>
      <Button className="text-sm ">View Sales Reciept</Button>
    </DialogTrigger>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Sales Reciept</DialogTitle>
             </DialogHeader>
      <div>{
        receipts.length > 0 ? 
        <div className="grid grid-cols-2 gap-2">

           { receipts.map((receipt ,index) => {
            return <Zoom key={index}>
            <img  
            src={`${import.meta.env.VITE_API_URL}storage/${receipt.image_path}`}
            alt={receipt.image_path}
            
            /> </Zoom>
        }) }
        </div>
        :
        <h1 className='text-red-500'>
            {
                error
            }
        </h1>
        }
        
        </div>
      
    </DialogContent>
  </Dialog>
  )
}

export default ViewReciept