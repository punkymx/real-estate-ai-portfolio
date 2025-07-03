// src/app/properties/create/page.js
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreatePropertyPage() {
  const router = useRouter();

  // State to hold form data
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    location: '',
    image: '', // Main image URL
    type: 'Casa', // Default type
    bedrooms: '',
    bathrooms: '',
    operation: 'Venta', // Default operation
    description: '',
    furnished: false,
    constructionArea: '',
    landArea: '',
    images: [{ url: '' }], // Array for gallery images, start with one empty field
  });

  // State for loading and error messages during form submission
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Handle input changes for main form fields
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle changes for gallery image URLs
  const handleImageChange = (index, e) => {
    const newImages = [...formData.images];
    newImages[index].url = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      images: newImages,
    }));
  };

  // Add a new empty image URL field
  const addImageField = () => {
    setFormData((prevData) => ({
      ...prevData,
      images: [...prevData.images, { url: '' }],
    }));
  };

  // Remove an image URL field
  const removeImageField = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData((prevData) => ({
      ...prevData,
      images: newImages,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Filter out empty image URLs before sending
      const imagesToSend = formData.images.filter(img => img.url.trim() !== '');

      // Convert numeric fields to actual numbers (Float for price, Int for bedrooms/bathrooms)
      const dataToSend = {
        ...formData,
        price: formData.price ? parseFloat(formData.price) : null, // Convert price to float
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms, 10) : null, // Convert bedrooms to int
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms, 10) : null, // Convert bathrooms to int
        images: imagesToSend,
      };

      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend), // Use the converted dataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const newProperty = await response.json();
      setSuccess(true);
      console.log('Property created successfully:', newProperty);

      // Optionally clear form or redirect
      setFormData({ // Clear form after successful submission
        title: '',
        price: '',
        location: '',
        image: '',
        type: 'Casa',
        bedrooms: '',
        bathrooms: '',
        operation: 'Venta',
        description: '',
        furnished: false,
        constructionArea: '',
        landArea: '',
        images: [{ url: '' }],
      });

      // Redirect to the new property's detail page or property catalog after a short delay
      setTimeout(() => {
        router.push(`/properties/${newProperty.id}`); // Redirect to detail page
        // Or router.push('/properties'); // Redirect to catalog
      }, 2000);

    } catch (err) {
      console.error('Error creating property:', err);
      setError(err.message || 'Failed to create property. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="p-4 max-w-2xl mx-auto bg-white shadow-lg rounded-lg my-8">
      <Link href="/properties" className="text-blue-500 hover:underline mb-4 inline-block">
        &larr; Back to Property Catalog
      </Link>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Create New Property</h1>

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
            type="url" // Use type="url" for image URLs
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
            {/* Add more types as needed */}
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
        {isLoading && <p className="text-blue-600">Creating property...</p>}
        {error && <p className="text-red-600">Error: {error}</p>}
        {success && <p className="text-green-600">Property created successfully!</p>}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creating...' : 'Create Property'}
        </button>
      </form>
    </main>
  );
}
