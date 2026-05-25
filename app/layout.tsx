import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "منصة الباشمهندس سامح مجدي | Eng-SamehMagdi",
  description: "هتفهم رياضيات بسهوله امتحانات وواجبات ومسابقات مستمرة",
  manifest: "/manifest.json", // 👈 أضفنا السطر ده
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "منصة الباشمهندس سامح مجدي | Eng-SamehMagdi",
    description: "هتفهم رياضيات بسهوله امتحانات وواجبات ومسابقات مستمرة",
    images: [
      {
        url: "/slide-1.png",
        width: 1200,
        height: 630,
        alt: "منصة الباشمهندس سامح مجدي",
      },
    ],
    locale: "ar_EG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "منصة الباشمهندس سامح مجدي | Eng-SamehMagdi",
    description: "هتفهم رياضيات بسهوله امتحانات وواجبات ومسابقات مستمرة",
    images: ["/slide-1.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      {/* 👇 أضفنا الـ head عشان نضيف رابط الـ manifest يدوياً */}
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body style={{ margin: 0, padding: 0, fontFamily: "Cairo, Poppins, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}