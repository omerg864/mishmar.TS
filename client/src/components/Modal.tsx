import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';


interface IProps {
    open: boolean;
    closeModal: React.MouseEventHandler<HTMLButtonElement>;
    confirmButton: React.MouseEventHandler<HTMLButtonElement>;
    textContent: string;
    children: React.ReactNode;
    confirmButtonText: string;
}

export default function Modal(props: IProps) {

  return (
    <div>
      <Dialog open={props.open} onClose={props.closeModal}>
        <DialogTitle>Subscribe</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {props.textContent}
          </DialogContentText>
          {props.children}
        </DialogContent>
        <DialogActions>
          <Button color="error" onClick={props.closeModal}>Cancel</Button>
          <Button onClick={props.confirmButton}>{props.confirmButtonText}</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}