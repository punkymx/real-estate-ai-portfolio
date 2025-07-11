// src/app/page.js
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-8 lg:p-3">{/* banner p-3*/}
      {/* Hero Section */}
      <section className="relative w-full max-w-6xl mx-auto rounded-lg overflow-hidden shadow-xl mb-8">
        {/* Background Image with Overlay */}
        <div className="relative w-full h-[50px] md:h-[200px] lg:h-[300px]">
          <Image
            src="/banner1.JPG"
            alt="Modern house with swimming pool"
            layout="fill"
            objectFit="cover"
            priority // Prioritize loading for LCP
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-black opacity-20"></div>
          {/* Text Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-6">
            <h1 className="text-2xl md:text-4xl font-extrabold leading-tight mb-6 drop-shadow-lg">
              Find Your Ideal Space, Invest with Confidence
            </h1>
            <p className="text-lg md:text-xl max-w-2xl drop-shadow-md">
              Explore houses, apartments, land, vacation rentals, and more.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3"> {/* bottom mb-4 start..*/}
          Start Your Property Search Today
        </h2>
        <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
          Whether you're looking for a new home, an investment opportunity, or a perfect getaway,
          our diverse listings have something for everyone.
        </p>
        <Link href="/properties" passHref>
          <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out">
            View Properties
          </button>
        </Link>
      </section>

      {/* Placeholder for Featured Properties (Future Section) */}
      <section className="w-full max-w-6xl mx-auto mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-8">
          Featured Properties
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Example Placeholder Card 1 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300">
            <Image
              src="https://placehold.co/400x250/E0E7FF/000000?text=House+1"
              alt="Placeholder House 1"
              width={400}
              height={250}
              layout="responsive"
            />
            <div className="p-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Modern Family Home</h3>
              <p className="text-gray-600 mb-4">Spacious house with garden in a quiet neighborhood.</p>
              <span className="text-blue-600 font-bold">$350,000</span>
            </div>
          </div>
          {/* Example Placeholder Card 2 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300">
            <Image
              src="https://placehold.co/400x250/E0E7FF/000000?text=Apartment+1"
              alt="Placeholder Apartment 1"
              width={400}
              height={250}
              layout="responsive"
            />
            <div className="p-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Downtown Apartment</h3>
              <p className="text-gray-600 mb-4">Stylish apartment with city views, close to amenities.</p>
              <span className="text-blue-600 font-bold">$220,000</span>
            </div>
          </div>
          {/* Example Placeholder Card 3 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300">
            <Image
              src="https://placehold.co/400x250/E0E7FF/000000?text=Land+1"
              alt="Placeholder Land 1"
              width={400}
              height={250}
              layout="responsive"
            />
            <div className="p-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Prime Land for Development</h3>
              <p className="text-gray-600 mb-4">Large plot suitable for residential or commercial projects.</p>
              <span className="text-blue-600 font-bold">$180,000</span>
            </div>
          </div>
        </div>
      </section>

      {/* About Us/Contact (Future Section) */}
      <section className="w-full max-w-6xl mx-auto text-center py-12 border-t border-gray-200">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
          Your Trusted Partner in Real Estate
        </h2>
        <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
          We connect you with the best properties and investment opportunities.
          Contact us today to find your dream property.
        </p>
        <Link href="/contact" passHref>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out">
            Contact Us
          </button>
        </Link>
      </section>
    </main>
  );
}
