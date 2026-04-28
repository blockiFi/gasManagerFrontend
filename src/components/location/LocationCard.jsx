import { useNavigate } from 'react-router-dom';
import LocationSettingDropdown from './LocationSettingDropdown';
const LocationCard = ({location , users = []}) => {
    console.log("users2")
    console.log(users)
    const navigate = useNavigate(); 
    return (
      <div className='bg-white w-full relative h-44 rounded-3xl  flex flex-col'  >
          
          <div className="flex flex-col  py-5 px-5 " onClick={() => {navigate(`/dashboard/location/${location.id}`)}}>
          <h1 className='font-bold text-lg'>{location.name}</h1>
          <h1 className='text-sm'>{location.address}</h1>
           {/* <div className="flex justify-end pr-2 ">
              <h1><span className="text-green-500 text-sm  ">Total Sale: #5050505 </span> </h1>
          </div> */}
          </div>
         
           <div className=' absolute  w-full bottom-0 p-2 bg-green-500  font-bold flex justify-between rounded-b-2xl'><span>Manager</span>   <span className='text-white'>{location.manager.name}</span>
            <LocationSettingDropdown  users={users} location_id ={location.id} business_id={location.business_id} />
            </div>
           
      </div>
    )
  }
  
  export default LocationCard