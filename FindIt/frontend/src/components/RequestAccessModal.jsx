import { useState } from 'react';
import { X, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import axios from 'axios';

const RequestAccessModal = ({ isOpen, onClose, item, currentUser, onSuccess }) => {
  const [formData, setFormData] = useState({
    fullName: currentUser?.name || '',
    mobileNumber: '',
    reason: '',
    proofOfOwnership: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.fullName || !formData.mobileNumber || !formData.reason) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      await axios.post('/api/access-requests', {
        itemId: item._id,
        fullName: formData.fullName,
        mobileNumber: formData.mobileNumber,
        reason: formData.reason,
        proofOfOwnership: formData.proofOfOwnership
      });

      setSuccess(true);
      setFormData({
        fullName: currentUser?.name || '',
        mobileNumber: '',
        reason: '',
        proofOfOwnership: ''
      });

      if (onSuccess) {
        onSuccess();
      }

      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit access request');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">Request Image Access</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {success ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Request Submitted!</h3>
              <p className="text-gray-600">
                Your access request has been sent to the item owner. They will review it shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Item Name
                </label>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{item.name}</p>
              </div>

              <div>
                <label htmlFor="fullName" className="block text-sm font-semibold text-gray-900 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your full name"
                  required
                />
              </div>

              <div>
                <label htmlFor="mobileNumber" className="block text-sm font-semibold text-gray-900 mb-2">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="mobileNumber"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="9876543210"
                  required
                />
              </div>

              <div>
                <label htmlFor="reason" className="block text-sm font-semibold text-gray-900 mb-2">
                  Reason for Request <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Why do you need to see this image? (e.g., I think this is my lost item...)"
                  required
                />
              </div>

              <div>
                <label htmlFor="proofOfOwnership" className="block text-sm font-semibold text-gray-900 mb-2">
                  Proof Details <span className="text-gray-500 text-xs">(Optional)</span>
                </label>
                <textarea
                  id="proofOfOwnership"
                  name="proofOfOwnership"
                  value={formData.proofOfOwnership}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Share details to prove ownership (e.g., serial number, identifying marks...)"
                />
              </div>

              <div className="pt-4 space-y-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                >
                  {loading && <Loader className="w-5 h-5 animate-spin" />}
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2 px-4 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>

              <p className="text-xs text-gray-600 text-center pt-2">
                Your information will only be shared with the item owner after approval.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestAccessModal;
