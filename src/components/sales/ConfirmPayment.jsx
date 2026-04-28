import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import axios from '@/lib/axios'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Button } from '../ui/button'
import Dialog from './Dialog'

const ConfirmPayment = ({salesID ,businessID ,  locationID}) => {

    const navigate = useNavigate();
    const location = useLocation();
    const token = useSelector((state) => state.authentication.token);
    const [loading , setLoading] = useState(false);
    const [openDialog , setOpenDialog] = useState(false);
    const [error , SetError] = useState([]);

    
    const handleCloseDialog = () => {
        SetOpenDialog(false);
      };

    const confirm = ()=>{
        const body = {
            'sales_id' : salesID,
            'business_id' : businessID,
            'location_id' : locationID
        }
        try {
         
            setLoading(true)
            axios.post("/api/business/sales/confirm_sales" , body , {headers: {
                'Content-Type': 'multipart/form-data',
                "Authorization" : `Bearer ${token}`
              }} ).then((response)=> {
                if(response.status == 200){
                    
                    navigate(location.pathname, { replace: true });

                }else{
                    setLoading(false)
                    setError(response.data.errors);
                    setOpenDialog(true);
                }
              })
          
        } catch (error) {
            console.log(error)
            setError(["Error occured while confirming"])
            setOpenDialog(true);
        }


    }
  return (
    <>
    <Dialog
          open={openDialog} 
          data = {error}
          title="Confirmation Error"
          closeText="Ok"
          closeDialog={handleCloseDialog}

           />
    <Button className="bg-green-400 hover:bg-green-300"  onClick={confirm} > {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{" "} confirm Payment </Button>

    </>
  )
}

export default ConfirmPayment