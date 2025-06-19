export default function PropertyCard({ title, price, location, image }) {
  return (
    <div className="border rounded shadow-sm bg-white overflow-hidden">
      <img src={image} alt={title} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-gray-600">{location}</p>
        <p className="text-green-600 font-bold mt-2">${price.toLocaleString()}</p>
      </div>
    </div>
  );
}