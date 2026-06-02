 
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
 

  import { useState } from "react"
  import { HamburgerMenuIcon } from "@radix-ui/react-icons"
import ChangeManager from "./ChangeManager"
import Can from "@/components/Auth/Can"
import { CAPABILITIES } from "@/lib/permissions"

const LocationSettingDropdown =({users , business_id , location_id}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleItemClick = () => {
      setTimeout(() => {
        setIsDialogOpen(true);  // Open the dialog after dropdown closes
      }, 100);  // Adding a slight delay to ensure dropdown closes first
    };
   
      const toggleDropdown = () => {
        setIsOpen(!isOpen); // Toggle dropdown visibility
      };
  return (
    <Can capability={CAPABILITIES.LOCATION_CHANGE_MANAGER}>
    <>
    <div  className='text-white'>
    <DropdownMenu  >
        <DropdownMenuTrigger  asChild>
          <HamburgerMenuIcon  />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel >Settings</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleItemClick}
          >
            Change Manager
          
          </DropdownMenuItem>
          
        </DropdownMenuContent>
      </DropdownMenu>
      <ChangeManager users={users} business_id={business_id} location_id={location_id} isOpen={isDialogOpen} onOpenChange={setIsDialogOpen}  />
    </div>
    </>
    </Can>
  )
}

export default LocationSettingDropdown