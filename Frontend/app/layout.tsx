import "./globals.css";
import Providers from "./Providers";

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning = {true} className="h-screen w-screen flex">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
