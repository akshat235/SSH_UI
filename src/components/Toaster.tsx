import * as Toast from '@radix-ui/react-toast';
import React, { useState } from 'react';

const Toaster: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <Toast.Provider swipeDirection="right">
      

      <Toast.Root 
        open={open} 
        onOpenChange={setOpen}
        className="bg-gray-800 text-white p-4 rounded shadow-lg"
      >
        <Toast.Title className="font-bold">Notification Title</Toast.Title>
        <Toast.Description>This is a notification description.</Toast.Description>
        <Toast.Close className="text-red-500 ml-auto">Close</Toast.Close>
      </Toast.Root>

      <Toast.Viewport className="fixed bottom-5 right-5 w-[320px]" />
    </Toast.Provider>
  );
};

export default Toaster;
