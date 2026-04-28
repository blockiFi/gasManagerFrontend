import React from "react"
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet"
import SideBar from "./SideBar"

const MiniSideBar = ({ open, onOpenChange }) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[260px] bg-white p-0">
        <SideBar handleClose={() => onOpenChange(false)} />
      </SheetContent>
    </Sheet>
  )
}

export default MiniSideBar