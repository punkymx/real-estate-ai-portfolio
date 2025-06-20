// src/data/properties.js

const properties = [
  {
    id: 1,
    title: "Modern Loft in Downtown Mérida",
    price: 125000,
    location: "Centro, Mérida",
    image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=400&q=80",
    type: "Apartment", // <-- Añade el tipo de propiedad
    bedrooms: 1,      // <-- Añade el número de habitaciones
    bathrooms: 1,     // <-- Añade el número de baños
  },
  {
    id: 2,
    title: "Spacious Family Home",
    price: 185000,
    location: "Altabrisa, Mérida",
    image: "https://images.unsplash.com/photo-1599423300746-b62533397364?auto=format&fit=crop&w=400&q=80",
    type: "House",    // <-- Añade el tipo de propiedad
    bedrooms: 3,      // <-- Añade el número de habitaciones
    bathrooms: 2,     // <-- Añade el número de baños
  },
  {
    id: 3,
    title: "Luxury Condo with Pool",
    price: 245000,
    location: "Montebello, Mérida",
    image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=400&q=80",
    type: "Apartment", // <-- Añade el tipo de propiedad
    bedrooms: 2,      // <-- Añade el número de habitaciones
    bathrooms: 2,     // <-- Añade el número de baños
  },
  // ¡Asegúrate de añadir estos campos a TODAS tus propiedades!
  // Si tienes más propiedades, dales valores adecuados.
  {
    id: 4,
    title: "Rural Land for Sale",
    price: 50000,
    location: "Afueras de Mérida",
    image: "https://images.unsplash.com/photo-1578635467406-8d6263f35c24?auto=format&fit=crop&w=400&q=80",
    type: "Land",
    bedrooms: 0,
    bathrooms: 0,
  }
];

export default properties;