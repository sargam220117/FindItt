import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FormInput, FormSelect, FormTextArea, FormFileInput } from '../components/FormElements';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import useFileUpload from '../hooks/useFileUpload';
import { AlertCircle, Tag, CheckCircle, Loader } from 'lucide-react';

const NewItem = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { uploadFiles, isLoading: isUploading } = useFileUpload();

  const searchParams = new URLSearchParams(location.search);
  const categoryFromUrl = searchParams.get('category');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: categoryFromUrl || 'Lost',
    itemCategory: 'Electronics',
    location: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [files, setFiles] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    isUploading: false,
    completed: 0,
    total: 0,
    currentFile: ''
  });
  const [imagePrivacy, setImagePrivacy] = useState({
    isPrivate: true,
    allowedUsers: []
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleFileChange = (selectedFiles) => {
    setFiles(selectedFiles);
    setUploadedImages([]);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      let imageUrls = [];
      if (files.length > 0) {
        try {
          setUploadProgress({
            isUploading: true,
            completed: 0,
            total: files.length,
            currentFile: files[0]?.name || 'Uploading...'
          });

          const uploadPromises = files.map((file, index) =>
            uploadFiles([file])
              .then(urls => {
                setUploadProgress(prev => ({
                  ...prev,
                  completed: prev.completed + 1,
                  currentFile: files[index + 1]?.name || 'Completing...'
                }));
                return urls[0];
              })
          );

          const results = await Promise.all(uploadPromises);
          imageUrls = results.filter(Boolean);

          setUploadedImages(imageUrls);

          console.log('Uploaded images:', imageUrls);

          if (!Array.isArray(imageUrls)) {
            imageUrls = [imageUrls];
          }
        } catch (uploadErr) {
          console.error('Upload error:', uploadErr);
          setError('Failed to upload images. Please try again.');
          setIsSubmitting(false);
          setUploadProgress({ isUploading: false, completed: 0, total: 0, currentFile: '' });
          return;
        }
      }

      setUploadProgress({ isUploading: false, completed: 0, total: 0, currentFile: '' });

      const itemData = {
        ...formData,
        images: imageUrls,
        imagePrivacy: imagePrivacy,
        status: 'open'
      };

      console.log('Creating item with data:', itemData);
      const response = await axios.post('/api/items', itemData);

      if (response.data && response.data._id) {
        navigate(`/items/${response.data._id}`);
      } else {
        setError('Item created but missing ID');
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create item');
      setIsSubmitting(false);
      setUploadProgress({ isUploading: false, completed: 0, total: 0, currentFile: '' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-4xl font-black text-deep-900 dark:text-white mb-2">Post a New Item</h1>
        <p className="text-slate-600 dark:text-slate-300 mb-8">Help reunite items with their owners or report what you've found</p>

        {error && (
          <Card className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 mb-6">
            <div className="p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-700 dark:text-red-300 font-semibold">Error</p>
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            </div>
          </Card>
        )}

        <Card hoverable>
          <div className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <FormInput
                label="Item Name"
                type="text"
                id="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g., Silver iPhone 13"
              />

              <FormTextArea
                label="Description"
                id="description"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Provide detailed information about the item, any distinctive marks, where it was lost/found, etc."
              />

              <FormSelect
                label="Status"
                id="category"
                value={formData.category}
                onChange={handleChange}
                required
                options={[
                  { value: 'Lost', label: 'Lost Item' },
                  { value: 'Found', label: 'Found Item' }
                ]}
              />

              <FormSelect
                label="Item Category"
                id="itemCategory"
                value={formData.itemCategory}
                onChange={handleChange}
                required
                options={[
                  { value: 'Electronics', label: 'Electronics' },
                  { value: 'Clothing', label: 'Clothing' },
                  { value: 'Accessories', label: 'Accessories' },
                  { value: 'Documents', label: 'Documents' },
                  { value: 'Keys', label: 'Keys' },
                  { value: 'Bags', label: 'Bags' },
                  { value: 'Others', label: 'Others' }
                ]}
              />

              <FormInput
                label="Location"
                type="text"
                id="location"
                value={formData.location}
                onChange={handleChange}
                required
                placeholder="Where was it lost/found? (e.g., Central Park)"
              />

              <FormInput
                label="Date"
                type="date"
                id="date"
                value={formData.date}
                onChange={handleChange}
                required
              />

              <FormFileInput
                label="Upload Images"
                id="images"
                onFilesChange={handleFileChange}
                accept="image/*"
                multiple
                required
              />

              <Card className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <div className="p-4">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-4">Image Privacy Settings</h3>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="isPrivate"
                        checked={imagePrivacy.isPrivate}
                        onChange={(e) => setImagePrivacy(prev => ({
                          ...prev,
                          isPrivate: e.target.checked
                        }))}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <label htmlFor="isPrivate" className="text-blue-900 dark:text-blue-200 font-medium flex-1">
                        Make images private
                      </label>
                      <span className="text-xs text-blue-700 dark:text-blue-300">
                        {imagePrivacy.isPrivate ? 'Images will be blurred' : 'Images are public'}
                      </span>
                    </div>

                    {imagePrivacy.isPrivate && (
                      <div className="pl-7 pt-2 border-t border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                          Only you can see clear images. Others will see blurred versions and can temporarily reveal them if you approve.
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-300 italic">
                          💡 Tip: Keep images private for found items to prevent false claims or for sensitive lost items.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {uploadProgress.isUploading && (
                <Card className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Loader className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
                      <div>
                        <p className="text-blue-700 dark:text-blue-300 font-semibold">Uploading Images</p>
                        <p className="text-blue-600 dark:text-blue-300 text-sm">{uploadProgress.currentFile}</p>
                      </div>
                    </div>
                    <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                      <div
                        className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(uploadProgress.completed / uploadProgress.total) * 100}%` }}
                      />
                    </div>
                    <p className="text-blue-600 dark:text-blue-300 text-xs mt-2">
                      {uploadProgress.completed} of {uploadProgress.total} images uploaded
                    </p>
                  </div>
                </Card>
              )}

              {uploadedImages.length > 0 && !uploadProgress.isUploading && (
                <Card className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <div className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-green-700 dark:text-green-300 font-semibold">Images Uploaded Successfully</p>
                        <p className="text-green-600 dark:text-green-400 text-sm">{uploadedImages.length} image{uploadedImages.length !== 1 ? 's' : ''} ready to be posted</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                      {uploadedImages.map((imageUrl, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={imageUrl}
                            alt={`Uploaded ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg border border-green-300 dark:border-green-700"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="flex-1"
                  loading={isSubmitting || isUploading}
                >
                  {isSubmitting || isUploading ? 'Posting...' : 'Post Item'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default NewItem;