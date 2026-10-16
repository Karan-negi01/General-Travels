import { requireOperator } from "@/lib/auth";
import PageHeader from "@/components/ui/PageHeader";
import DriverForm from "@/components/forms/DriverForm";

export const metadata = { title: "Add a driver" };

export default async function NewDriverPage() {
  await requireOperator("/operator/drivers/new");
  return (
    <>
      <PageHeader title="Add a driver" description="Travellers see the driver's name, photo and phone number once they've paid for a trip. Our team verifies the licence and ID first." />
      <DriverForm />
    </>
  );
}
