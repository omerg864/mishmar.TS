import * as React from 'react';
import { Button, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle} from '@mui/material';


interface IProps {
    open: boolean;
    closeModal: () => void;
    confirmButton: (e: any) => void;
    textContent: string;
    children: React.ReactNode;
    confirmButtonText: string;
    title: string;
    noButtonText: string;
    noButton: (e: any) => void;
}

export default function OptionsModal(props: IProps) {

  return (
    <div>
      <Dialog open={props.open} onClose={props.closeModal}>
        <DialogTitle>{props.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {props.textContent}
          </DialogContentText>
          {props.children}
        </DialogContent>
        <DialogActions>
        <Button onClick={props.confirmButton} value={"true"} >{props.confirmButtonText}</Button>
          <Button color="error" onClick={props.noButton} value={"false"} >{props.noButtonText}</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}