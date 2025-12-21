import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import ItemCard from "../components/ui/ItemCard";
import Button from "../components/ui/Button";
import SearchBar from "../components/ui/SearchBar";
import Card from "../components/ui/Card";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Search, Plus, Inbox, MapPin, Clock, Zap, ListTodo } from "lucide-react";

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          `/api/items${searchTerm ? `?search=${searchTerm}` : ""}`
        );
        setItems(response.data.slice(0, 6));
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch items");
        console.error("Error fetching items:", err);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchItems();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSearch = (query) => {
    setSearchTerm(query);
  };

  return (
    <div className="min-h-screen bg-gradient-hero-light dark:bg-gradient-to-br dark:from-slate-900 dark:via-deep-900 dark:to-slate-800">
      {user && (
        <div className="bg-gradient-hero-light dark:bg-gradient-to-br dark:from-slate-950 dark:via-deep-900 dark:to-slate-850 border-b border-transparent">
          <div className="py-6 px-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-vivid-500 to-rose-500 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-vivid-500/30">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <h3 className="text-lg md:text-xl font-bold text-deep-900 dark:text-white">
                    Welcome back, <span className="bg-gradient-to-r from-vivid-600 to-electric-600 bg-clip-text text-transparent">{user.name}</span>!
                  </h3>
                  <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button icon={Plus} onClick={() => navigate('/items/new')} className="gap-1.5">
                  Post Item
                </Button>
                <Link to="/myitems">
                  <Button variant="secondary" icon={ListTodo} className="gap-1.5">
                    My Items
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}


      <div className="relative py-12 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero-light dark:bg-gradient-to-br dark:from-slate-900 dark:via-deep-900 dark:to-slate-800" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-deep-900 dark:text-white mb-4 leading-tight">
              Find Your <span className="bg-gradient-to-r from-vivid-600 via-rose-500 to-electric-500 bg-clip-text text-transparent">Lost Items</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
              Connect with your community to recover lost belongings or help others find theirs. Join thousands of people reuniting with their belongings.
            </p>

            <div className="max-w-2xl mx-auto mb-8">
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                onSubmit={handleSearch}
                loading={loading}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/items?category=Lost">
                <Button size="lg" className="gap-2">
                  <MapPin className="w-5 h-5" />
                  Explore Lost Items
                </Button>
              </Link>
              <Link to="/items?category=Found">
                <Button variant="secondary" size="lg" className="gap-2">
                  <Zap className="w-5 h-5" />
                  Browse Found Items
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="group mt-10 hover:shadow-glow-pink" hoverable>
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <MapPin className="w-8 h-8 text-rose-600 dark:text-rose-400" />
              </div>
              <h3 className="text-xl font-bold text-deep-900 dark:text-white mb-2">Lost an Item?</h3>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                Post details about your lost item and let our community help you find it.
              </p>
              <Link to="/items/new?category=Lost" className="inline-block w-full">
                <Button variant="outline" size="md" className="w-full">
                  Report Lost Item
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="group mt-10 hover:shadow-glow-blue" hoverable>
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-lime-100 dark:bg-lime-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-8 h-8 text-lime-600 dark:text-lime-400" />
              </div>
              <h3 className="text-xl font-bold text-deep-900 dark:text-white mb-2">Found Something?</h3>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                Help someone by reporting the items you've found in your area.
              </p>
              <Link to="/items/new?category=Found" className="inline-block w-full">
                <Button variant="outline" size="md" className="w-full">
                  Report Found Item
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="group mt-10 hover:shadow-glow-purple" hoverable>
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-electric-100 dark:bg-electric-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Search className="w-8 h-8 text-electric-600 dark:text-electric-400" />
              </div>
              <h3 className="text-xl font-bold text-deep-900 dark:text-white mb-2">Browse Listings</h3>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                Explore all lost and found items posted by the community near you.
              </p>
              <Link to="/items" className="inline-block w-full">
                <Button variant="outline" size="md" className="w-full">
                  View All Items
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-deep-900 dark:text-white mb-2">
              {searchTerm ? `Search Results for "${searchTerm}"` : "Recent Listings"}
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              {searchTerm ? "Found items matching your search" : "Latest items posted by the community"}
            </p>
          </div>
          {items.length > 0 && !searchTerm && (
            <Link to="/items">
              <Button variant="secondary" size="md">
                View All
              </Button>
            </Link>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <svg className="w-12 h-12 text-vivid-500 animate-spin mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-slate-600 dark:text-slate-300">Loading items...</p>
            </div>
          </div>
        ) : error ? (
          <Card className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <div className="p-8 text-center">
              <p className="text-red-600 dark:text-red-400 font-semibold">{error}</p>
            </div>
          </Card>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div key={item._id} onClick={() => navigate(`/items/${item._id}`)}>
                <ItemCard item={item} />
              </div>
            ))}
          </div>
        ) : (
          <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
            <div className="p-12 text-center">
              <Search className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-300 text-lg font-medium">
                {searchTerm
                  ? "No items found matching your search. Try different keywords!"
                  : "No items available yet. Be the first to post!"}
              </p>
              {!searchTerm && !user && (
                <Link to="/register" className="mt-6 inline-block">
                  <Button size="md">Get Started</Button>
                </Link>
              )}
            </div>
          </Card>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <h2 className="text-3xl md:text-4xl font-black text-deep-900 dark:text-white text-center mb-12">
          How FindIt Works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Plus,
              title: "Post Your Item",
              description: "Upload photos, describe your lost or found item with location details"
            },
            {
              icon: Search,
              title: "Find Matches",
              description: "Browse the community or let our system suggest potential matches"
            },
            {
              icon: Inbox,
              title: "Connect & Recover",
              description: "Chat with other users and arrange to recover your belongings"
            }
          ].map((step, idx) => {
            const Icon = step.icon;
            return (
              <Card key={idx} className="text-center p-8 hover:shadow-glow-purple">
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-electric-500 to-vivid-500 flex items-center justify-center text-white">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-deep-900 dark:text-white mb-3">{step.title}</h3>
                <p className="text-slate-600 dark:text-slate-300">{step.description}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Home;
