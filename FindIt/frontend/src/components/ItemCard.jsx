import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BlurredImage from './BlurredImage';

const ItemCard = ({ item }) => {
  const { user } = useAuth();

  return (
    <div className="card hover:shadow-xl">
      {item.images && item.images.length > 0 && (
        <div className="overflow-hidden rounded-t-lg">
          <BlurredImage
            src={item.images[0]}
            alt={item.name}
            item={item}
            currentUserId={user?._id}
            className="w-full h-48 object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-navy">{item.name}</h3>
          <div className="flex flex-col gap-1 items-end">
            <span className={`px-2 py-1 text-xs font-semibold rounded ${
              item.category === 'Lost' 
                ? 'bg-red-100 text-red-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {item.category}
            </span>
            <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
              {item.itemCategory}
            </span>
          </div>
        </div>
        <p className="text-gray-600 text-sm mb-2">
          {item.description.length > 100
            ? `${item.description.substring(0, 100)}...`
            : item.description}
        </p>
        <div className="text-sm text-gray-500 mb-4">
          <p>Location: {item.location}</p>
          <p>Date: {new Date(item.date).toLocaleDateString()}</p>
        </div>
        <Link
          to={`/items/${item._id}`}
          className="btn-primary inline-block text-center w-full"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default ItemCard;