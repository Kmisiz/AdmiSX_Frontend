import type { ReactNode } from "react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

interface RootLayoutProps {
  children: ReactNode;
}

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <>
      <Header />
      <main className="flex-grow w-full bg-[var(--color-canvas-soft)]">
        {children}
      </main>
      <Footer />
    </>
  );
};

export default RootLayout;
