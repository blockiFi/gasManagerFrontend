import React, { useState } from 'react'
import LocationCard from './LocationCard'
import { MoreVertical } from 'lucide-react'

const BusinessLocations = ({ businessLocation ,businessUsers}) => {

  const [dropdownOpen, setDropdownOpen] = useState(null)
  const toggleDropdown = (index) => {
    if (dropdownOpen === index) {
      setDropdownOpen(null)
    } else {
      setDropdownOpen(index)
    }
  }
    if(!businessLocation.success){
        return <p>{businessLocation.error}</p>
      }
      console.log("businessUsers")
      console.log(businessUsers)
      return (
        // <div className="grid lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-2 grid-cols-1 mt-10 gap-2" >
        //     {businessLocation.data.map((location) => {
        //         return (<LocationCard key={location.id} location={location} users={businessUsers.data}/>)
        //     })}
           
        // </div>
        
        <>
        <h2 className="text-xl font-semibold mb-4">Locations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
           {businessLocation.data.map((location) => {
              return (<LocationCard key={location.id} location={location} users={businessUsers.data}/>)
            })}
           
        </div>
        
        
        </>

      )
}

export default BusinessLocations