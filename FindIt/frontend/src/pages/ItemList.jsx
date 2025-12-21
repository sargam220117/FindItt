import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ItemCard from '../components/ItemCard';
import CategoryFilter from '../components/CategoryFilter';

const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const ItemList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState('');

  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const itemCategory = searchParams.get('itemCategory') || '';

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (itemCategory) params.append('itemCategory', itemCategory);
      if (search) params.append('search', search);

      const response = await axios.get(`/api/items?${params.toString()}`);
      setItems(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch items');
    } finally {
      setLoading(false);
    }
  }, [category, itemCategory, search]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const debouncedSearch = useCallback(
    debounce((value) => {
      const newParams = new URLSearchParams(searchParams);
      if (value) {
        newParams.set('search', value);
      } else {
        newParams.delete('search');
      }
      setSearchParams(newParams);
    }, 300),
    [searchParams, setSearchParams]
  );

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    debouncedSearch(value);
  };

  const handleCategoryChange = (selectedCategory) => {
    const newParams = new URLSearchParams(searchParams);
    if (selectedCategory) {
      newParams.set('category', selectedCategory);
    } else {
      newParams.delete('category');
    }
    setSearchParams(newParams);
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center text-red-600 py-8">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-navy mb-4 md:mb-0">
          {category ? `${category} Items` : 'All Items'}
        </h1>
        
        <div className="flex gap-4">
          <button
            onClick={() => handleCategoryChange('')}
            className={`px-4 py-2 rounded-lg ${
              !category
                ? 'bg-navy text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => handleCategoryChange('Lost')}
            className={`px-4 py-2 rounded-lg ${
              category === 'Lost'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Lost
          </button>
          <button
            onClick={() => handleCategoryChange('Found')}
            className={`px-4 py-2 rounded-lg ${
              category === 'Found'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Found
          </button>
        </div>
      </div>

      <div className="mb-8 space-y-6">
        <input
          type="text"
          placeholder="Search items..."
          className="input-field"
          value={searchInput}
          onChange={handleSearch}
        />

        <CategoryFilter
          selectedCategory={itemCategory}
          onCategoryChange={(value) => {
            const newParams = new URLSearchParams(searchParams);
            if (value) {
              newParams.set('itemCategory', value);
            } else {
              newParams.delete('itemCategory');
            }
            setSearchParams(newParams);
          }}
        />
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No items found. Try adjusting your search or filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <ItemCard key={item._id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ItemList;