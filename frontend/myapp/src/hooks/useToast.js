import { useState,useCallback } from 'react';

export const useToast = () => {
  const [toast, setToast] = useState({ visible: false, message: '', type: '' });

  const showToast = useCallback((message, type = 'success') => {
    setToast({ visible: true, message, type });
  },[]);

  const hideToast = useCallback(() => {
    setToast((currentToast) => ({ ...currentToast, visible: false }));
  }, []);

  return { toast, showToast, hideToast };
};