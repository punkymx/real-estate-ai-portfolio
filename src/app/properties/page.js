import PropertyCard from "@/components/PropertyCard";
import properties from "@/data/properties";

export default function PropertiesPage() {
  return (
    <main className="p-4">
      <h1 className="text-3xl font-bold mb-4">Property Catalog</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <PropertyCard
            key={property.id}
            title={property.title}
            price={property.price}
            location={property.location}
            image={property.image}
          />
        ))}
      </div>
    </main>
  );
}
