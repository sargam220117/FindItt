import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ItemCard from '../components/ui/ItemCard';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { ChevronDown, X, Filter, MapPin, Calendar } from 'lucide-react';

const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const ItemList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);

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

  const handleItemCategoryChange = (selectedItemCategory) => {
    const newParams = new URLSearchParams(searchParams);
    if (selectedItemCategory) {
      newParams.set('itemCategory', selectedItemCategory);
    } else {
      newParams.delete('itemCategory');
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
    setSearchInput('');
  };

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'Electronics', label: 'Electronics' },
    { value: 'Clothing', label: 'Clothing' },
    { value: 'Accessories', label: 'Accessories' },
    { value: 'Documents', label: 'Documents' },
    { value: 'Keys', label: 'Keys' },
    { value: 'Bags', label: 'Bags' },
    { value: 'Others', label: 'Others' }
  ];

  if (loading && items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <svg className="w-12 h-12 text-gold-500 animate-spin mx-auto mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-slate-600 dark:text-slate-300 text-lg font-medium">Loading items...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Card className="bg-red-50 border border-red-200">
          <div className="p-8 text-center">
            <p className="text-red-600 font-semibold text-lg">{error}</p>
          </div>
        </Card>
      </div>
    );
  }

  const hasActiveFilters = category || itemCategory || search;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-navy-900 mb-2">
            {category ? `${category} Items` : 'All Items'}
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-lg">
            Showing <span className="font-bold text-navy-900">{items.length}</span> {category ? `${category.toLowerCase()}` : ''} items
          </p>
        </div>

        <div className="mb-8 space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search items by name, description..."
              className="input-field"
              value={searchInput}
              onChange={handleSearch}
            />
            {searchInput && (
              <button
                onClick={() => {
                  setSearchInput('');
                  setSearchParams(new URLSearchParams(searchParams.toString().replace('search=' + search, '')));
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2.5 bg-navy-500 text-white rounded-lg hover:bg-navy-600 transition-colors duration-300 font-semibold"
            >
              <Filter className="w-5 h-5" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => handleCategoryChange('')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                  !category
                    ? 'bg-navy-500 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => handleCategoryChange('Lost')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                  category === 'Lost'
                    ? 'bg-red-500 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Lost
              </button>
              <button
                onClick={() => handleCategoryChange('Found')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                  category === 'Found'
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Found
              </button>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-2 text-slate-600 dark:text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300 text-sm font-medium"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>

          {showFilters && (
            <Card className="p-6 bg-gradient-to-r from-slate-50 to-gold-50/30 animate-slide-down">
              <h3 className="text-lg font-bold text-navy-900 mb-4">Item Categories</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => handleItemCategoryChange(cat.value)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm ${
                      itemCategory === cat.value
                        ? 'bg-gold-500 text-navy-900 shadow-lg'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-gold-300'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </Card>
          )}
        </div>

        {items.length === 0 ? (
          <Card className="bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-200 flex items-center justify-center">
                <MapPin className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-lg font-medium mb-2">
                No items found
              </p>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                {search
                  ? `Try different keywords or adjust your filters`
                  : `Be the first to post an item!`}
              </p>
              <div className="flex gap-3 justify-center">
                {hasActiveFilters && (
                  <Button onClick={clearFilters} variant="outline">
                    Clear Filters
                  </Button>
                )}
                <Button onClick={() => navigate('/items/new')}>
                  Post Item
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div
                key={item._id}
                onClick={() => navigate(`/items/${item._id}`)}
                className="animate-scale-in"
              >
                <ItemCard item={item} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemList;
