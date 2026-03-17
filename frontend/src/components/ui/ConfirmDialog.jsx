import {AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay, Button} from "@chakra-ui/react"
import {useRef} from "react"

export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title = "Are you sure?",
    message = "This action can not be undone.",
    confirmText = "Delete"
}){
    const cancelRef = useRef(null)

    return (
        <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
            <AlertDialogOverlay>
                <AlertDialogContent borderRadius="xl" p={4} boxShadow="soft">
                    <AlertDialogHeader fontSize="lg" fontWeight="bold">
                        {title}
                    </AlertDialogHeader>

                    <AlertDialogBody>{message}</AlertDialogBody>

                    <AlertDialogFooter>
                        <Button variant="ghost" fontWeight="600" ref={cancelRef} onClick={onClose}>Cancel</Button>
                        <Button variant="solid" onClick={onConfirm} ml={3}>{confirmText}</Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    )
}