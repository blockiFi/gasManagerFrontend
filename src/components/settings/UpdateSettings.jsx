import { Input } from '../ui/input'
import { Button } from '../ui/button'
import {  toast } from 'react-toastify';
import { useState } from 'react'
import 'react-toastify/dist/ReactToastify.css';
import { Loader2 } from 'lucide-react';
import axios from '@/lib/axios';
import { Checkbox } from '../ui/checkbox';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import usePermissions from '@/hooks/usePermissions';
import { CAPABILITIES } from '@/lib/permissions';

const UpdateSetting = ({setting}) => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState();
    const [error, setError] = useState();
  const   [value , setInputValue] = useState(setting.value.value)
  const [isChecked, setIsChecked] = useState(setting.value.value);
  const navigate = useNavigate();
  const url = useLocation();
  const token = useSelector((state) => state.authentication.token);
  const { can } = usePermissions();
  const canUpdate = can(CAPABILITIES.SETTINGS_UPDATE);

  
    const updateSettings = () => {
        // 
        var data = {}
       
        data.setting_id =  setting.value.id;
        data.business_id = setting.value.business_id;
        if(setting.type == 'number'){
            data.value = value;
        }else if(setting.type == 'boolean'){
            if(setting.value.value == 'true'){
                data.value = 'false';
            }else{
                data.value = 'true'; 
            }
           
        }
        
        console.log(setting);

    
            console.log(data)
            setLoading(true)
            axios.post("api/get_business/settings/update_settings" , data ,{ headers: {"Authorization" : `Bearer ${token}`} } ).then((responce)=>{
                console.log(responce)
                setLoading(false)
                if(responce.status){
                    setSuccess("Setting Updated Successfully!!!");
                    toast.success("Setting Updated Successfully!!!");
                    navigate(location.pathname, { replace: true });
                }else{
                    setLoading(false)
                    setError("Error Occured While updating Setting!!!");
                    toast.error("Error Occured While updating Setting!!!")
                }
            }).catch((error)=>{
                console.log(error)
                setLoading(false)
                setError("Error Occured While updating Setting!!!");
                toast.error("Error Occured While updating Setting!!!");

            })
       
    }
    const handleInputChange = (e) => {
        setInputValue(e.target.value);
      };

    const handleCheckboxChange = (checked) => {
        setIsChecked(checked);
        console.log("Checkbox value:", checked);
    };

      const DisplayInput = () => {
        if(setting.type == 'number'){
            return canUpdate ? (
              <Input type="number" value={value} onChange={handleInputChange} />
            ) : (
              <span className="tabular-nums text-slate-800">{value}</span>
            )
        }else if(setting.type == 'boolean'){
           
            if(setting.value.value === 'true') {
                return (<p className='bg-green-600 text-white rounded-md pt-2 px-2'>Activated</p>)
            }else{
                return (<p className='bg-red-600 text-white rounded-md pt-2 px-2'>Deactivated</p>)
            }
        }
    }
  return (
    <div className='flex gap-4 justify-between'>
        {
            DisplayInput()
        }
        {canUpdate ? (
          <Button onClick={updateSettings}>{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}update </Button>
        ) : null}
    </div>
  )
}

export default UpdateSetting