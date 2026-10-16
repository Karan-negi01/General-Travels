import Link from "next/link";
import { requireOperator } from "@/lib/auth";
import { getOperatorDrivers } from "@/lib/data/queries";
import PageHeader from "@/components/ui/PageHeader";
import BusForm from "@/components/forms/BusForm";

export const metadata = { title: "Add a bus" };

export default async function NewBusPage() {
  const viewer = await requireOperator("/operator/buses/new");

  if (viewer.record.status === "rejected") {
    return (
      <>
        <PageHeader title="Add a bus" />
        <p className="alert alert-error">Your operator account wasn&apos;t approved, so new buses can&apos;t be added. <Link href="/operator/profile"><u>Correct your details and re-apply</u></Link></p>
      </>
    );
  }

  const drivers = await getOperatorDrivers(viewer.id);
  return (
    <>
      <PageHeader
        title="Add a bus"
        description="Travellers see these details, your photos and a fixed fare calculated from your rates. Our team checks every bus and its documents before it goes live."
      />
      <BusForm drivers={drivers} />
    </>
  );
}
