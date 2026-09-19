import {
  useEffect,
  useState,
} from "react";
import { useLocation } from "react-router-dom";

import {
  Helmet,
} from "react-helmet-async";

import MainLayout from "./layouts/MainLayout";
import AppRoutes from "./routes/AppRoutes";

import {
  getStoreInfo,
} from "./services/storeService";

import Loading from "./components/ui/Loading";


function App() {
  const location = useLocation();
  const isManagerRoute = location.pathname.replace(/\/$/, "").endsWith("/manage");

  const [
    store,
    setStore,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);


  useEffect(() => {
    const redirect = new URLSearchParams(window.location.search).get("redirect");
    if (redirect && redirect.startsWith("/")) {
      window.history.replaceState({}, "", redirect);
    }
    let mounted = true;


    async function loadStoreInfo() {
      try {
        const data =
          await getStoreInfo();


        if (!mounted) {
          return;
        }


        setStore(
          data || {}
        );
      } catch (error) {
        console.error(
          "App SEO:",
          error
        );


        if (mounted) {
          setStore({});
        }
      } finally {
        if (mounted) {
          setLoading(
            false
          );
        }
      }
    }


    loadStoreInfo();


    return () => {
      mounted = false;
    };
  }, []);


  if (isManagerRoute) {
    return (
      <MainLayout>
        <AppRoutes />
      </MainLayout>
    );
  }

  if (loading) {
    return (
      <Loading />
    );
  }


  const title =
    store?.seoTitle ||
    store?.name ||
    "OPTICANA | عيونك أحلى معانا";


  const description =
    store?.seoDescription ||
    "";


  const keywords =
    store?.seoKeywords ||
    "";


  const socialImage =
    store?.socialImage ||
    null;

  const favicon =
    store?.favicon ||
    "/opticana-icon.png";


  return (
    <>
      <Helmet>

        <link rel="icon" type="image/png" href={favicon} />
        <link rel="apple-touch-icon" href={favicon} />

        <title>
          {title}
        </title>


        {description && (
          <meta
            name="description"
            content={
              description
            }
          />
        )}


        {keywords && (
          <meta
            name="keywords"
            content={
              keywords
            }
          />
        )}


        {store?.name && (
          <meta
            property="og:site_name"
            content={
              store.name
            }
          />
        )}


        <meta
          property="og:title"
          content={
            title
          }
        />


        {description && (
          <meta
            property="og:description"
            content={
              description
            }
          />
        )}


        {socialImage && (
          <meta
            property="og:image"
            content={
              socialImage
            }
          />
        )}

      </Helmet>


      <MainLayout>
        <AppRoutes />
      </MainLayout>
    </>
  );
}


export default App;
