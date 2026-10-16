import { notFound } from "next/navigation";
import { requireOperator } from "@/lib/auth";
import { getOperatorDriver } from "@/lib/data/queries";
import PageHeader from "@/components/ui/PageHeader";
import DriverForm from "@/components/forms/DriverForm";

export const metadata = { title: "Edit driver" };

export default async function EditDriverPage({ params }) {
  const { id } = await params;
  const viewer = await requireOperator(`/operator/drivers/${id}/edit`);
  const driver = await getOperatorDriver(id, viewer.id);
  if (!driver) notFound();

  return (
    <>
      <PageHeader title={`Edit ${driver.name}`} description="Saving sends the driver to our team for review again. Buses with this driver are hidden until it's approved." />
      {driver.status === "rejected" && (
        <p className="alert alert-error" style={{ marginBottom: 24 }}><strong>Why it wasn&apos;t approved:</strong> {driver.rejectionReason ?? "No reason given. Contact partner support."}</p>
      )}
      <DriverForm driver={driver} />
    </>
  );
}
