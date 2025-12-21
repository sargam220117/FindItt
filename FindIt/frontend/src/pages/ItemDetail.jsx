import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { RotateCcw } from 'lucide-react';
import ItemActions from '../components/ItemActions';
import ChatButton from '../components/ChatButton';
import BlurredImage from '../components/BlurredImage';
import RequestAccessModal from '../components/RequestAccessModal';

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [item, setItem] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [claimingMatch, setClaimingMatch] = useState(false);
  const [showRequestAccessModal, setShowRequestAccessModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);


  useEffect(() => {
    const fetchItem = async () => {
      try {
        const [itemRes, responsesRes] = await Promise.all([
          axios.get(`/api/items/${id}`),
          user ? axios.get(`/api/items/${id}/responses`) : Promise.resolve({ data: [] })
        ]);
        setItem(itemRes.data);
        setResponses(responsesRes.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch item details');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();

    if (item?.imagePrivacy?.isPrivate && user && user._id !== item?.user?._id) {
      const interval = setInterval(() => {
        axios.get(`/api/items/${id}`).then(res => {
          setItem(res.data);
        });
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [id, user]);

  const handleResponse = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const response = await axios.post(`/api/items/${id}/responses`, {
        message,
        claimingMatch
      });
      setResponses([...responses, response.data]);
      setMessage('');
      setClaimingMatch(false);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit response');
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center text-red-600 py-8">{error}</div>;
  if (!item) return <div className="text-center py-8">Item not found</div>;

  const handleResponseAction = async (responseId, status) => {
    try {
      await axios.put(`/api/responses/${responseId}`, { status });
      const responsesRes = await axios.get(`/api/items/${id}/responses`);
      setResponses(responsesRes.data);
      const itemRes = await axios.get(`/api/items/${id}`);
      setItem(itemRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update response');
    }
  };

  const handleRequestAccessClick = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setShowRequestAccessModal(true);
  };

  const handleAccessRequestSuccess = () => {
    axios.get(`/api/items/${id}`).then(res => {
      setItem(res.data);
    });
  };

  const handleRequestAccessModalClose = () => {
    setShowRequestAccessModal(false);
    handleRefreshItem();
  };

  const handleRefreshItem = async () => {
    try {
      setRefreshing(true);
      const res = await axios.get(`/api/items/${id}`);
      setItem(res.data);
    } catch (err) {
      console.error('Failed to refresh item:', err);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-12">
        <div>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
            {item.images && item.images.length > 0 && (
              <BlurredImage
                src={item.images[0]}
                alt={item.name}
                item={item}
                currentUserId={user?._id}
                className="w-full h-64 object-cover"
                onRequestAccessClick={handleRequestAccessClick}
              />
            )}
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-3xl font-bold text-navy">{item.name}</h1>
                <div className="flex items-center gap-4">
                  {user && user._id !== item.user._id && item.imagePrivacy?.isPrivate && (
                    <button
                      onClick={handleRefreshItem}
                      disabled={refreshing}
                      className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition disabled:opacity-50"
                      title="Refresh to check if access was approved"
                    >
                      <RotateCcw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                  )}
                  {user && user._id === item.user._id && (
                    <div className="relative z-10">
                      <ItemActions
                        item={item}
                        onDelete={() => navigate('/myitems')}
                      />
                    </div>
                  )}
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${item.category === 'Lost' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                      {item.category}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${item.status === 'Open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-gray-700 mb-4">{item.description}</p>
              <div className="space-y-2 text-gray-600">
                <p>
                  <span className="font-semibold">Location:</span> {item.location}
                </p>
                <p>
                  <span className="font-semibold">Category:</span>{' '}
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {item.itemCategory}
                  </span>
                </p>
                <p>
                  <span className="font-semibold">Date:</span>{' '}
                  {new Date(item.date).toLocaleDateString()}
                </p>
                <p>
                  <span className="font-semibold">Posted by:</span>{' '}
                  {item.user.name}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-navy mb-6">Responses</h2>

            {user && item.status === 'Open' && (
              <form onSubmit={handleResponse} className="mb-6">
                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
                    {error}
                  </div>
                )}

                <textarea
                  className="input-field mb-4"
                  rows="4"
                  placeholder="Write your response..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                ></textarea>

                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="claimMatch"
                    checked={claimingMatch}
                    onChange={(e) => setClaimingMatch(e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="claimMatch">
                    I'm claiming this as a match
                  </label>
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full"
                >
                  {claimingMatch ? "Submit Match Claim" : "Submit Response"}
                </button>
              </form>
            )}

            <div className="space-y-4">
              {responses.map((response) => (
                <div
                  key={response._id}
                  className={`p-4 rounded-lg ${response.claimingMatch
                      ? 'bg-golden/10 border border-golden'
                      : 'bg-gray-50'
                    }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold">{response.user.name}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(response.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-2">{response.message}</p>
                  {response.claimingMatch && (
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm font-semibold text-deepBlue">
                        Claiming Match
                      </span>
                      {user && item.user._id === user._id && item.status === 'Open' && response.status === 'Pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleResponseAction(response._id, 'Accepted')}
                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleResponseAction(response._id, 'Rejected')}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {response.status !== 'Pending' && (
                        <span className={`text-sm font-semibold ${response.status === 'Accepted'
                            ? 'text-green-600'
                            : response.status === 'Rejected'
                              ? 'text-red-600'
                              : 'text-yellow-600'
                          }`}>
                          {response.status}
                        </span>
                      )}
                    </div>
                  )}
                  {response.status === 'Accepted' && (
                    <div className="mt-4">
                      <ChatButton
                        responseId={response._id}
                        itemUserId={item.user._id}
                        responseUserId={response.user._id}
                      />
                    </div>
                  )}
                </div>
              ))}

              {responses.length === 0 && (
                <p className="text-gray-500 text-center">No responses yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <RequestAccessModal
        isOpen={showRequestAccessModal}
        onClose={handleRequestAccessModalClose}
        item={item}
        currentUser={user}
        onSuccess={handleAccessRequestSuccess}
      />
    </div>
  );
};

export default ItemDetail;