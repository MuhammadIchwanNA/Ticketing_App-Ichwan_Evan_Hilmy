const EditModal = ({
  showEditModal,
  setShowEditModal,
  formData,
  setFormData,
}) => {
  const handleCloseModal = () => {
    setShowEditModal(null);
  };

  // Handle update (call API later)
  const handleUpdateEvent = async (
    eventId: string,
    updatedData: typeof formData
  ) => {
    console.log("Updating event:", eventId, updatedData);

    // Example: update state locally (later replace with API call)

    setShowEditModal(null); // close modal
  };

  return (
    showEditModal && (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
        <div className="card p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4 text-center">Edit Event</h3>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUpdateEvent(showEditModal, formData);
            }}
            className="space-y-4"
          >
            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="input input-bordered w-full"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="textarea textarea-bordered w-full"
                rows={3}
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Price (IDR)
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: Number(e.target.value),
                  })
                }
                className="input input-bordered w-full"
                required
              />
            </div>

            {/* Start & End Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Start Date
                </label>
                <input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  className="input input-bordered w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  End Date
                </label>
                <input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  className="input input-bordered w-full"
                  required
                />
              </div>
            </div>

            {/* Total Seats */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Total Seats
              </label>
              <input
                type="number"
                value={formData.totalSeats}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    totalSeats: Number(e.target.value),
                  })
                }
                className="input input-bordered w-full"
                required
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="input input-bordered w-full"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="input input-bordered w-full"
                required
              />
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Image URL
              </label>
              <input
                type="text"
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
                className="input input-bordered w-full"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4">
              <button
                type="button"
                onClick={() => handleCloseModal()}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn bg-primary text-white hover:bg-primary/90"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  );
};
export default EditModal;
