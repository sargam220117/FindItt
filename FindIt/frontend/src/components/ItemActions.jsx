import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ConfirmModal from './ConfirmModal';
import { useNotification } from '../context/NotificationContext';

const ItemActions = ({ item, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { success: showSuccess, error: showError } = useNotification();

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      await axios.delete(`/api/items/${item._id}`);
      showSuccess('Item deleted successfully!');
      onDelete();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to delete item');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Link
          to={`/items/${item._id}/edit`}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
        >
          Edit
        </Link>
        <button
          onClick={() => setShowDeleteModal(true)}
          disabled={isDeleting}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm disabled:opacity-50"
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </>
  );
};

export default ItemActions;