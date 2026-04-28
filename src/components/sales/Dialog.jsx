import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"
import { Button } from "../ui/button"
  
const Dialog = ({open , closeDialog , data  , title , closeText}) => {
  return (
    <AlertDialog open={open}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>{title}</AlertDialogTitle>
      <AlertDialogDescription>
        {data.map(value => {
            console.log(value)
            return <p className="text-red-500">{value}</p>
        })}
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <Button  onClick={closeDialog}>{closeText}</Button>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
  )
}

export default Dialog