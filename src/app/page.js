export default function Home() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
  {/* Banner */}
  <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden shadow-lg mb-10">
    <img
      src="/banner1.JPG"
      alt="Banner Inmuebles"
      className="absolute w-full h-full object-cover"
    />
    <div className="absolute inset-0 bg-opacity-20 z-10 flex items-center justify-center">
      <h1 className="text-white text-3xl md:text-4xl font-bold text-center drop-shadow-lg">
  Vive Mérida, Invierte con Confianza
</h1>

    </div>
  </div>

  {/* Intro y botón */}
  <div className="text-center">
    <p className="text-lg text-gray-600 mb-6">
      Explora casas, departamentos y terrenos en las mejores zonas de Mérida, Yucatán.
    </p>
    <a
      href="/properties"
      className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300"
    >
      Ver Propiedades
    </a>
  </div>
</main>

  );
}
