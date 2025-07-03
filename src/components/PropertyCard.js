// src/components/PropertyCard.js
import React from 'react';
import Image from 'next/image';
import Link from 'next/link'; // Import the Link component

export default function PropertyCard({
  id, // Ensure 'id' is passed as a prop
  title,
  price,
  location,
  image,
  type,
  bedrooms,
  bathrooms,
}) {
  return (
    // Wrap the entire card with Next.js Link component
    // passHref is important when the Link's child is a custom component or a styled component
    <Link href={`/properties/${id}`} passHref>
      <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-pointer">
        {/* Image Container */}
        <div className="relative w-full h-48">
          <Image
            src={image || '/images/default-property.jpg'} // Fallback image if 'image' is null/undefined
            alt={title}
            layout="fill"
            objectFit="cover"
            className="rounded-t-lg"
          />
        </div>

        {/* Property Details */}
        <div className="p-4">
          <h2 className="text-xl font-bold text-gray-800 mb-2">{title}</h2>
          <p className="text-gray-700 text-lg font-semibold mb-1">${price?.toLocaleString()}</p>
          <p className="text-gray-600 text-sm mb-2">{location}</p>
          <div className="flex items-center text-gray-500 text-sm">
            <span className="mr-3">{type}</span>
            <span className="mr-3">{bedrooms} bed</span>
            <span>{bathrooms} bath</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
