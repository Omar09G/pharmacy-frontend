import { useState } from 'react';

export function useCrudModal<T>() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);

  const openCreate = () => {
    setEditing(null);
    setOpen(true);
  };

  const openEdit = (item: T) => {
    setEditing(null); // reset first
    setTimeout(() => {
      setEditing(item);
      setOpen(true);
    }, 0);
  };

  const close = () => {
    setOpen(false);
    setEditing(null);
  };

  return { open, editing, openCreate, openEdit, close };
}
