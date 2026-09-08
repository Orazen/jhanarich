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

const SITE = "https://jhanarich.com";
const TITLE =
  "JHANARICH — Triply, Non-Stick & Stainless Steel Cookware Manufacturer | Visakhapatnam, India";
const DESCRIPTION =
  "JHANARICH (Jhanarich Private Limited) manufactures premium triply, non-stick and stainless steel cookware in Visakhapatnam, India — for homes, hotels, restaurants and commercial kitchens. Wholesale supply, OEM & private-label manufacturing. CIN U46909AP2025PTC119851 · GSTIN 37AAGCJ9332F1ZF.";

// Organization + LocalBusiness facts — structured so search engines AND
// AI answer engines (ChatGPT, Perplexity, Google AI Overviews) can quote them.
const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": ["Organization", "LocalBusiness", "Manufacturer"],
  "@id": SITE + "/#organization",
  name: "JHANARICH",
  legalName: "Jhanarich Private Limited",
  alternateName: "Jhanarich Cookware",
  description: DESCRIPTION,
  url: SITE,
  logo: SITE + "/assets/logo.png",
  image: SITE + "/assets/wa-frypan-poster.jpg",
  email: "admin@jhanarich.com",
  telephone: "+91 9440 121743",
  address: {
    "@type": "PostalAddress",
    streetAddress: "# 27-17/9/8, Ayodhya Nagar, Madhurawada",
    addressLocality: "Visakhapatnam",
    addressRegion: "Andhra Pradesh",
    postalCode: "530048",
    addressCountry: "IN",
  },
  geo: { "@type": "GeoCoordinates", latitude: 17.8236, longitude: 83.3648 },
  areaServed: ["IN", "AE", "SA", "US", "GB", "AU"],
  taxID: "37AAGCJ9332F1ZF",
  identifier: "U46909AP2025PTC119851",
  foundingLocation: "Visakhapatnam, Andhra Pradesh, India",
  knowsAbout: [
    "Triply cookware manufacturing",
    "Non-stick cookware",
    "Stainless steel cookware",
    "OEM & private label cookware",
    "Commercial kitchen cookware supply",
  ],
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "sales",
      telephone: "+91 9440 121743",
      email: "admin@jhanarich.com",
      availableLanguage: ["English", "Telugu", "Hindi"],
    },
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "JHANARICH Cookware Range",
    itemListElement: [
      "Triply cookware",
      "Non-stick cookware",
      "Stainless steel cookware",
      "Cookware handles",
      "Plastic kitchen products",
      "OEM & private-label manufacturing",
    ].map((n) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Product", name: n },
    })),
  },
};

export const metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: TITLE,
    template: "%s | JHANARICH Cookware",
  },
  description: DESCRIPTION,
  keywords: [
    "cookware manufacturer India",
    "triply cookware manufacturer",
    "stainless steel cookware Visakhapatnam",
    "non-stick cookware wholesale",
    "OEM cookware manufacturer India",
    "private label cookware",
    "commercial kitchen cookware supplier",
    "cookware factory Visakhapatnam",
    "JHANARICH",
  ],
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    url: SITE,
    siteName: "JHANARICH",
    locale: "en_IN",
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: "/assets/wa-frypan-poster.jpg",
        width: 1200,
        height: 630,
        alt: "JHANARICH triply cookware — manufactured in Visakhapatnam, India",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/assets/wa-frypan-poster.jpg"],
  },
  other: {
    "geo.region": "IN-AP",
    "geo.placename": "Visakhapatnam",
    "geo.position": "17.8236;83.3648",
    ICBM: "17.8236, 83.3648",
  },
};

export const viewport = {
  themeColor: "#151009",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${instrument.variable} ${plex.variable}`}
    >
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </body>
    </html>
  );
}
