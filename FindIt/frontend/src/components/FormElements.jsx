import React from 'react';
import { AlertCircle, Upload, X } from 'lucide-react';

const FormInput = ({ label, id, error, required = false, icon: Icon, ...props }) => {
  return (
    <div className="mb-6">
      <label htmlFor={id} className="form-label">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />}
        <input
          id={id}
          className={`input-field ${Icon ? 'pl-11' : ''} ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
          {...props}
        />
      </div>
      {error && (
        <div className="mt-2 flex items-center gap-2 text-red-600 text-sm font-medium">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
};

const FormSelect = ({ label, id, options, error, required = false, icon: Icon, ...props }) => {
  return (
    <div className="mb-6">
      <label htmlFor={id} className="form-label">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none z-10" />}
        <select
          id={id}
          className={`input-field appearance-none ${Icon ? 'pl-11' : ''} ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <svg
          className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
      {error && (
        <div className="mt-2 flex items-center gap-2 text-red-600 text-sm font-medium">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
};

const FormTextArea = ({ label, id, error, required = false, ...props }) => {
  return (
    <div className="mb-6">
      <label htmlFor={id} className="form-label">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        id={id}
        className={`input-field min-h-[120px] resize-none ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
        {...props}
      />
      {error && (
        <div className="mt-2 flex items-center gap-2 text-red-600 text-sm font-medium">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
};

const FormFileInput = ({ label, id, error, required = false, accept = 'image/*', multiple = false, onFilesChange, ...props }) => {
  const fileInputRef = React.useRef(null);
  const [dragActive, setDragActive] = React.useState(false);
  const [fileNames, setFileNames] = React.useState('');
  const [previews, setPreviews] = React.useState([]);
  const [files, setFiles] = React.useState([]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFiles(e.dataTransfer.files);
    }
  };

  const processFiles = (fileList) => {
    if (fileList && fileList.length > 0) {
      const filesArray = Array.from(fileList);
      setFiles(filesArray);
      setFileNames(filesArray.map(f => f.name).join(', '));
      
      const newPreviews = filesArray.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({
              name: file.name,
              src: reader.result,
              size: (file.size / 1024).toFixed(2)
            });
          };
          reader.readAsDataURL(file);
        });
      });
      
      Promise.all(newPreviews).then(results => {
        setPreviews(results);
      });
      
      if (onFilesChange) {
        onFilesChange(filesArray);
      }
    }
  };

  const updateFileNames = (fileList) => {
    processFiles(fileList);
  };

  const handleChange = (e) => {
    updateFileNames(e.target.files);
    props.onChange?.(e);
  };

  const removePreview = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setFiles(newFiles);
    setPreviews(newPreviews);
    setFileNames(newFiles.map(f => f.name).join(', '));
    
    if (onFilesChange) {
      onFilesChange(newFiles);
    }
  };

  return (
    <div className="mb-6">
      <label htmlFor={id} className="form-label">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
          dragActive
            ? 'border-gold-500 bg-gold-50'
            : error
            ? 'border-red-300 bg-red-50'
            : 'border-slate-300 bg-slate-50 hover:border-gold-500 hover:bg-gold-50'
        }`}
      >
        <Upload className="w-10 h-10 mx-auto mb-3 text-slate-400" />
        <p className="text-slate-700 font-semibold mb-1">
          {fileNames ? '✓ Ready to upload' : (multiple ? 'Upload images' : 'Upload image')}
        </p>
        <p className="text-slate-500 text-sm">
          Drag and drop or click to select
        </p>
        {fileNames && (
          <p className="text-green-600 text-xs mt-3 p-2 bg-green-50 rounded border border-green-200">
            ✓ {files.length} file{files.length !== 1 ? 's' : ''} selected
          </p>
        )}

        <input
          ref={fileInputRef}
          type="file"
          id={id}
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={handleChange}
          {...props}
        />
      </div>

      {previews.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-slate-700 mb-3">Selected Images ({previews.length})</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {previews.map((preview, index) => (
              <div key={index} className="relative group">
                <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-slate-100 border-2 border-slate-200">
                  <img
                    src={preview.src}
                    alt={preview.name}
                    className="w-full h-full object-cover"
                  />
                  
                  <button
                    type="button"
                    onClick={() => removePreview(index)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition"
                    title="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="mt-2">
                  <p className="text-xs text-slate-600 truncate" title={preview.name}>
                    {preview.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {preview.size} KB
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-2 flex items-center gap-2 text-red-600 text-sm font-medium">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
};

export { FormInput, FormSelect, FormTextArea, FormFileInput };
