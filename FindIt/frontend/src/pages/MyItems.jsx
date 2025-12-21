import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ItemCard from '../components/ItemCard';
import Button from '../components/ui/Button';
import { FileText } from 'lucide-react';

const MyItems = () => {
  const [items, setItems] = useState([]);
  const [responses, setResponses] = useState([]);
  const [activeTab, setActiveTab] = useState('items');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [itemsRes, responsesRes] = await Promise.all([
          axios.get('/api/items/myitems'),
          axios.get('/api/responses/me')
        ]);

        console.log('Responses data:', responsesRes.data);
        
        const validResponses = responsesRes.data.filter(response => {
          if (!response.item || !response.item._id) {
            console.warn('Invalid response data:', response);
            return false;
          }
          return true;
        });

        setItems(itemsRes.data);
        setResponses(validResponses);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center text-red-600 py-8">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-navy mt-4">My Activity</h1>
        <Link to="/access-requests" className="mt-6 inline-block">
        <Button size="md" icon={FileText}>
          Access Requests
        </Button>
        </Link>
      </div>

      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-2 px-4 mr-4 font-medium ${
            activeTab === 'items'
              ? 'text-golden border-b-2 border-golden'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('items')}
        >
          My Listings
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === 'responses'
              ? 'text-golden border-b-2 border-golden'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('responses')}
        >
          My Responses
        </button>
      </div>

      {activeTab === 'items' ? (
        items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            You haven't posted any items yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
        )
      ) : (
        <div className="space-y-4">
          {responses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              You haven't responded to any items yet.
            </div>
          ) : (
            responses.map((response) => {
              // Skip invalid responses
              if (!response.item || !response.item._id) {
                console.warn('Skipping invalid response:', response);
                return null;
              }

              return (
                <Link
                  to={`/items/${response.item._id}`}
                  key={response._id}
                  className={`block bg-white rounded-lg shadow-md p-6 ${
                    response.claimingMatch ? 'border-2 border-golden' : 'border border-gray-200'
                  } hover:shadow-lg transition-shadow`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-navy hover:text-deepBlue">
                        {response.item.name || 'Untitled Item'}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{new Date(response.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>By {response.item.user?.name || 'Unknown User'}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          response.item.category === 'Lost'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {response.item.category || 'Unknown'}
                      </span>
                      {response.claimingMatch && (
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            response.status === 'Accepted'
                              ? 'bg-green-100 text-green-800'
                              : response.status === 'Rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {response.status || 'Pending'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-4">
                    {response.item.images?.[0] && (
                      <div className="w-20 h-20 flex-shrink-0">
                        <img
                          src={response.item.images[0]}
                          alt={response.item.name || 'Item image'}
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-gray-700 mb-2">{response.message}</p>
                      {response.item.location && (
                        <div className="text-sm text-gray-500">
                          <span className="font-medium">Location:</span> {response.item.location}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default MyItems;