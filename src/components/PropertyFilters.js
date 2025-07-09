{/*'use client';
import { useState } from 'react';

export default function PropertyFilters({ onFilter }) {
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [location, setLocation] = useState('');

  const handleFilterChange = () => {
    onFilter({
      minPrice: minPrice ? parseInt(minPrice) : null,
      maxPrice: maxPrice ? parseInt(maxPrice) : null,
      location: location.trim().toLowerCase(),
    });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <input
        type="number"
        placeholder="Min Price"
        value={minPrice}
        onChange={(e) => setMinPrice(e.target.value)}
        onBlur={handleFilterChange}
        className="border p-2 rounded w-full sm:w-40"
      />
      <input
        type="number"
        placeholder="Max Price"
        value={maxPrice}
        onChange={(e) => setMaxPrice(e.target.value)}
        onBlur={handleFilterChange}
        className="border p-2 rounded w-full sm:w-40"
      />
      <input
        type="text"
        placeholder="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        onBlur={handleFilterChange}
        className="border p-2 rounded w-full sm:w-60"
      />
    </div>
  );
}
*/}