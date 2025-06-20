// src/app/properties/page.js
'use client'; // This directive is crucial for using client-side React Hooks like useState and useEffect

import React, { useState, useEffect } from 'react';
import PropertyCard from "@/components/PropertyCard";
import propertiesData from "@/data/properties"; // Make sure your properties.js has 'type', 'bedrooms', 'bathrooms', and 'id' fields for each property

export default function PropertiesPage() {
  // 1. State to store the filter values
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    propertyType: 'all', // Options: 'all', 'Casa', 'Apartamento', 'Terreno', etc. (must match your data)
    bedrooms: '',
    bathrooms: '',
    // Add more filters here if needed, like 'location' or 'area'
  });

  // 2. State for the properties that will be displayed after applying filters
  // Initialize with all properties, they will be filtered by useEffect
  const [filteredProperties, setFilteredProperties] = useState(propertiesData);

  // 3. Function to handle changes in filter inputs
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  // Optional: Function to clear all filters
  const handleClearFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      propertyType: 'all',
      bedrooms: '',
      bathrooms: '',
    });
  };

  // 4. Filtering logic using useEffect
  // This hook runs every time the 'filters' object changes
  useEffect(() => {
    let updatedProperties = propertiesData; // Always start with the original full list

    // Filter by minimum price
    if (filters.minPrice) {
      updatedProperties = updatedProperties.filter(
        (property) => property.price >= parseFloat(filters.minPrice)
      );
    }

    // Filter by maximum price
    if (filters.maxPrice) {
      updatedProperties = updatedProperties.filter(
        (property) => property.price <= parseFloat(filters.maxPrice)
      );
    }

    // Filter by property type
    if (filters.propertyType && filters.propertyType !== 'all') {
      updatedProperties = updatedProperties.filter(
        (property) => property.type.toLowerCase() === filters.propertyType.toLowerCase()
      );
    }

    // Filter by number of bedrooms
    if (filters.bedrooms) {
      updatedProperties = updatedProperties.filter(
        (property) => property.bedrooms >= parseInt(filters.bedrooms, 10)
      );
    }

    // Filter by number of bathrooms
    if (filters.bathrooms) {
      updatedProperties = updatedProperties.filter(
        (property) => property.bathrooms >= parseInt(filters.bathrooms, 10)
      );
    }

    // Update the state with the filtered properties
    setFilteredProperties(updatedProperties);
  }, [filters]); // The 'filters' dependency causes this effect to re-run whenever any filter changes


  return (
    <main className="p-4">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">Property Catalog</h1>

      {/* Filters Section (UI) */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {/* Min Price Filter */}
        <div>
          <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700">
            Min Price:
          </label>
          <input
            type="number"
            id="minPrice"
            name="minPrice"
            value={filters.minPrice}
            onChange={handleFilterChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="E.g., 100000"
          />
        </div>

        {/* Max Price Filter */}
        <div>
          <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700">
            Max Price:
          </label>
          <input
            type="number"
            id="maxPrice"
            name="maxPrice"
            value={filters.maxPrice}
            onChange={handleFilterChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="E.g., 500000"
          />
        </div>

        {/* Property Type Filter */}
        <div>
          <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700">
            Property Type:
          </label>
          <select
            id="propertyType"
            name="propertyType"
            value={filters.propertyType}
            onChange={handleFilterChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option type="all">All</option>
            <option type="Casa">House</option>
            <option type="Apartamento">Apartment</option>
            <option type="Terreno">Land</option>
            {/* Make sure these values match the 'type' field in your property data (case-sensitive as per your data) */}
          </select>
        </div>

        {/* Bedrooms Filter */}
        <div>
          <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700">
            Bedrooms:
          </label>
          <input
            type="number"
            id="bedrooms"
            name="bedrooms"
            value={filters.bedrooms}
            onChange={handleFilterChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="E.g., 3"
          />
        </div>

        {/* Bathrooms Filter */}
        <div>
          <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700">
            Bathrooms:
          </label>
          <input
            type="number"
            id="bathrooms"
            name="bathrooms"
            value={filters.bathrooms}
            onChange={handleFilterChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="E.g., 2"
          />
        </div>

        {/* Clear Filters Button (Optional but recommended for UX) */}
        <div className="col-span-full flex justify-end">
          <button
            onClick={handleClearFilters}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-md transition-colors duration-200"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Rendering of Filtered Properties */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.length > 0 ? (
          filteredProperties.map((property) => (
            <PropertyCard
              key={property.id}
              id={property.id}             // Pass ID for Link component
              title={property.title}
              price={property.price}
              location={property.location}
              image={property.image}
              type={property.type}         // Pass new props
              bedrooms={property.bedrooms} // Pass new props
              bathrooms={property.bathrooms} // Pass new props
            />
          ))
        ) : (
          <p className="text-center text-gray-600 col-span-full p-8 text-lg">No properties found matching the current filters.</p>
        )}
      </div>
    </main>
  );
}