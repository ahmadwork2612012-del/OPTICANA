import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageCircle,
  Minus,
  Package,
  Plus,
  ShoppingCart,
  Star,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import toast from "react-hot-toast";

import {
  getProductById,
  getProducts,
} from "../services/productService";

import {
  getStoreInfo,
} from "../services/storeService";

import {
  getApprovedReviews,
} from "../services/reviewService";

import useCartStore from "../store/cartStore";
import useFavoriteStore from "../store/favoriteStore";

import ProductCard from "../components/cards/ProductCard";
import Loading from "../components/ui/Loading";


/* =====================================
   IMAGE URL
===================================== */

function getImageUrl(
  image
) {
  if (
    typeof image ===
    "string"
  ) {
    return image;
  }

  return (
    image?.url ||
    null
  );
}


/* =====================================
   PRODUCT DETAILS
===================================== */

function ProductDetails() {
  const {
    id,
  } = useParams();


  const [
    product,
    setProduct,
  ] = useState(null);


  const [
    allProducts,
    setAllProducts,
  ] = useState([]);


  const [
    store,
    setStore,
  ] = useState(null);


  const [
    reviews,
    setReviews,
  ] = useState([]);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    selectedImage,
    setSelectedImage,
  ] = useState(0);


  const [
    quantity,
    setQuantity,
  ] = useState(1);


  /* =====================================
     STORES
  ===================================== */

  const addToCart =
    useCartStore(
      (state) =>
        state.addToCart
    );


  const favorites =
    useFavoriteStore(
      (state) =>
        state.favorites
    );


  const toggleFavorite =
    useFavoriteStore(
      (state) =>
        state.toggleFavorite
    );


  const isFavorite =
    favorites.some(
      (item) =>
        String(
          item.id
        ) ===
        String(
          product?.id
        )
    );


  /* =====================================
     LOAD ADMIN DATA
  ===================================== */

  const loadProduct =
    async () => {
      try {
        setLoading(
          true
        );


        const [
          nextProduct,
          nextProducts,
          nextStore,
          approvedReviews,
        ] =
          await Promise.all([
            getProductById(id),
            getProducts(),
            getStoreInfo(),
            getApprovedReviews(),
          ]);


        /* =========================
           CURRENT PRODUCT
        ========================== */

        const normalizedProducts =
          Array.isArray(
            nextProducts
          )
            ? nextProducts
            : [];


        const currentProduct =
          normalizedProducts.find(
            (item) =>
              String(
                item?.id
              ) ===
              String(id)
          ) ||
          nextProduct ||
          null;


        /*
         * المنتج يعتبر صالحًا للعرض
         * فقط إذا كان منشورًا ومسموحًا
         * ظهوره في المتجر.
         */
        const isVisible =
          Boolean(
            currentProduct
          ) &&
          currentProduct?.isPublished ===
            true &&
          currentProduct?.showOnStore ===
            true;


        setProduct(
          isVisible
            ? currentProduct
            : null
        );


        setAllProducts(
          normalizedProducts
        );


        setStore(
          nextStore || {}
        );


        /* =========================
           APPROVED REVIEWS
        ========================== */

        const productReviews =
          Array.isArray(
            approvedReviews
          )
            ? approvedReviews.filter(
                (review) =>
                  String(
                    review?.productId
                  ) ===
                  String(id) &&
                  Number(
                    review?.rating ||
                      0
                  ) > 0
              )
            : [];


        setReviews(
          productReviews
        );


        setSelectedImage(
          0
        );


        setQuantity(
          1
        );

      } catch (error) {
        console.error(
          "ProductDetails 3.0:",
          error
        );


        setProduct(
          null
        );


        setAllProducts(
          []
        );


        setReviews(
          []
        );

      } finally {
        setLoading(
          false
        );
      }
    };


  useEffect(() => {
    let mounted = true;


    async function load() {
      if (!mounted) {
        return;
      }


      await loadProduct();
    }


    load();


    const handleStorage =
      () => {
        loadProduct();
      };


    window.addEventListener(
      "storage",
      handleStorage
    );


    return () => {
      mounted = false;


      window.removeEventListener(
        "storage",
        handleStorage
      );
    };
  }, [
    id,
  ]);


  /* =====================================
     GALLERY
  ===================================== */

  const gallery =
    useMemo(() => {
      if (!product) {
        return [];
      }


      const images = [
        product.image,
        ...(
          Array.isArray(
            product.images
          )
            ? product.images
            : []
        ),
      ]
        .map(
          getImageUrl
        )
        .filter(Boolean);


      return [
        ...new Set(
          images
        ),
      ];
    }, [
      product,
    ]);


  /* =====================================
     DISCOUNT
  ===================================== */

  const discount =
    useMemo(() => {
      if (!product) {
        return 0;
      }


      const oldPrice =
        Number(
          product.oldPrice ||
            0
        );


      const price =
        Number(
          product.price ||
            0
        );


      if (
        oldPrice <= 0 ||
        price <= 0 ||
        oldPrice <= price
      ) {
        return 0;
      }


      return Math.round(
        (
          (
            oldPrice -
            price
          ) /
          oldPrice
        ) *
          100
      );
    }, [
      product,
    ]);


  /* =====================================
     REVIEW SUMMARY
  ===================================== */

  const reviewRating =
    useMemo(() => {
      if (
        reviews.length ===
        0
      ) {
        return Math.min(
          5,
          Math.max(
            0,
            Number(
              product?.rating ||
                0
            )
          )
        );
      }


      const total =
        reviews.reduce(
          (
            sum,
            review
          ) =>
            sum +
            Number(
              review.rating ||
                0
            ),
          0
        );


      return Math.min(
        5,
        Math.max(
          0,
          total /
            reviews.length
        )
      );
    }, [
      reviews,
      product?.rating,
    ]);


  /* =====================================
     STOCK / PRICE
  ===================================== */

  const stock =
    Number(
      product?.stock ||
        0
    );


  const unitPrice =
    Number(
      product?.price ||
        product?.sellingPrice ||
        0
    );


  const selectedTotal =
    unitPrice *
    quantity;


  const isOutOfStock =
    stock <= 0;


  const isLowStock =
    stock > 0 &&
    stock <=
      Number(
        product?.reorderLevel ||
          0
      );


  const maxQuantity =
    Math.max(
      1,
      stock
    );


  const currency =
    store?.currency ||
    "ج.م";


  const whatsapp =
    store?.whatsapp ||
    store?.whatsappLink ||
    "";


  const hasWhatsapp =
    Boolean(
      whatsapp?.trim()
    );


  /* =====================================
     RELATED PRODUCTS
  ===================================== */

  const relatedProducts =
    useMemo(() => {
      if (!product) {
        return [];
      }


      return allProducts
        .filter(
          (item) =>
            String(
              item?.id
            ) !==
              String(
                product.id
              ) &&
            item?.isPublished ===
              true &&
            item?.showOnStore ===
              true &&
            Number(
              item?.stock ||
                0
            ) >
              0 &&
            item?.category ===
              product.category
        )
        .slice(
          0,
          4
        );
    }, [
      allProducts,
      product,
    ]);


  /* =====================================
     QUANTITY
  ===================================== */

  const increaseQuantity =
    () => {
      if (
        isOutOfStock
      ) {
        return;
      }


      setQuantity(
        (current) =>
          Math.min(
            maxQuantity,
            current +
              1
          )
      );
    };


  const decreaseQuantity =
    () => {
      setQuantity(
        (current) =>
          Math.max(
            1,
            current -
              1
          )
      );
    };


  /* =====================================
     ACTIONS
  ===================================== */

  const handleAddToCart =
    () => {
      if (
        isOutOfStock
      ) {
        toast.error(
          "هذا المنتج غير متوفر حاليًا"
        );

        return;
      }


      addToCart(
        product,
        quantity
      );


      toast.success(
        `تمت إضافة ${quantity} ${
          quantity ===
          1
            ? "قطعة"
            : "قطع"
        } إلى السلة`
      );
    };


  const handleFavorite =
    () => {
      toggleFavorite(
        product
      );


      toast.success(
        isFavorite
          ? "تمت إزالة المنتج من المفضلة"
          : "تمت إضافة المنتج إلى المفضلة"
      );
    };


  const handlePreviousImage =
    () => {
      if (
        gallery.length <=
        1
      ) {
        return;
      }


      setSelectedImage(
        (current) =>
          current ===
          0
            ? gallery.length -
              1
            : current -
              1
      );
    };


  const handleNextImage =
    () => {
      if (
        gallery.length <=
        1
      ) {
        return;
      }


      setSelectedImage(
        (current) =>
          current ===
          gallery.length -
            1
            ? 0
            : current +
              1
      );
    };


  /* =====================================
     STATES
  ===================================== */

  if (loading) {
    return (
      <Loading
        label="جاري تحميل المنتج..."
      />
    );
  }


  if (!product) {
    return (
      <main className="min-h-[70vh] bg-[#fbfcfa] px-6 py-24">

        <div className="mx-auto max-w-2xl rounded-[2rem] border border-[#dfe6dc] bg-white p-10 text-center shadow-sm">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eef2eb] text-[#657361]">

            <Package
              size={30}
            />

          </div>


          <h1 className="mt-5 text-2xl font-black text-[#273025]">
            المنتج غير موجود
          </h1>


          <p className="mt-2 text-sm leading-7 text-[#808a7d]">
            قد يكون المنتج غير منشور أو تم حذفه من لوحة الإدارة.
          </p>


          <Link
            to="/products"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#2f382c] px-5 py-3 font-black text-white"
          >

            العودة للمنتجات

            <ArrowRight
              size={17}
            />

          </Link>

        </div>

      </main>
    );
  }


  return (
    <main className="bg-[#fbfcfa]">


      {/* =====================================
          PRODUCT HERO
      ===================================== */}

      <section className="border-b border-[#e2e7df] bg-white">

        <div className="mx-auto max-w-7xl px-6 py-10 lg:py-16">


          {/* BREADCRUMB */}

          <div className="mb-8 flex flex-wrap items-center gap-2 text-xs font-bold text-[#8a9387]">

            <Link
              to="/"
              className="transition hover:text-[#52614e]"
            >
              الرئيسية
            </Link>


            <span>/</span>


            <Link
              to="/products"
              className="transition hover:text-[#52614e]"
            >
              المنتجات
            </Link>


            <span>/</span>


            <span className="text-[#4c5848]">
              {
                product.name
              }
            </span>

          </div>


          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">


            {/* =================================
                GALLERY
            ================================= */}

            <div>

              <div className="relative overflow-hidden rounded-[2.5rem] border border-[#dfe6dc] bg-[#eef2eb]">

                <div className="aspect-square sm:aspect-[1.08]">

                  <AnimatePresence
                    mode="wait"
                  >

                    {gallery[
                      selectedImage
                    ] ? (
                      <motion.img
                        key={
                          gallery[
                            selectedImage
                          ]
                        }
                        src={
                          gallery[
                            selectedImage
                          ]
                        }
                        alt={
                          product.name
                        }
                        initial={{
                          opacity:
                            0,
                          scale:
                            0.97,
                        }}
                        animate={{
                          opacity:
                            1,
                          scale:
                            1,
                        }}
                        exit={{
                          opacity:
                            0,
                        }}
                        transition={{
                          duration:
                            0.25,
                        }}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div
                        key="empty"
                        className="flex h-full items-center justify-center text-[#93a08f]"
                      >
                        <Package
                          size={
                            60
                          }
                        />
                      </div>
                    )}

                  </AnimatePresence>

                </div>


                {/* DISCOUNT */}

                {discount >
                  0 && (
                  <span className="absolute left-5 top-5 rounded-full bg-[#2f382c] px-4 py-2 text-xs font-black text-white shadow-lg">
                    خصم{" "}
                    {discount}%
                  </span>
                )}


                {/* FAVORITE */}

                <button
                  type="button"
                  onClick={
                    handleFavorite
                  }
                  className="absolute right-5 top-5 flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-[#596655] shadow-md backdrop-blur transition hover:scale-105"
                  aria-label="المفضلة"
                >

                  <Heart
                    size={22}
                    className={
                      isFavorite
                        ? "fill-red-500 text-red-500"
                        : ""
                    }
                  />

                </button>


                {/* ARROWS */}

                {gallery.length >
                  1 && (
                  <>
                    <button
                      type="button"
                      onClick={
                        handlePreviousImage
                      }
                      className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#52604e] shadow-md backdrop-blur transition hover:bg-white"
                      aria-label="الصورة السابقة"
                    >
                      <ChevronLeft
                        size={
                          20
                        }
                      />
                    </button>


                    <button
                      type="button"
                      onClick={
                        handleNextImage
                      }
                      className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#52604e] shadow-md backdrop-blur transition hover:bg-white"
                      aria-label="الصورة التالية"
                    >
                      <ChevronRight
                        size={
                          20
                        }
                      />
                    </button>
                  </>
                )}

              </div>


              {/* THUMBNAILS */}

              {gallery.length >
                1 && (
                <div className="mt-4 flex gap-3 overflow-x-auto pb-2">

                  {gallery.map(
                    (
                      image,
                      index
                    ) => (
                      <button
                        key={
                          image
                        }
                        type="button"
                        onClick={() =>
                          setSelectedImage(
                            index
                          )
                        }
                        className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-white transition sm:h-24 sm:w-24 ${
                          selectedImage ===
                          index
                            ? "border-[#657361] shadow-md"
                            : "border-[#dfe6dc] hover:border-[#B4C4AD]"
                        }`}
                      >

                        <img
                          src={
                            image
                          }
                          alt={`${product.name} ${index + 1}`}
                          className="h-full w-full object-cover"
                        />

                      </button>
                    )
                  )}

                </div>
              )}

            </div>


            {/* =================================
                INFO
            ================================= */}

            <div className="flex flex-col justify-center">


              {/* CATEGORY */}

              {product.category ? (
                <Link
                  to={`/products?category=${encodeURIComponent(
                    product.category
                  )}`}
                  className="w-fit rounded-full bg-[#eef2eb] px-4 py-2 text-xs font-black text-[#596655] transition hover:bg-[#e3ebdf]"
                >
                  {
                    product.category
                  }
                </Link>
              ) : (
                <span className="w-fit rounded-full bg-[#eef2eb] px-4 py-2 text-xs font-black text-[#98a398]">
                  بدون تصنيف
                </span>
              )}


              {/* NAME */}

              <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight text-[#20251f] sm:text-5xl">
                {
                  product.name
                }
              </h1>


              {/* SKU */}

              <p className="mt-3 text-xs font-bold text-[#929b90]">
                SKU:{" "}
                {
                  product.sku ||
                  "غير مضاف"
                }
              </p>


              {/* RATING */}

              <div className="mt-5 flex items-center gap-3">

                <div className="flex gap-1">

                  {[
                    1,
                    2,
                    3,
                    4,
                    5,
                  ].map(
                    (
                      star
                    ) => (
                      <Star
                        key={
                          star
                        }
                        size={
                          18
                        }
                        className={
                          star <=
                          Math.round(
                            reviewRating
                          )
                            ? "fill-[#b39a59] text-[#b39a59]"
                            : "text-[#d4d9d1]"
                        }
                      />
                    )
                  )}

                </div>


                <span className="text-sm font-bold text-[#7d8779]">

                  {reviews.length >
                  0
                    ? `${reviewRating.toFixed(
                        1
                      )}/5`
                    : Number(
                        product.rating ||
                          0
                      ) >
                        0
                      ? `${Number(
                          product.rating
                        ).toFixed(
                          1
                        )}/5`
                      : "لا توجد مراجعات"}

                  {reviews.length >
                    0 && (
                    <span className="mr-1">
                      (
                      {
                        reviews.length
                      }
                      )
                    </span>
                  )}

                </span>

              </div>


              {/* PRICE */}

              <div className="mt-8 rounded-[1.5rem] border border-[#dfe6dc] bg-[#f7f9f5] p-5">

                <div className="flex flex-wrap items-end justify-between gap-5">


                  {/* UNIT */}

                  <div>

                    <p className="text-xs font-bold text-[#8b9588]">
                      سعر القطعة
                    </p>


                    <div className="mt-1 flex items-end gap-3">

                      <span className="text-3xl font-black text-[#2f382c]">

                        {
                          unitPrice.toLocaleString()
                        }{" "}

                        {
                          currency
                        }

                      </span>


                      {product.oldPrice &&
                        Number(
                          product.oldPrice
                        ) >
                          unitPrice && (
                          <span className="mb-1 text-sm font-bold text-[#a1a9a0] line-through">

                            {
                              Number(
                                product.oldPrice
                              ).toLocaleString()
                            }{" "}

                            {
                              currency
                            }

                          </span>
                        )}

                    </div>

                  </div>


                  {/* TOTAL */}

                  {!isOutOfStock && (
                    <div className="text-right">

                      <p className="text-xs font-bold text-[#8b9588]">
                        إجمالي الكمية
                      </p>


                      <p className="mt-1 text-3xl font-black text-[#657361]">

                        {
                          selectedTotal.toLocaleString()
                        }{" "}

                        {
                          currency
                        }

                      </p>

                    </div>
                  )}

                </div>


                {discount >
                  0 && (
                  <p className="mt-3 text-xs font-black text-[#657361]">
                    خصم{" "}
                    {
                      discount
                    }
                    %
                    {" "}
                    على السعر الأصلي
                  </p>
                )}

              </div>


              {/* DESCRIPTION */}

              <p className="mt-7 text-sm leading-8 text-[#6f796c]">
                {
                  product.description ||
                  "لا يوجد وصف إضافي لهذا المنتج."
                }
              </p>


              {/* STOCK */}

              <div className="mt-7 rounded-2xl border border-[#dfe6dc] bg-[#f7f9f5] p-4">

                <div className="flex items-center gap-2">

                  <Check
                    size={
                      18
                    }
                    className={
                      isOutOfStock
                        ? "text-red-500"
                        : "text-[#657361]"
                    }
                  />


                  <span
                    className={`text-sm font-black ${
                      isOutOfStock
                        ? "text-red-500"
                        : "text-[#596655]"
                    }`}
                  >

                    {
                      isOutOfStock
                        ? "غير متوفر حاليًا"
                        : "متوفر في المخزون"
                    }

                  </span>

                </div>


                <p className="mt-1 text-xs font-bold text-[#8b9588]">

                  {isOutOfStock
                    ? "سيظهر التوفر من لوحة الإدارة عند تحديث المخزون."
                    : `${stock} قطعة متاحة`}

                </p>

              </div>


              {/* QUANTITY */}

              {!isOutOfStock && (
                <div className="mt-7">

                  <p className="mb-3 text-sm font-black text-[#30382e]">
                    الكمية
                  </p>


                  <div className="flex w-fit items-center overflow-hidden rounded-xl border border-[#dfe6dc] bg-white">

                    <button
                      type="button"
                      onClick={
                        decreaseQuantity
                      }
                      disabled={
                        quantity <=
                        1
                      }
                      className="flex h-12 w-12 items-center justify-center text-[#5d695a] transition hover:bg-[#eef2eb] disabled:cursor-not-allowed disabled:opacity-40"
                    >

                      <Minus
                        size={
                          18
                        }
                      />

                    </button>


                    <span className="flex h-12 min-w-14 items-center justify-center border-x border-[#dfe6dc] px-3 text-lg font-black text-[#2f382c]">
                      {
                        quantity
                      }
                    </span>


                    <button
                      type="button"
                      onClick={
                        increaseQuantity
                      }
                      disabled={
                        quantity >=
                        maxQuantity
                      }
                      className="flex h-12 w-12 items-center justify-center text-[#5d695a] transition hover:bg-[#eef2eb] disabled:cursor-not-allowed disabled:opacity-40"
                    >

                      <Plus
                        size={
                          18
                        }
                      />

                    </button>

                  </div>

                </div>
              )}


              {/* ACTIONS */}

              <div className="mt-8 grid gap-3 sm:grid-cols-2">


                {/* CART */}

                <button
                  type="button"
                  onClick={
                    handleAddToCart
                  }
                  disabled={
                    isOutOfStock
                  }
                  className={`flex items-center justify-center gap-2 rounded-xl py-4 text-sm font-black transition ${
                    isOutOfStock
                      ? "cursor-not-allowed bg-[#e4e8e1] text-[#969f94]"
                      : "bg-[#2f382c] text-white hover:bg-[#3c4838]"
                  }`}
                >

                  <ShoppingCart
                    size={
                      19
                    }
                  />

                  {
                    isOutOfStock
                      ? "غير متوفر"
                      : "أضف للسلة"
                  }

                </button>


                {/* WHATSAPP */}

                {hasWhatsapp ? (
                  <a
                    href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(
                      `السلام عليكم،

أرغب بالاستفسار عن المنتج:

${product.name}

السعر: ${product.price} ${currency}

الكمية: ${quantity}

هل هو متوفر؟`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 rounded-xl border border-[#cfdacb] bg-[#eef2eb] py-4 text-sm font-black text-[#4e5b4b] transition hover:bg-[#e4ece0]"
                  >

                    <MessageCircle
                      size={
                        19
                      }
                    />

                    اطلب عبر واتساب

                  </a>
                ) : (
                  <div className="flex items-center justify-center gap-2 rounded-xl border border-[#e1e6df] bg-[#f7f8f5] py-4 text-sm font-black text-[#9aa399]">

                    <MessageCircle
                      size={
                        19
                      }
                    />

                    واتساب غير مضاف

                  </div>
                )}

              </div>


              {/* TRUST */}

              <div className="mt-8 grid grid-cols-2 gap-3">

                <TrustItem
                  icon={
                    Check
                  }
                  title="منتج منشور"
                  text="من لوحة الإدارة"
                />


                <TrustItem
                  icon={
                    Package
                  }
                  title="مخزون مباشر"
                  text="حسب المتوفر"
                />

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================
          SPECIFICATIONS
      ===================================== */}

      <section className="mx-auto max-w-7xl px-6 py-20">

        <div className="grid gap-8 lg:grid-cols-2">


          {/* DESCRIPTION */}

          <div className="rounded-[2rem] border border-[#dfe6dc] bg-white p-7 shadow-sm">

            <h2 className="text-2xl font-black text-[#273025]">
              عن المنتج
            </h2>


            <p className="mt-5 text-sm leading-8 text-[#727c70]">
              {
                product.description ||
                "لا يوجد وصف إضافي لهذا المنتج."
              }
            </p>

          </div>


          {/* SPECS */}

          <div className="rounded-[2rem] border border-[#dfe6dc] bg-white p-7 shadow-sm">

            <h2 className="text-2xl font-black text-[#273025]">
              مواصفات المنتج
            </h2>


            <div className="mt-6 space-y-4">

              <SpecRow
                label="الفئة"
                value={
                  product.category
                }
              />


              <SpecRow
                label="الخامة"
                value={
                  product.material
                }
              />


              <SpecRow
                label="اللون"
                value={
                  product.color
                }
              />


              <SpecRow
                label="المقاس"
                value={
                  product.size
                }
              />


              <SpecRow
                label="رقم المنتج"
                value={
                  product.sku
                }
              />


              <SpecRow
                label="المخزون"
                value={
                  isOutOfStock
                    ? "غير متوفر"
                    : `${stock} قطعة`
                }
                danger={
                  isOutOfStock
                }
              />

            </div>

          </div>

        </div>

      </section>


      {/* =====================================
          REVIEWS
      ===================================== */}

      <section className="border-y border-[#e2e7df] bg-[#f2f5ef] py-20">

        <div className="mx-auto max-w-7xl px-6">

          <div className="flex flex-wrap items-end justify-between gap-5">

            <div>

              <p className="text-xs font-black text-[#6a7767]">
                آراء العملاء
              </p>


              <h2 className="mt-2 text-3xl font-black text-[#273025]">
                تقييمات هذا المنتج
              </h2>

            </div>


            <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-[#53604f]">

              <Star
                size={
                  15
                }
                className="fill-[#b39a59] text-[#b39a59]"
              />


              {reviews.length >
              0
                ? `${reviewRating.toFixed(
                    1
                  )}/5`
                : Number(
                    product.rating ||
                      0
                  ) >
                    0
                  ? `${Number(
                      product.rating
                    ).toFixed(
                      1
                    )}/5`
                  : "بدون تقييم"}

            </div>

          </div>


          {reviews.length >
          0 ? (
            <div className="mt-10 grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">

              {reviews
                .slice(
                  0,
                  6
                )
                .map(
                  (
                    review,
                    index
                  ) => (
                    <motion.div
                      key={
                        review.id ||
                        index
                      }
                      initial={{
                        opacity:
                          0,
                        y: 15,
                      }}
                      whileInView={{
                        opacity:
                          1,
                        y: 0,
                      }}
                      viewport={{
                        once:
                          true,
                        amount:
                          0.15,
                      }}
                      transition={{
                        delay:
                          index *
                          0.05,
                      }}
                      className="rounded-[1.75rem] border border-[#dfe6dc] bg-white p-6 shadow-sm"
                    >

                      <div className="flex items-center justify-between gap-4">

                        <p className="font-black text-[#30382e]">
                          {
                            review.customerName ||
                            review.customer?.name ||
                            "عميل OPTICANA"
                          }
                        </p>


                        <div className="flex gap-0.5">

                          {[
                            1,
                            2,
                            3,
                            4,
                            5,
                          ].map(
                            (
                              star
                            ) => (
                              <Star
                                key={
                                  star
                                }
                                size={
                                  13
                                }
                                className={
                                  star <=
                                  Number(
                                    review.rating ||
                                      0
                                  )
                                    ? "fill-[#b39a59] text-[#b39a59]"
                                    : "text-[#d7dcd5]"
                                }
                              />
                            )
                          )}

                        </div>

                      </div>


                      <p className="mt-5 text-sm leading-7 text-[#747e71]">
                        {
                          review.comment ||
                          review.message ||
                          "تجربة رائعة."
                        }
                      </p>

                    </motion.div>
                  )
                )}

            </div>
          ) : (
            <div className="mt-8 rounded-[1.75rem] border border-dashed border-[#d5ded1] bg-white px-6 py-12 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef2eb] text-[#657361]">

                <Star
                  size={
                    25
                  }
                />

              </div>


              <p className="mt-4 text-sm font-black text-[#4f5d4c]">
                لا توجد مراجعات معتمدة بعد
              </p>


              <p className="mx-auto mt-1 max-w-md text-xs leading-6 text-[#8a9487]">
                ستظهر هنا تقييمات العملاء بعد مراجعتها واعتمادها من لوحة الإدارة.
              </p>

            </div>
          )}

        </div>

      </section>


      {/* =====================================
          RELATED
      ===================================== */}

      {relatedProducts.length >
        0 && (
        <section className="mx-auto max-w-7xl px-6 py-20">

          <div className="flex items-end justify-between gap-5">

            <div>

              <p className="text-xs font-black text-[#6a7767]">
                قد يعجبك أيضًا
              </p>


              <h2 className="mt-2 text-3xl font-black text-[#273025]">
                منتجات مشابهة
              </h2>

            </div>


            <Link
              to="/products"
              className="hidden items-center gap-2 text-sm font-black text-[#596655] sm:flex"
            >

              كل المنتجات

              <ArrowLeft
                size={16}
              />

            </Link>

          </div>


          <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">

            {relatedProducts.map(
              (
                item
              ) => (
                <ProductCard
                  key={
                    item.id
                  }
                  product={
                    item
                  }
                />
              )
            )}

          </div>

        </section>
      )}

    </main>
  );
}


/* =====================================
   TRUST ITEM
===================================== */

function TrustItem({
  icon: Icon,
  title,
  text,
}) {
  return (
    <div className="rounded-xl border border-[#dfe6dc] bg-white p-4">

      <div className="flex items-center gap-3">

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eef2eb] text-[#60705b]">

          <Icon
            size={16}
          />

        </div>


        <div>

          <p className="text-xs font-black text-[#354031]">
            {
              title
            }
          </p>


          <p className="mt-0.5 text-[10px] font-bold text-[#909990]">
            {
              text
            }
          </p>

        </div>

      </div>

    </div>
  );
}


/* =====================================
   SPEC ROW
===================================== */

function SpecRow({
  label,
  value,
  danger = false,
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#edf0eb] pb-4 last:border-0 last:pb-0">

      <span className="text-sm font-black text-[#30382e]">
        {
          label
        }
      </span>


      <span
        className={`text-left text-sm font-bold ${
          danger
            ? "text-red-500"
            : "text-[#7b8579]"
        }`}
      >
        {
          value ||
          "لم تتم الإضافة بعد"
        }
      </span>

    </div>
  );
}


export default ProductDetails;
