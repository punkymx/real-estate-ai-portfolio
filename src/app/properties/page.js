// src/app/properties/page.js
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import PropertyCard from '@/components/PropertyCard'; // Adjust path if necessary
import Link from 'next/link';
import { useSession } from 'next-auth/react'; // For role-based access to 'Create Property' button
import { useRouter, useSearchParams } from 'next/navigation'; // For URL management

export default function PropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: session, status } = useSession(); // Get session for role check
  const router = useRouter();
  const searchParams = useSearchParams(); // Get current URL search parameters

  // State for filter values, initialized from URL search params or defaults
  const [filters, setFilters] = useState({
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    propertyType: searchParams.get('propertyType') || 'all', // 'all' for no specific type filter
    bedrooms: searchParams.get('bedrooms') || '',
    bathrooms: searchParams.get('bathrooms') || '',
    operation: searchParams.get('operation') || 'all', // 'all' for no specific operation filter
    furnished: searchParams.get('furnished') === 'true' ? true : (searchParams.get('furnished') === 'false' ? false : ''), // '' for 'any'
  });

  // Function to handle changes in filter inputs
  const handleFilterChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }, []);

  // Function to apply filters and update URL
  const applyFilters = useCallback(() => {
    const newSearchParams = new URLSearchParams();
    if (filters.minPrice) newSearchParams.set('minPrice', filters.minPrice);
    if (filters.maxPrice) newSearchParams.set('maxPrice', filters.maxPrice);
    if (filters.propertyType && filters.propertyType !== 'all') newSearchParams.set('propertyType', filters.propertyType);
    if (filters.bedrooms) newSearchParams.set('bedrooms', filters.bedrooms);
    if (filters.bathrooms) newSearchParams.set('bathrooms', filters.bathrooms);
    if (filters.operation && filters.operation !== 'all') newSearchParams.set('operation', filters.operation);
    // For boolean 'furnished', only add if explicitly true or false, not ''
    if (filters.furnished !== '') newSearchParams.set('furnished', filters.furnished);

    router.push(`/properties?${newSearchParams.toString()}`);
  }, [filters, router]);

  // Function to clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      propertyType: 'all',
      bedrooms: '',
      bathrooms: '',
      operation: 'all',
      furnished: '',
    });
    router.push('/properties'); // Navigate to base URL to clear all params
  }, [router]);


  // Fetch properties based on current URL search parameters
  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoading(true);
      setError(null);

      // Construct the query string from current URL searchParams
      const queryString = searchParams.toString();

      try {
        const response = await fetch(`/api/properties?${queryString}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProperties(data);
      } catch (err) {
        console.error("Failed to fetch properties:", err);
        setError('Failed to load properties. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, [searchParams]); // Re-fetch whenever URL search parameters change

  // Helper function to check if user has a specific role
  const hasRole = (requiredRole) => {
    return session?.user?.role === requiredRole;
  };

  if (isLoading) {
    return <p className="text-center text-blue-600 p-8 text-lg">Loading properties...</p>;
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-8 text-lg">
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="text-blue-500 hover:underline mt-4 inline-block">
          Retry
        </button>
      </div>
    );
  }

  return (
    <main className="p-1 max-w-7xl mx-auto my-2">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-8 text-center">Property Listings</h1>

      {/* Filter Section */}
      <div className="bg-white shadow-lg rounded-lg p-2 mb-2">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Filter Properties</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
          {/* Price Range */}
          <div>
            <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700">Min Price ($)</label>
            <input
              type="number"
              id="minPrice"
              name="minPrice"
              value={filters.minPrice}
              onChange={handleFilterChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="e.g., 100000"
            />
          </div>
          <div>
            <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700">Max Price ($)</label>
            <input
              type="number"
              id="maxPrice"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="e.g., 500000"
            />
          </div>

          {/* Property Type */}
          <div>
            <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700">Property Type</label>
            <select
              id="propertyType"
              name="propertyType"
              value={filters.propertyType}
              onChange={handleFilterChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="all">All Types</option>
              <option value="Casa">House</option>
              <option value="Apartamento">Apartment</option>
              <option value="Terreno">Land</option>
              <option value="Oficina">Office</option>
              <option value="Local Comercial">Commercial Space</option>
            </select>
          </div>

          {/* Bedrooms */}
          <div>
            <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700">Min Bedrooms</label>
            <input
              type="number"
              id="bedrooms"
              name="bedrooms"
              value={filters.bedrooms}
              onChange={handleFilterChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="e.g., 2"
            />
          </div>

          {/* Bathrooms */}
          <div>
            <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700">Min Bathrooms</label>
            <input
              type="number"
              id="bathrooms"
              name="bathrooms"
              value={filters.bathrooms}
              onChange={handleFilterChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="e.g., 1"
            />
          </div>

          {/* Operation Type */}
          <div>
            <label htmlFor="operation" className="block text-sm font-medium text-gray-700">Operation Type</label>
            <select
              id="operation"
              name="operation"
              value={filters.operation}
              onChange={handleFilterChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="all">All Operations</option>
              <option value="Venta">Sale</option>
              <option value="Renta">Rent</option>
            </select>
          </div>

          {/* Furnished */}
          <div className="flex items-center mt-6">
            <input
              type="checkbox"
              id="furnished"
              name="furnished"
              checked={filters.furnished === true} // Check if explicitly true
              onChange={handleFilterChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="furnished" className="ml-2 block text-sm font-medium text-gray-700">Furnished</label>
          </div>

           <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={clearFilters}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md transition-colors duration-200"
          >
            Clear Filters
          </button>
          <button
            onClick={applyFilters}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200"
          >
            Apply Filters
          </button>
        </div>
        </div>

      </div>

      {/* Property Listings Grid */}
      {properties.length === 0 && !isLoading ? (
        <p className="text-center text-gray-600 text-lg">No properties found matching your criteria.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              id={property.id}
              title={property.title}
              price={property.price}
              location={property.location}
              image={property.image}
              type={property.type}
              bedrooms={property.bedrooms}
              bathrooms={property.bathrooms}
            />
          ))}
        </div>
      )}
      {/* Create Property Button (visible only for AGENT or ADMIN) */}
      {status === 'authenticated' && (hasRole('AGENT') || hasRole('ADMIN')) && (
        <div className="flex justify-end mb-8">
          <Link href="/properties/create" passHref>
            <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-md shadow-md transition-colors duration-200">
              Create New Property
            </button>
          </Link>
        </div>
      )}
    </main>
  );
}