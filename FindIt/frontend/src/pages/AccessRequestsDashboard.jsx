import { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle, Clock, AlertCircle, Loader } from 'lucide-react';
import Card from '../components/ui/Card';

const AccessRequestsDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAccessRequests();
  }, []);

  const fetchAccessRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/access-requests/my-items/requests');
      setRequests(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch access requests');
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      setActionLoading(requestId);
      await axios.put(`/api/access-requests/${requestId}/approve`);
      setSuccessMessage('Access request approved!');
      fetchAccessRequests();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (requestId) => {
    try {
      setActionLoading(requestId);
      await axios.put(`/api/access-requests/${requestId}/reject`, {
        reviewNotes: 'Access denied by owner'
      });
      setSuccessMessage('Access request rejected!');
      fetchAccessRequests();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject request');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredRequests = requests.filter(req => {
    if (filter === 'all') return true;
    return req.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 border-yellow-200';
      case 'approved':
        return 'bg-green-50 border-green-200';
      case 'rejected':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading access requests...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-navy-900 mb-2">Access Requests</h1>
        <p className="text-slate-600 dark:text-slate-300">Manage who can view your private item images</p>
      </div>

      {successMessage && (
        <Card className="bg-green-50 border border-green-200 mb-6">
          <div className="p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-700 font-semibold">{successMessage}</p>
          </div>
        </Card>
      )}

      {error && (
        <Card className="bg-red-50 border border-red-200 mb-6">
          <div className="p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        </Card>
      )}

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {['all', 'pending', 'approved', 'rejected'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            <span className="ml-2 text-sm">
              ({requests.filter(r => filter === 'all' ? true : r.status === filter).length})
            </span>
          </button>
        ))}
      </div>

      {filteredRequests.length === 0 ? (
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100">
          <div className="p-12 text-center">
            <Clock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-300 text-lg font-medium">
              {requests.length === 0
                ? 'No access requests yet'
                : `No ${filter} requests`}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map(request => (
            <Card
              key={request._id}
              className={`border-l-4 ${getStatusColor(request.status)}`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1">
                    {getStatusIcon(request.status)}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {request.item?.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Category: {request.item?.category}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    request.status === 'pending'
                      ? 'bg-yellow-200 text-yellow-800'
                      : request.status === 'approved'
                      ? 'bg-green-200 text-green-800'
                      : 'bg-red-200 text-red-800'
                  }`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>

                <div className="bg-white dark:bg-slate-800 bg-opacity-50 rounded-lg p-4 mb-4 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase">Requester</p>
                    <p className="text-sm font-medium text-gray-900">{request.fullName}</p>
                    <p className="text-xs text-gray-600">{request.requester?.email}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase">Mobile Number</p>
                    <p className="text-sm font-medium text-gray-900">{request.mobileNumber}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase">Reason</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{request.reason}</p>
                  </div>

                  {request.proofOfOwnership && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase">Proof of Ownership</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{request.proofOfOwnership}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase">Request Date</p>
                    <p className="text-sm text-gray-700">
                      {new Date(request.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {request.status === 'pending' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(request._id)}
                      disabled={actionLoading === request._id}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      {actionLoading === request._id && (
                        <Loader className="w-4 h-4 animate-spin" />
                      )}
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(request._id)}
                      disabled={actionLoading === request._id}
                      className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      {actionLoading === request._id && (
                        <Loader className="w-4 h-4 animate-spin" />
                      )}
                      Reject
                    </button>
                  </div>
                )}

                {request.status !== 'pending' && request.reviewedAt && (
                  <div className="bg-white dark:bg-slate-800 bg-opacity-50 rounded-lg p-3 text-xs text-gray-600">
                    <p className="font-semibold mb-1">Reviewed by owner on {new Date(request.reviewedAt).toLocaleDateString()}</p>
                    {request.reviewNotes && <p>{request.reviewNotes}</p>}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AccessRequestsDashboard;
