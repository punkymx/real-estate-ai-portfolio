Property Detail Page: Image Carousel Implementation
This section documents the enhancement of the property detail page (src/app/properties/[id]/page.js) to include an interactive image carousel for displaying property photos, replacing the static gallery.

1. Objective
Improve user experience on the property detail page by providing an interactive way to view multiple property images.

Implement a main image carousel synchronized with a thumbnail navigation carousel.

2. Technology Used: Swiper.js (with React components)
Why Swiper? Swiper is a modern touch slider that is highly performant, flexible, and widely used. Its React components (swiper/react) make integration into Next.js applications straightforward. It supports various modules like navigation, pagination, and thumbnail control.

3. Installation
First, install Swiper as a dependency in your project:

npm install swiper

4. Frontend Implementation (src/app/properties/[id]/page.js)
The existing static image gallery was replaced with two synchronized Swiper instances: a main carousel for large images and a smaller carousel for thumbnails.

Key Changes:

Import Swiper Components and Styles:

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/free-mode';
import 'swiper/css/thumbs';
import { Navigation, Pagination, FreeMode, Thumbs } from 'swiper/modules';

useParams for ID: Ensured the dynamic property ID is correctly retrieved using the useParams hook from next/navigation.

import { useParams } from 'next/navigation';
// ...
const params = useParams();
const propertyId = params.id;

thumbsSwiper State: A new state const [thumbsSwiper, setThumbsSwiper] = useState(null); was introduced to manage the instance of the thumbnail Swiper, allowing it to be linked to the main Swiper.

Combined Image Array: The main property image (property.image) is combined with the gallery images (property.images) into a single array (allImages) to be used by the carousel. This ensures the primary image is part of the interactive gallery.

const allImages = property.image ? [{ id: 'main', url: property.image }, ...property.images] : property.images;

Main Swiper Configuration:

Displays large, full-width images.

Configured with navigation (next/previous arrows), pagination (dots at the bottom), and loop (for continuous scrolling).

thumbs={{ swiper: thumbsSwiper }} links it to the thumbnail Swiper.

priority={img.id === 'main'} is used on the next/image component within the first slide to prioritize loading of the main image for better performance (Largest Contentful Paint).

Thumbnail Swiper Configuration:

Displays smaller, clickable images below the main carousel.

onSwiper={setThumbsSwiper} captures the Swiper instance.

slidesPerView={4} shows four thumbnails at a time.

freeMode={true} allows for more fluid scrolling of thumbnails.

watchSlidesProgress={true} is crucial for synchronization with the main Swiper.

Includes basic styling for hover effects to indicate interactivity.

Code Snippet (Relevant part of src/app/properties/[id]/page.js):

// ... (imports and state definitions) ...

return (
  <main className="p-4 max-w-4xl mx-auto bg-white shadow-lg rounded-lg my-8">
    {/* ... (Back to Properties link and title) ... */}

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
          pagination={{ clickable: true }}
          loop={true}
        >
          {allImages.map((img) => (
            <SwiperSlide key={img.id || img.url}>
              <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
                <Image
                  src={img.url}
                  alt={`Property image for ${property.title}`}
                  layout="fill"
                  objectFit="cover"
                  priority={img.id === 'main'}
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

    {/* ... (Basic Details, Description, Placeholder for actions) ... */}
  </main>
);

5. Verification
After updating the code and restarting the Next.js development server, navigate to any property detail page (e.g., http://localhost:3000/properties/[PROPERTY_ID]).

The image gallery should now display as an interactive carousel with navigation arrows, pagination dots, and clickable thumbnails.