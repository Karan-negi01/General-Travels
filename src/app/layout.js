import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "General Travels — Charter buses & tempo travellers",
    template: "%s · General Travels",
  },
  description:
    "Hire verified buses, luxury coaches and tempo travellers for corporate, government, institutional and group travel. Compare quotes from trusted operators.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body>{children}</body>
    </html>
  );
}
