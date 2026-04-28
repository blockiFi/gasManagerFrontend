import React from 'react'
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
  } from "@/components/ui/sheet"
  import SideBar from "./SideBar"
   
const MiniSideBar = ({open , onClose}) => {
    return (
        <Sheet open={open} onOpenChange={onClose} >
          <SheetContent side="left" className="w-[230px] sm:w-[270px] bg-slate-900 text-white p-0 m-0 ">
            
          <SideBar />
          </SheetContent>
        </Sheet>
      )
}

export default MiniSideBar