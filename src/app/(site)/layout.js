import SiteHeader from "@/components/layout/SiteHeader";
import Footer from "@/components/layout/Footer";

export default function SiteLayout({ children }) {
  return (
    <>
      <SiteHeader />
      <main>{children}</main>
      <Footer />
    </>
  );
}
