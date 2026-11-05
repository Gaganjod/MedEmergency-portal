import "./globals.css";
import { VisualEditsMessenger } from "orchids-visual-edits";
import { Toaster } from "sonner";

export const metadata = {
  title: "MedEmergency | Life-Saving Emergency Care at Your Fingertips",
  description: "24/7 Medical Emergency Response System - One tap to save a life. Track ambulances, connect with hospitals, and get immediate medical assistance.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <Toaster position="top-right" richColors />
        <VisualEditsMessenger />
      </body>
    </html>
  );
}
