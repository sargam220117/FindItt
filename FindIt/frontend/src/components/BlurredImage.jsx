import { useState, useEffect } from 'react';
import { EyeOff } from 'lucide-react';
import axios from 'axios';

const BlurredImage = ({ 
  src, 
  alt, 
  item, 
  currentUserId, 
  className = "w-full h-48 object-cover rounded-t-lg",
  onRequestAccessClick = null
}) => {
  const [requestStatus, setRequestStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(false);

  const isUploader = currentUserId?.toString() === item.user?._id?.toString();

  const isPrivate = item.imagePrivacy?.isPrivate;
  
  const isApproved = item.approvedUsers?.some(approvedUser => {
    const approvedIdStr = approvedUser?._id?.toString?.() || approvedUser?.toString?.() || String(approvedUser);
    const currentIdStr = currentUserId?.toString?.() || String(currentUserId);
    const match = approvedIdStr === currentIdStr;
    if (match) {
      console.log('✅ User is approved! Current:', currentIdStr, 'Approved:', approvedIdStr);
    }
    return match;
  }) || false;

  const shouldBlur = isPrivate && !isUploader && !isApproved;

  useEffect(() => {
    console.log('🖼️ BlurredImage State:', {
      currentUserId: currentUserId?.toString?.() || currentUserId,
      uploaderId: item.user?._id?.toString?.() || item.user?._id,
      isUploader,
      isPrivate,
      approvedUsers: item.approvedUsers?.map(u => u?._id?.toString?.() || u?.toString?.() || u),
      isApproved,
      shouldBlur
    });
  }, [currentUserId, item.user?._id, isUploader, isPrivate, item.approvedUsers, isApproved, shouldBlur]);

  useEffect(() => {
    if (currentUserId && !isUploader && isPrivate) {
      const fetchRequestStatus = async () => {
        try {
          setLoadingStatus(true);
          const response = await axios.get(`/api/access-requests/status/${item._id}`);
          setRequestStatus(response.data);
        } catch (err) {
          console.error('Failed to fetch request status:', err);
        } finally {
          setLoadingStatus(false);
        }
      };
      fetchRequestStatus();
      
      const interval = setInterval(fetchRequestStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [currentUserId, isUploader, isPrivate, item._id]);

  return (
    <div className="relative overflow-hidden group">
      <img
        src={src}
        alt={alt}
        className={`${className} ${
          shouldBlur ? 'blur-2xl' : ''
        } transition-all duration-300`}
      />

      {shouldBlur && (
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center group-hover:bg-opacity-40 transition-all duration-300">
          <div className="bg-white bg-opacity-95 px-4 py-4 rounded-lg text-center shadow-lg">
            <p className="text-sm font-semibold text-gray-900 mb-3">🔒 Image is Private</p>
            
            {requestStatus?.hasRequest && requestStatus?.status === 'pending' ? (
              <div className="space-y-2">
                <p className="text-xs text-yellow-700 bg-yellow-50 p-2 rounded">
                  ⏳ Request Pending
                </p>
                <p className="text-xs text-gray-600">
                  Waiting for owner to review your request
                </p>
              </div>
            ) : requestStatus?.hasRequest && requestStatus?.status === 'rejected' ? (
              <div className="space-y-2">
                <p className="text-xs text-red-700 bg-red-50 p-2 rounded">
                  ❌ Request Denied
                </p>
                <p className="text-xs text-gray-600">
                  Your access request was not approved
                </p>
              </div>
            ) : (
              <>
                <p className="text-xs text-gray-600 mb-3">
                  Request access to view the image
                </p>
                <button
                  onClick={onRequestAccessClick}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 px-3 rounded transition"
                >
                  Request Access
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {isApproved && isPrivate && (
        <div className="absolute top-3 left-3 bg-green-500 bg-opacity-90 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
          ✓ Access Granted by Owner
        </div>
      )}

      {isUploader && isPrivate && (
        <div className="absolute bottom-3 right-3 z-10 bg-yellow-400 bg-opacity-90 rounded-full p-1.5 shadow-lg hover:bg-opacity-100 transition-all" title="Image is private">
          <EyeOff className="w-4 h-4 text-yellow-900" />
        </div>
      )}
    </div>
  );
};

export default BlurredImage;
