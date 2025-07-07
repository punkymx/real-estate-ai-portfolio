// src/app/properties/[id]/page.js
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation'; // Import useRouter for redirection
import { useSession } from 'next-auth/react'; // Import useSession for auth check

// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/free-mode'; // For thumbnail gallery
import 'swiper/css/thumbs';    // For thumbnail gallery

// Import required modules from Swiper
import { Navigation, Pagination, FreeMode, Thumbs } from 'swiper/modules';


export default function PropertyDetailPage() {
  const params = useParams();
  const propertyId = params.id;
  const router = useRouter(); // Initialize useRouter
  const { data: session, status } = useSession(); // Get session data and loading status

  const [property, setProperty] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [thumbsSwiper, setThumbsSwiper] = useState(null); // State for the thumbnail swiper instance
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // State for delete confirmation modal
  const [isDeleting, setIsDeleting] = useState(false); // State for delete loading

  useEffect(() => {
    if (!propertyId) {
      setIsLoading(false);
      setError("No property ID provided in the URL.");
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
        setProperty(data);
      } catch (err) {
        console.error("Failed to fetch property details:", err);
        setError(err.message === 'Property not found' ? 'Property not found.' : 'Failed to load property details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId]);

  // Handle delete operation
  const handleDelete = async () => {
    setShowDeleteConfirm(true); // Show confirmation modal
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    setError(null); // Clear any previous errors

    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // If successful (204 No Content), redirect to properties catalog
      console.log('Property deleted successfully!');
      router.push('/properties'); // Redirect to the main properties catalog
    } catch (err) {
      console.error('Error deleting property:', err);
      setError(err.message || 'Failed to delete property. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false); // Close confirmation modal
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false); // Close confirmation modal
  };


  if (isLoading) {
    return <p className="text-center text-blue-600 p-8 text-lg">Loading property details...</p>;
  }

  // Display fetch error if not currently deleting
  if (error && !isDeleting) {
    return (
      <div className="text-center text-red-600 p-8 text-lg">
        <p>{error}</p>
        <Link href="/properties" className="text-blue-500 hover:underline mt-4 inline-block">
          Back to Properties
        </Link>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center text-gray-600 p-8 text-lg">
        <p>No property data available.</p>
        <Link href="/properties" className="text-blue-500 hover:underline mt-4 inline-block">
          Back to Properties
        </Link>
      </div>
    );
  }

  // Combine main image and gallery images for the carousel
  // Ensure 'property.image' is always first if it exists
  const allImages = property.image ? [{ id: 'main', url: property.image }, ...property.images] : property.images;


  return (
    <main className="p-4 max-w-4xl mx-auto bg-white shadow-lg rounded-lg my-8">
      <Link href="/properties" className="text-blue-500 hover:underline mb-4 inline-block">
        &larr; Back to Properties
      </Link>
      <h1 className="text-4xl font-extrabold text-gray-900 mb-6">{property.title}</h1>

      {/* Main Image / Gallery Section (using Swiper) */}
      {allImages && allImages.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Property Photos</h2>
          {/* Main Swiper (large images) */}
          <Swiper
            spaceBetween={10}
            navigation={true}
            thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
            modules={[FreeMode, Navigation, Thumbs, Pagination]}
            className="mySwiper2 rounded-lg"
            pagination={{ clickable: true }} // Add pagination dots
            loop={true} // Enable looping
          >
            {allImages.map((img) => (
              <SwiperSlide key={img.id || img.url}> {/* Use img.url as fallback key */}
                <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
                  <Image
                    src={img.url}
                    alt={`Property image for ${property.title}`}
                    layout="fill"
                    objectFit="cover"
                    priority={img.id === 'main'} // Prioritize main image
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Thumbnail Swiper */}
          <Swiper
            onSwiper={setThumbsSwiper}
            spaceBetween={10}
            slidesPerView={4}
            freeMode={true}
            watchSlidesProgress={true}
            modules={[FreeMode, Navigation, Thumbs]}
            className="mySwiper mt-4 rounded-lg"
          >
            {allImages.map((img) => (
              <SwiperSlide key={img.id || img.url}>
                <div className="relative w-full h-24 cursor-pointer opacity-70 hover:opacity-100 transition-opacity duration-200">
                  <Image
                    src={img.url}
                    alt={`Thumbnail for ${property.title}`}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-md"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}

      {/* Basic Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-gray-700">
        <p className="text-lg"><span className="font-semibold">Price:</span> ${property.price?.toLocaleString()}</p>
        <p className="text-lg"><span className="font-semibold">Location:</span> {property.location}</p>
        <p className="text-lg"><span className="font-semibold">Type:</span> {property.type}</p>
        <p className="text-lg"><span className="font-semibold">Bedrooms:</span> {property.bedrooms}</p>
        <p className="text-lg"><span className="font-semibold">Bathrooms:</span> {property.bathrooms}</p>
        <p className="text-lg"><span className="font-semibold">Operation:</span> {property.operation}</p>
        <p className="text-lg"><span className="font-semibold">Furnished:</span> {property.furnished ? 'Yes' : 'No'}</p>
        {property.constructionArea && <p className="text-lg"><span className="font-semibold">Construction Area:</span> {property.constructionArea}</p>}
        {property.landArea && <p className="text-lg"><span className="font-semibold">Land Area:</span> {property.landArea}</p>}
      </div>

      {/* Description */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Description</h2>
        <p className="text-gray-700 leading-relaxed">{property.description}</p>
      </div>

      {/* Action Buttons (Edit/Delete) - Conditionally rendered based on authentication */}
      {status === 'authenticated' && (
        <div className="flex justify-end mt-8">
          <Link href={`/properties/${property.id}/edit`} passHref>
            <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md mr-2 transition-colors duration-200">
              Edit Property
            </button>
          </Link>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? 'Deleting...' : 'Delete Property'}
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-gray-700 mb-6">Are you sure you want to delete this property? This action cannot be undone.</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={cancelDelete}
                disabled={isDeleting}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}