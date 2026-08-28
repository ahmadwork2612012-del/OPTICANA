import {
  useEffect,
  useState,
} from "react";

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
  const [
    store,
    setStore,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);


  useEffect(() => {
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


  return (
    <>
      <Helmet>

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