import { Manrope, Playfair_Display } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata = {
  title: {
    default: "General Travels — Premium bus & coach hire",
    template: "%s · General Travels",
  },
  description:
    "Hire verified luxury coaches, buses and tempo travellers at a fixed, upfront price. Every operator and every bus is checked by General Travels.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${manrope.variable} ${playfair.variable}`}>
      <body>{children}</body>
    </html>
  );
}
