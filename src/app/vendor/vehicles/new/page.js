import VehicleForm from "@/components/forms/VehicleForm";
import PageHeader from "@/components/ui/PageHeader";

export const metadata = { title: "Add vehicle" };

export default function NewVehiclePage() {
  return (
    <div style={{ maxWidth: 960 }}>
      <PageHeader
        title="Add a vehicle"
        description="The more amenities you add, the more trip requests you'll match. Customers filter by them."
      />
      <VehicleForm />
    </div>
  );
}
