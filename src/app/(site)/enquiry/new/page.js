import { getPublicVehicle } from "@/lib/data/queries";
import { CITIES, VEHICLE_TYPES } from "@/lib/constants/vehicles";
import { isValidAmenity } from "@/lib/constants/amenities";
import EnquiryForm from "@/components/forms/EnquiryForm";
import PageHeader from "@/components/ui/PageHeader";

export const metadata = {
  title: "Request quotes",
};

// Pre-fills from /buses filters (?city=&passengers=&type=&amenities=)
// or from a specific vehicle (?vehicle=veh_1).
export default async function NewEnquiryPage({ searchParams }) {
  const params = await searchParams;
  const initial = {};

  const vehicle = params.vehicle ? await getPublicVehicle(params.vehicle) : null;
  if (vehicle) {
    initial.pickupCity = vehicle.baseCity;
    initial.vehicleType = vehicle.type;
  }
  if (CITIES.includes(params.city)) initial.pickupCity = params.city;
  if (VEHICLE_TYPES.some((t) => t.id === params.type)) initial.vehicleType = params.type;
  if (Number(params.passengers) > 0) initial.passengers = Number(params.passengers);
  const amenities = [params.amenities].flat().filter((a) => a && isValidAmenity(a));
  if (amenities.length) initial.requiredAmenities = amenities;

  return (
    <div className="container" style={{ maxWidth: 900, paddingTop: "var(--space-6)" }}>
      <PageHeader
        title="Tell us about your trip"
        description={
          vehicle
            ? `You're requesting a quote for ${vehicle.title}. We'll also invite similar verified vehicles to quote.`
            : "Verified operators with matching vehicles will send you quotes. Compare them and book the one that suits you."
        }
      />
      <EnquiryForm initialValues={initial} />
    </div>
  );
}
