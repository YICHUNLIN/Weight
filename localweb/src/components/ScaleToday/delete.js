import * as React from 'react';
import { DialogsProvider, useDialogs } from '@toolpad/core/useDialogs';
import Button from '@mui/material/Button';

function Content({onDelete}) {
  const dialogs = useDialogs();
  return (
    <div>
      <Button
        color="error"
        onClick={async () => {
          // preview-start
          const confirmed = await dialogs.confirm('是否刪除?', {
            okText: 'Yes',
            cancelText: 'No',
          });
          if (confirmed) {
            onDelete()
          }
          // preview-end
        }}
      >
        刪除
      </Button>
    </div>
  );
}

export default function DeleteDialog({onDelete}) {
  return (
    <DialogsProvider>
      <Content onDelete={onDelete}/>
    </DialogsProvider>
  );
}