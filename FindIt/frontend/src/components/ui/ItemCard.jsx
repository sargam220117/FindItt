import React from 'react';
import { MapPin, Calendar, Tag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Card from './Card';
import BlurredImage from '../BlurredImage';

const ItemCard = ({ item, onClick }) => {
  const { user } = useAuth();

  return (
    <Card
      hoverable
      gradient
      className="group overflow-hidden"
      onClick={onClick}
    >
      {/* Image Container with Overlay */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800">
        {item.images && item.images[0] ? (
          <>
            <BlurredImage
              src={item.images[0]}
              alt={item.name}
              item={item}
              currentUserId={user?._id}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800">
            <span className="text-slate-400 dark:text-slate-500">No image</span>
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-3 right-3 flex gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md transition-all duration-300 ${item.category === 'Lost'
              ? 'bg-rose-500/90 text-white'
              : 'bg-lime-500/90 text-white'
            }`}>
            {item.category}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-vivid-500/90 text-white backdrop-blur-md">
            {item.itemCategory}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <h3 className="text-lg font-bold text-deep-900 dark:text-white line-clamp-2 mb-3 group-hover:text-vivid-600 dark:group-hover:text-vivid-400 transition-colors duration-300">
          {item.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-4">
          {item.description}
        </p>

        {/* Info Grid */}
        <div className="space-y-2.5 mb-4">
          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <MapPin className="w-4 h-4 text-vivid-500 dark:text-vivid-400 flex-shrink-0" />
            <span className="line-clamp-1">{item.location}</span>
          </div>

          {/* Date */}
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <Calendar className="w-4 h-4 text-vivid-500 dark:text-vivid-400 flex-shrink-0" />
            <span>{new Date(item.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}</span>
          </div>

          {/*Status */}
          <div className="flex items-center gap-2 text-sm">
            <Tag className="w-4 h-4 text-vivid-500 dark:text-vivid-400 flex-shrink-0" />
            <span className={`font-semibold ${item.status === 'Open'
                ? 'text-lime-600 dark:text-lime-400'
                : 'text-slate-500 dark:text-slate-400'
              }`}>
              {item.status === 'Open' ? '✓ Open' : 'Resolved'}
            </span>
          </div>
        </div>

        {/* Posted By */}
        <div className="flex items-center gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-vivid-500 to-electric-500 flex items-center justify-center text-white text-xs font-bold">
            {item.user?.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-deep-900 dark:text-white line-clamp-1">
              {item.user?.name || 'Anonymous'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Posted item</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ItemCard;
