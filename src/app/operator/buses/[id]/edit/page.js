import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOperator } from "@/lib/auth";
import { getOperatorBus, getOperatorDrivers } from "@/lib/data/queries";
import PageHeader from "@/components/ui/PageHeader";
import BusForm from "@/components/forms/BusForm";

export const metadata = { title: "Edit bus" };

export default async function EditBusPage({ params }) {
  const { id } = await params;
  const viewer = await requireOperator(`/operator/buses/${id}/edit`);
  const [bus, drivers] = await Promise.all([getOperatorBus(id, viewer.id), getOperatorDrivers(viewer.id)]);
  if (!bus) notFound();

  if (viewer.record.status === "rejected") {
    return (
      <>
        <PageHeader title={bus.title} />
        <p className="alert alert-error">Your operator account wasn&apos;t approved. <Link href="/operator/profile"><u>Correct your details and re-apply</u></Link> first.</p>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={`Edit ${bus.title}`}
        description="Saving sends the bus to our team for review again. It's hidden from travellers until it's approved."
      />
      {bus.status === "rejected" && (
        <p className="alert alert-error" style={{ marginBottom: 24 }}><strong>Why it wasn&apos;t approved:</strong> {bus.rejectionReason ?? "No reason given. Contact partner support."}</p>
      )}
      <BusForm bus={bus} drivers={drivers} />
    </>
  );
}
