import Link from "next/link";
import { requireOperator } from "@/lib/auth";
import PageHeader from "@/components/ui/PageHeader";
import BusForm from "@/components/forms/BusForm";

export const metadata = { title: "Add a bus" };

export default async function NewBusPage() {
  const viewer = await requireOperator("/operator/buses/new");

  if (viewer.record.status === "rejected") {
    return (
      <>
        <PageHeader title="Add a bus" />
        <p className="alert alert-error">Your operator account wasn&apos;t approved, so new buses can&apos;t be added. <Link href="/operator"><u>Back to dashboard</u></Link></p>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Add a bus"
        description="Customers see these details and a fixed fare calculated from your rates. Our team reviews every bus before it goes live."
      />
      <BusForm />
    </>
  );
}
