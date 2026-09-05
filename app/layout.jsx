import { Fraunces, Instrument_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["opsz"],
});
const instrument = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
});
const plex = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex",
});

export const metadata = {
  title: "JHANARICH — Premium Cookware, Forged in Visakhapatnam",
  description:
    "JHANARICH manufactures premium triply, non-stick and stainless steel cookware for homes, hotels and commercial kitchens. OEM & private-label solutions from Visakhapatnam, India.",
  icons: { icon: "/assets/logo.png" },
  openGraph: {
    title: "JHANARICH — Premium Cookware, Forged in Visakhapatnam",
    description:
      "Triply, non-stick and stainless steel cookware — engineered for homes, hotels and commercial kitchens. OEM & private label.",
    images: ["/assets/wa-frypan-poster.jpg"],
    type: "website",
  },
};

export const viewport = { themeColor: "#151009" };

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${instrument.variable} ${plex.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
