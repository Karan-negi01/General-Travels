import { BadgeIndianRupee, BellRing, ShieldCheck, Headset } from "lucide-react";
import VendorRegisterForm from "@/components/forms/VendorRegisterForm";
import styles from "./page.module.css";

export const metadata = {
  title: "List your buses & tempo travellers",
};

const BENEFITS = [
  { icon: BellRing, title: "Trip requests on your phone", text: "Get notified when a customer needs a vehicle you own, in the cities you serve." },
  { icon: BadgeIndianRupee, title: "Quote your own price", text: "You decide what to charge for each trip. No fixed rate cards." },
  { icon: ShieldCheck, title: "Verified customers", text: "Corporates, government bodies and institutions, all booked through General Travels." },
  { icon: Headset, title: "Help with onboarding", text: "Not comfortable with apps? Our team will list your vehicles for you." },
];

export default function BecomePartnerPage() {
  return (
    <div className={`container ${styles.layout}`}>
      <div>
        <p className={styles.eyebrow}>For bus &amp; tempo traveller owners</p>
        <h1 className={styles.title}>Get more bookings for your fleet</h1>
        <p className="muted">
          General Travels has served corporate, government and group travellers for 15 years. List your vehicles and
          receive trip requests that match them.
        </p>
        <ul className={styles.benefits}>
          {BENEFITS.map(({ icon: Icon, title, text }) => (
            <li key={title}>
              <Icon size={22} />
              <div>
                <h3>{title}</h3>
                <p className="muted">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="card">
        <h2 className={styles.formTitle}>Register your business</h2>
        <VendorRegisterForm />
      </div>
    </div>
  );
}
