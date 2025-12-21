import { useState } from 'react';
import axios from 'axios';

const useFileUpload = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const uploadFiles = async (files) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('images', file);
      });

      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error uploading files');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { uploadFiles, isLoading, error };
};

export default useFileUpload;