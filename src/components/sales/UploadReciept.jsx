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
import { useState } from "react";
import axios from "@/lib/axios";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button } from "../ui/button";
import {  toast } from 'react-toastify';

const UploadReciept = ({salesID , businessID , locationID}) => {

    const navigate = useNavigate();
    const location = useLocation();
    const token = useSelector((state) => state.authentication.token);
    const [success, setSuccess] = useState();
    const [errors, setErrors] = useState();
    const [files, setFiles] = useState([]);


    const [filePreviews, setFilePreviews] = useState([]);
    
    const handleFileChange = (event) => {
        const selectedFiles = Array.from(event.target.files);
        setFiles(selectedFiles);

        // Generate previews for image files
        const previewsArray = selectedFiles.map(file => {
            return URL.createObjectURL(file);
        });
        setFilePreviews(previewsArray);

      };

      const handleUpload = async () => {
      
      
        const formData = new FormData();

        for (let i = 0; i < files.length; i++) {
            formData.append('files[]', files[i]);
        }
        formData.append('business_id', businessID);
        formData.append('location_id', locationID);
        formData.append('sales_id', salesID);


     
        try {
            const response = await axios.post('/api/business/sales/upload_reciept', formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
                "Authorization" : `Bearer ${token}`
              },
            });
            console.log('Files uploaded successfully:', response.data);
            if(response.status == 200){
                setSuccess("Sales Reciept Added  Successfully!!!");
                toast.success("Sales Reciept Added  Successfully!!!")
                navigate(location.pathname, { replace: true });
                setErrors([])
               
            }else{
                setErrors(response.data.errors);
                toast.success("Error Uploading Sales Reciept")
            }

          } catch (error) {
            toast.success("Error Uploading Sales Reciept")
            console.error('Error uploading files:', error.response.data.errors);
            setErrors(error.response.data.errors);
          }
       


      }
  return (
    
    <Dialog>
    <DialogTrigger asChild>
      <Button className="text-sm ">Upload Sales Reciept</Button>
    </DialogTrigger>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Upload Sales Reciept</DialogTitle>
        {errors && <DialogDescription>
            {errors.map(error => {
                return (<h1 className="text-red-500 text-xs">{error}</h1>)
            })}
            </DialogDescription>}
      </DialogHeader>
      {success ? 
       <h1 className="bg-green-500 text-white px-4 py-6 rounded-lg">{success}</h1> :

      <div className="flex flex-col gap-2">
       <label>Select Reciept</label>
       <input type='file' multiple onChange={handleFileChange}/>
       <div className="grid grid-cols-2 gap-2 border border-green-400 py-10 px-4 rounded-lg">
        {filePreviews.map((preview, index) => (
          <div key={index} style={{ marginRight: '10px' }}>
            <img
              src={preview}
              alt={`Preview ${index}`}
              style={{ width: '100px', height: '100px', objectFit: 'cover' }}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <Button className="bg-green-500" onClick={handleUpload} >Upload</Button>
      </div>
      </div>
    }
      
    </DialogContent>
  </Dialog>
  )
}

export default UploadReciept