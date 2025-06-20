// src/components/PropertyCard.jsx

export default function PropertyCard({ title, price, location, image, type, bedrooms, bathrooms }) { // Add new props
  return (
    <div className="border rounded shadow-sm bg-white overflow-hidden">
      <img src={image} alt={title} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-1">{title}</h2> {/* Added mb-1 */}
        <p className="text-gray-600 text-sm mb-2">{location}</p> {/* Adjusted text size and added mb-2 */}

        {/* NEW: Add type, bedrooms, bathrooms */}
        <div className="flex items-center text-gray-700 text-sm mb-2">
          {/* You might want icons here, e.g., from Heroicons or Font Awesome */}
          <span className="mr-2 capitalize">{type}</span> {/* Capitalize first letter */}
          {bedrooms > 0 && ( // Only show if bedrooms > 0
            <span className="mr-2">| {bedrooms} Bd</span>
          )}
          {bathrooms > 0 && ( // Only show if bathrooms > 0
            <span>| {bathrooms} Ba</span>
          )}
        </div>

        <p className="text-green-600 font-bold mt-2 text-lg">${price.toLocaleString()}</p> {/* Increased font size slightly */}
      </div>
    </div>
  );
}