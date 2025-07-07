// src/app/properties/[id]/edit/page.js
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react'; // To check authentication status

export default function EditPropertyPage() {
  const params = useParams();
  const propertyId = params.id;
  const router = useRouter();
  const { data: session, status } = useSession(); // Get session to check auth

  const [formData, setFormData] = useState({
    title: '',
    price: '',
    location: '',
    image: '', // Main image URL
    type: 'Casa',
    bedrooms: '',
    bathrooms: '',
    operation: 'Venta',
    description: '',
    furnished: false,
    constructionArea: '',
    landArea: '',
    images: [{ url: '' }], // Array for gallery images
  });

  const [isLoading, setIsLoading] = useState(true); // Initial loading state for fetching data
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state for form submission
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Redirect if not authenticated (or handle permissions)
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin'); // Redirect to sign-in page if not logged in
    }
  }, [status, router]);

  // Fetch existing property data when component mounts or ID changes
  useEffect(() => {
    if (!propertyId || status === 'loading' || status === 'unauthenticated') {
      // Don't fetch if no ID, or if auth status is still loading/unauthenticated
      return;
    }

    const fetchProperty = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/properties/${propertyId}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Property not found');
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Pre-fill form data with fetched property details
        setFormData({
          title: data.title || '',
          price: data.price || '',
          location: data.location || '',
          image: data.image || '',
          type: data.type || 'Casa',
          bedrooms: data.bedrooms || '',
          bathrooms: data.bathrooms || '',
          operation: data.operation || 'Venta',
          description: data.description || '',
          furnished: data.furnished || false,
          constructionArea: data.constructionArea || '',
          landArea: data.landArea || '',
          // Map gallery images to the expected format, ensuring at least one empty field if none exist
          images: data.images && data.images.length > 0 ? data.images.map(img => ({ url: img.url })) : [{ url: '' }],
        });
      } catch (err) {
        console.error("Failed to fetch property for editing:", err);
        setError(err.message === 'Property not found' ? 'Property not found.' : 'Failed to load property details for editing. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId, status]); // Re-run if propertyId or auth status changes

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (index, e) => {
    const newImages = [...formData.images];
    newImages[index].url = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      images: newImages,
    }));
  };

  const addImageField = () => {
    setFormData((prevData) => ({
      ...prevData,
      images: [...prevData.images, { url: '' }],
    }));
  };

  const removeImageField = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData((prevData) => ({
      ...prevData,
      images: newImages,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const imagesToSend = formData.images.filter(img => img.url.trim() !== '');

      const dataToSend = {
        ...formData,
        price: formData.price ? parseFloat(formData.price) : null,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms, 10) : null,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms, 10) : null,
        images: imagesToSend,
      };

      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'PUT', // This is the key difference: PUT request
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      setSuccess(true);
      console.log('Property updated successfully!');

      setTimeout(() => {
        router.push(`/properties/${propertyId}`); // Redirect back to the detail page
      }, 2000);

    } catch (err) {
      console.error('Error updating property:', err);
      setError(err.message || 'Failed to update property. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return <p className="text-center text-blue-600 p-8 text-lg">Loading property for editing...</p>;
  }

  if (status === 'unauthenticated') {
    return (
      <div className="text-center text-red-600 p-8 text-lg">
        <p>You must be logged in to edit properties.</p>
        <Link href="/auth/signin" className="text-blue-500 hover:underline mt-4 inline-block">
          Go to Sign In
        </Link>
      </div>
    );
  }

  if (error && !isLoading && !isSubmitting) { // Display fetch error if not loading/submitting
    return (
      <div className="text-center text-red-600 p-8 text-lg">
        <p>{error}</p>
        <Link href="/properties" className="text-blue-500 hover:underline mt-4 inline-block">
          Back to Properties
        </Link>
      </div>
    );
  }

  return (
    <main className="p-4 max-w-2xl mx-auto bg-white shadow-lg rounded-lg my-8">
      <Link href={`/properties/${propertyId}`} className="text-blue-500 hover:underline mb-4 inline-block">
        &larr; Back to Property Details
      </Link>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Edit Property</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Details */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title:</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price ($):</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location:</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700">Main Image URL:</label>
          <input
            type="url"
            id="image"
            name="image"
            value={formData.image}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., https://example.com/main-image.jpg"
          />
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">Property Type:</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Casa">House</option>
            <option value="Apartamento">Apartment</option>
            <option value="Terreno">Land</option>
            <option value="Oficina">Office</option>
            <option value="Local Comercial">Commercial Space</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700">Bedrooms:</label>
            <input
              type="number"
              id="bedrooms"
              name="bedrooms"
              value={formData.bedrooms}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700">Bathrooms:</label>
            <input
              type="number"
              id="bathrooms"
              name="bathrooms"
              value={formData.bathrooms}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="operation" className="block text-sm font-medium text-gray-700">Operation:</label>
          <select
            id="operation"
            name="operation"
            value={formData.operation}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Venta">Sale</option>
            <option value="Renta">Rent</option>
          </select>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description:</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="4"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            required
          ></textarea>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="furnished"
            name="furnished"
            checked={formData.furnished}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="furnished" className="ml-2 block text-sm font-medium text-gray-700">Furnished</label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="constructionArea" className="block text-sm font-medium text-gray-700">Construction Area (e.g., "200 m²"):</label>
            <input
              type="text"
              id="constructionArea"
              name="constructionArea"
              value={formData.constructionArea}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="landArea" className="block text-sm font-medium text-gray-700">Land Area (e.g., "300 m²"):</label>
            <input
              type="text"
              id="landArea"
              name="landArea"
              value={formData.landArea}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Gallery Images Section */}
        <div className="border-t pt-6 mt-6 border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Gallery Images</h2>
          {formData.images.map((image, index) => (
            <div key={index} className="flex items-center space-x-2 mb-3">
              <input
                type="url"
                value={image.url}
                onChange={(e) => handleImageChange(index, e)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={`Gallery Image URL ${index + 1}`}
              />
              {formData.images.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeImageField(index)}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-3 rounded-md text-sm transition-colors duration-200"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addImageField}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200"
          >
            Add Another Image
          </button>
        </div>

        {/* Submission Feedback */}
        {isSubmitting && <p className="text-blue-600">Updating property...</p>}
        {error && <p className="text-red-600">Error: {error}</p>}
        {success && <p className="text-green-600">Property updated successfully!</p>}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Updating...' : 'Update Property'}
        </button>
      </form>
    </main>
  );
}
// This code is a complete React component for editing a property in a Next.js application.
// It includes form handling, fetching existing property data, and submitting updates.