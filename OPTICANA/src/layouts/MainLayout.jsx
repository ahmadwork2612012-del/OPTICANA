import {
  useEffect,
  useState,
} from "react";
import { useLocation } from "react-router-dom";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

import Maintenance from "../pages/Maintenance";

import {
  getStoreInfo,
} from "../services/storeService";


function MainLayout({
  children,
}) {
  const location = useLocation();
  const isManagerRoute = location.pathname.replace(/\/$/, "").endsWith("/manage");

  const [
    maintenance,
    setMaintenance,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [storeEnabled, setStoreEnabled] = useState(true);


  useEffect(() => {
    let mounted = true;

    async function loadStoreSettings() {
      try {
        const store =
          await getStoreInfo();

        if (!mounted) {
          return;
        }

        setMaintenance(
          store?.maintenance ||
            {
              enabled: false,
            }
        );
        setStoreEnabled(store?.storeEnabled !== false);
      } catch (error) {
        console.error(
          "MainLayout:",
          error
        );

        if (mounted) {
          setMaintenance({
            enabled: false,
          });
        }
      } finally {
        if (mounted) {
          setLoading(
            false
          );
        }
      }
    }

    loadStoreSettings();

    return () => {
      mounted = false;
    };
  }, []);

  // Keep hooks unconditional: the manager route can be entered and left without
  // remounting this layout. Returning before hooks made that transition unsafe.
  if (isManagerRoute) {
    return children;
  }


  /* =====================================
     INITIAL LOAD
  ===================================== */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fbfcfa]">

        <div className="flex flex-col items-center gap-4">

          <div className="h-11 w-11 animate-spin rounded-full border-4 border-[#dfe6dc] border-t-[#657361]" />

          <p className="text-sm font-bold text-[#7c8779]">
            جاري التحميل...
          </p>

        </div>

      </div>
    );
  }


  /* =====================================
     MAINTENANCE MODE
  ===================================== */

  if (!storeEnabled || maintenance?.enabled) {
    return <Maintenance />;
  }


  /* =====================================
     NORMAL STORE
  ===================================== */

  return (
    <div className="min-h-screen bg-[#fbfcfa] text-[#20251f]">

      <Navbar />

      {children}

      <Footer />

    </div>
  );
}


export default MainLayout;
