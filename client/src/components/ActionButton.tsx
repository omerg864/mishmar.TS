import * as React from 'react';
import { Backdrop, SpeedDial, SpeedDialIcon, SpeedDialAction} from '@mui/material';

interface IProps {
  actions: {icon: React.ReactNode|Element, name: string, onClick: () => void }[];
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ActionButton(props: IProps) {

  return (
    <>
      <Backdrop open={props.open} />
      <SpeedDial
        ariaLabel="SpeedDial tooltip example"
        sx={{ position: 'absolute', top: 130, right: 20 }}
        icon={<SpeedDialIcon />}
        onClose={() => props.setOpen(false)}
        onOpen={() => props.setOpen(true)}
        open={props.open}
        direction="down"
      >
        {props.actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon as React.ReactNode}
            onClick={action.onClick}
            tooltipOpen
            tooltipTitle={action.name}
            tooltipPlacement="left"
          />
        ))}
      </SpeedDial>
      </>
  );
}