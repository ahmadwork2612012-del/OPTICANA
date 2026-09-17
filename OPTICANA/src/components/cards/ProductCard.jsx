import {
  Heart,
  ShoppingCart,
  Eye,
  Star,
  Check,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import toast from "react-hot-toast";

import {
  Link,
} from "react-router-dom";

import {
  AnimatePresence,
  motion,
  useAnimation,
} from "framer-motion";

import useCartStore from "../../store/cartStore";
import useFavoriteStore from "../../store/favoriteStore";

import {
  addReview,
  getApprovedReviews,
} from "../../services/reviewService";


/* =====================================
   PRODUCT REVIEW HELPERS
===================================== */

function getProductReviewSummary(
  reviews,
  productId,
  fallbackRating = 0
) {
  const productReviews =
    reviews.filter(
      (review) =>
        String(
          review?.productId
        ) ===
          String(
            productId
          ) &&
        Number(
          review?.rating ||
            0
        ) > 0
    );


  if (
    productReviews.length ===
    0
  ) {
    return {
      rating: Math.min(
        5,
        Math.max(
          0,
          Number(
            fallbackRating ||
              0
          )
        )
      ),

      count: 0,
    };
  }


  const total =
    productReviews.reduce(
      (
        sum,
        review
      ) =>
        sum +
        Number(
          review?.rating ||
            0
        ),
      0
    );


  return {
    rating: Math.min(
      5,
      Math.max(
        0,
        total /
          productReviews.length
      )
    ),

    count:
      productReviews.length,
  };
}


/* =====================================
   PRODUCT CARD
===================================== */

function ProductCard({
  product,
}) {
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


  /* =====================================
     UI
  ===================================== */

  const [
    showRating,
    setShowRating,
  ] = useState(false);


  const [
    selectedRating,
    setSelectedRating,
  ] = useState(0);


  const [
    reviewText,
    setReviewText,
  ] = useState("");


  /* =====================================
     RATING STATE
  ===================================== */

  const [
    savedRating,
    setSavedRating,
  ] = useState(
    Number(
      product?.rating ||
        0
    )
  );


  const [
    reviewCount,
    setReviewCount,
  ] = useState(0);


  const [
    reviewsLoading,
    setReviewsLoading,
  ] = useState(true);


  /* =====================================
     LOAD APPROVED REVIEWS
  ===================================== */

  useEffect(() => {
    let mounted = true;


    async function loadReviewSummary() {
      try {
        setReviewsLoading(
          true
        );


        const reviews =
          await getApprovedReviews();


        if (!mounted) {
          return;
        }


        const summary =
          getProductReviewSummary(
            Array.isArray(
              reviews
            )
              ? reviews
              : [],
            product.id,
            product.rating
          );


        setSavedRating(
          summary.rating
        );


        setReviewCount(
          summary.count
        );

      } catch (error) {
        console.error(
          "ProductCard Reviews:",
          error
        );


        if (mounted) {
          setSavedRating(
            Number(
              product?.rating ||
                0
            )
          );


          setReviewCount(
            0
          );
        }
      } finally {
        if (mounted) {
          setReviewsLoading(
            false
          );
        }
      }
    }


    loadReviewSummary();


    /* =========================
       ADMIN REVIEW UPDATE
    ========================== */

    const handleStorage =
      () => {
        loadReviewSummary();
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
    product.id,
    product.rating,
  ]);


  const cartAnimation =
    useAnimation();


  /* =====================================
     FAVORITE
  ===================================== */

  const isFavorite =
    favorites.some(
      (item) =>
        String(
          item.id
        ) ===
        String(
          product.id
        )
    );


  /* =====================================
     STOCK
  ===================================== */

  const stock =
    Number(
      product.stock ||
        0
    );


  const isOutOfStock =
    stock <=
    0;


  const isLowStock =
    stock > 0 &&
    stock <=
      Number(
        product.reorderLevel ||
          0
      );


  /* =====================================
     DISCOUNT
  ===================================== */

  const discount =
    useMemo(() => {
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
        oldPrice <=
          0 ||
        price <=
          0 ||
        oldPrice <=
          price
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
      product.oldPrice,
      product.price,
    ]);


  /* =====================================
     IMAGE
  ===================================== */

  const galleryImage =
    product.image ||
    product.images?.[0] ||
    null;


  /* =====================================
     RATING
  ===================================== */

  const rating =
    Math.min(
      5,
      Math.max(
        0,
        Number(
          savedRating ||
            0
        )
      )
    );


  /* =====================================
     HEART SPARKS
  ===================================== */

  const sparks = [
    {
      x: 0,
      y: -26,
    },
    {
      x: 20,
      y: -18,
    },
    {
      x: 26,
      y: 0,
    },
    {
      x: 18,
      y: 18,
    },
    {
      x: 0,
      y: 26,
    },
    {
      x: -18,
      y: 18,
    },
    {
      x: -26,
      y: 0,
    },
    {
      x: -18,
      y: -18,
    },
  ];


  /* =====================================
     RATING MODAL
  ===================================== */

  const openRating =
    () => {
      setSelectedRating(
        0
      );

      setReviewText(
        ""
      );

      setShowRating(
        true
      );
    };


  const closeRating =
    () => {
      setSelectedRating(
        0
      );

      setReviewText(
        ""
      );

      setShowRating(
        false
      );
    };


  /* =====================================
     SUBMIT REVIEW
  ===================================== */

  const handleSubmitReview =
    async () => {
      if (
        selectedRating ===
        0
      ) {
        toast.error(
          "اختر تقييمك بالنجوم أولًا"
        );

        return;
      }


      try {
        await addReview({
          productId:
            product.id,

          productName:
            product.name,

          customerName:
            "زائر المتجر",

          rating:
            selectedRating,

          comment:
            reviewText.trim(),
        });


        /*
         * نخليه يظهر فورًا على الكارد
         * بدون انتظار موافقة Admin.
         *
         * بعد إعادة تحميل الصفحة سيأخذ
         * القيمة المعتمدة من reviewService.
         */
        setSavedRating(
          selectedRating
        );


        setReviewCount(
          (current) =>
            current + 1
        );


        closeRating();


        toast.success(
          "تم حفظ تقييمك وإرساله للمراجعة"
        );

      } catch (error) {
        console.error(
          "ProductCard review submit:",
          error
        );


        toast.error(
          "تعذر إرسال التقييم حاليًا"
        );
      }
    };


  /* =====================================
     ADD TO CART
  ===================================== */

  const handleAddToCart =
    async () => {
      if (
        isOutOfStock
      ) {
        toast.error(
          "المنتج غير متوفر حاليًا"
        );

        return;
      }


      await cartAnimation.start({
        scale: [
          1,
          1.06,
          0.97,
          1,
        ],

        transition: {
          duration:
            0.35,
        },
      });


      addToCart(
        product
      );


      toast.success(
        "تمت إضافة المنتج إلى السلة"
      );
    };


  /* =====================================
     FAVORITE
  ===================================== */

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


  /* =====================================
     RENDER
  ===================================== */

  return (
    <>
      <article className="group overflow-hidden rounded-2xl border border-[#dfe6dc] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:rounded-[2rem]">


        {/* =================================
            IMAGE
        ================================= */}

        <div className="relative h-44 overflow-hidden rounded-t-2xl bg-[#f3f5ef] sm:h-72 sm:rounded-t-[2rem]">

          {galleryImage ? (
            <Link
              to={`/product/${product.id}`}
              className="block h-full w-full"
            >

              <img
                src={
                  galleryImage
                }
                alt={
                  product.name
                }
                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />

            </Link>
          ) : (
            <Link
              to={`/product/${product.id}`}
              className="flex h-full items-center justify-center text-[#9cab96]"
            >

              <Eye
                size={30}
              />

            </Link>
          )}


          {/* DISCOUNT */}

          {discount >
            0 && (
            <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-[#2f382c] px-2 py-1 text-[9px] font-black text-white shadow-sm sm:left-4 sm:top-4 sm:px-3 sm:py-1.5 sm:text-xs">
              خصم{" "}
              {discount}%
            </span>
          )}


          {/* NEW */}

          {product.isNew &&
            discount <=
              0 && (
            <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-[#B4C4AD] px-2 py-1 text-[9px] font-black text-[#263024] sm:left-4 sm:top-4 sm:px-3 sm:py-1.5 sm:text-xs">
              جديد
            </span>
          )}


          {/* FEATURED */}

          {product.featured && (
            <span className="absolute bottom-2.5 right-2.5 z-10 rounded-full bg-white/95 px-2 py-1 text-[9px] font-black text-[#4b5b45] shadow-sm backdrop-blur sm:bottom-4 sm:right-4 sm:px-3 sm:py-1.5 sm:text-[11px]">
              مميز
            </span>
          )}


          {/* FAVORITE */}

          <motion.button
            type="button"
            whileTap={{
              scale: 0.88,
            }}
            onClick={
              handleFavorite
            }
            aria-label={
              isFavorite
                ? "إزالة من المفضلة"
                : "إضافة إلى المفضلة"
            }
            className="absolute right-2.5 top-2.5 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-[#53604f] shadow-md backdrop-blur transition hover:scale-105 sm:right-4 sm:top-4 sm:h-11 sm:w-11"
          >

            <Heart
              size={16}
              className={
                isFavorite
                  ? "fill-red-500 text-red-500"
                  : ""
              }
            />


            <AnimatePresence>

              {isFavorite &&
                sparks.map(
                  (
                    spark,
                    index
                  ) => (
                    <motion.span
                      key={
                        index
                      }
                      initial={{
                        opacity:
                          1,
                        scale:
                          0,
                        x: 0,
                        y: 0,
                      }}
                      animate={{
                        opacity:
                          0,
                        scale:
                          1,
                        x: spark.x,
                        y: spark.y,
                      }}
                      exit={{
                        opacity:
                          0,
                      }}
                      transition={{
                        duration:
                          0.4,
                      }}
                      className="absolute h-1.5 w-1.5 rounded-full bg-[#B4C4AD]"
                    />
                  )
                )}

            </AnimatePresence>

          </motion.button>


          {/* OUT OF STOCK */}

          {isOutOfStock && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#1f241d]/25 backdrop-blur-[2px]">

              <span className="rounded-full bg-[#242922] px-3 py-1.5 text-[10px] font-black text-white shadow-lg sm:px-5 sm:py-2 sm:text-sm">
                غير متوفر حاليًا
              </span>

            </div>
          )}


          {/* LOW STOCK */}

          {!isOutOfStock &&
            isLowStock && (
            <span className="absolute bottom-2.5 left-2.5 z-10 rounded-full bg-[#eee8d9] px-2 py-1 text-[9px] font-black text-[#6b5b38] sm:bottom-4 sm:left-4 sm:px-3 sm:py-1.5 sm:text-[11px]">

              متبقي{" "}
              {stock}{" "}
              فقط

            </span>
          )}

        </div>


        {/* =================================
            CONTENT
        ================================= */}

        <div className="p-3 sm:p-5">


          {/* CATEGORY */}

          <p className="truncate text-[10px] font-bold text-[#7f8b7a] sm:text-xs">
            {
              product.category ||
              "منتج"
            }
          </p>


          {/* NAME */}

          <Link
            to={`/product/${product.id}`}
            className="mt-1 block line-clamp-2 min-h-[2.5rem] text-sm font-black leading-5 text-[#20251f] transition hover:text-[#657361] sm:mt-2 sm:min-h-0 sm:text-lg sm:leading-normal"
          >
            {
              product.name
            }
          </Link>


          {/* =================================
              RATING
          ================================= */}

          <button
            type="button"
            onClick={
              openRating
            }
            className="mt-2 flex items-center gap-1 sm:mt-3 sm:gap-1.5"
            aria-label="تقييم المنتج"
          >

            <div className="flex items-center gap-0.5">

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
                      11
                    }
                    className={
                      star <=
                      Math.round(
                        rating
                      )
                        ? "fill-[#b49c59] text-[#b49c59]"
                        : "text-[#d4d8d1]"
                    }
                  />
                )
              )}

            </div>


            <span className="text-[9px] font-bold text-[#899184] sm:text-[11px]">

              {reviewsLoading ? (
                <span className="inline-block h-2.5 w-12 animate-pulse rounded-full bg-[#e8ede5]" />
              ) : (
                <>
                  {rating >
                  0
                    ? rating.toFixed(
                        1
                      )
                    : "بدون تقييم"}


                  {reviewCount >
                    0 && (
                    <span className="mr-1">
                      (
                      {
                        reviewCount
                      }
                      )
                    </span>
                  )}
                </>
              )}

            </span>

          </button>


          {/* PRICE */}

          <div className="mt-2 flex flex-wrap items-end gap-1.5 sm:mt-4 sm:gap-3">

            <span className="text-lg font-black text-[#263024] sm:text-2xl">

              {Number(
                product.price ||
                  0
              ).toLocaleString()}{" "}

              ج.م

            </span>


            {product.oldPrice &&
              Number(
                product.oldPrice
              ) >
                Number(
                  product.price ||
                    0
                ) && (
              <span className="mb-0.5 text-[10px] font-bold text-[#a2aaa0] line-through sm:text-sm">

                {Number(
                  product.oldPrice
                ).toLocaleString()}{" "}

                ج.م

              </span>
            )}

          </div>


          {/* STOCK */}

          <div className="mt-2 flex items-center gap-1.5 text-[9px] font-bold sm:mt-4 sm:gap-2">

            <Check
              size={12}
              className={
                isOutOfStock
                  ? "text-red-500"
                  : "text-[#70806a]"
              }
            />


            <span
              className={
                isOutOfStock
                  ? "text-red-500"
                  : "text-[#70806a]"
              }
            >

              {isOutOfStock
                ? "غير متوفر"
                : "متوفر"}

            </span>

          </div>


          {/* ACTIONS */}

          <div className="mt-3 flex items-center gap-1.5 sm:mt-5 sm:gap-2">

            <motion.button
              type="button"
              animate={
                cartAnimation
              }
              whileTap={{
                scale: 0.97,
              }}
              disabled={
                isOutOfStock
              }
              onClick={
                handleAddToCart
              }
              className={`flex min-w-0 flex-1 items-center justify-center gap-1 rounded-lg py-2.5 text-[10px] font-black transition sm:gap-2 sm:rounded-xl sm:py-3 sm:text-sm ${
                isOutOfStock
                  ? "cursor-not-allowed bg-[#e7e9e5] text-[#9aa19a]"
                  : "bg-[#2f382c] text-white hover:bg-[#3c4838]"
              }`}
            >

              <ShoppingCart
                size={15}
                className="shrink-0 sm:size-[18px]"
              />


              <span className="truncate">

                {isOutOfStock
                  ? "غير متوفر"
                  : "أضف للسلة"}

              </span>

            </motion.button>


            <Link
              to={`/product/${product.id}`}
              aria-label={`عرض ${product.name}`}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#dfe6dc] text-[#5f6c5a] transition hover:border-[#B4C4AD] hover:bg-[#f1f4ee] sm:h-12 sm:w-12 sm:rounded-xl"
            >

              <Eye
                size={16}
                className="sm:size-[18px]"
              />

            </Link>

          </div>

        </div>

      </article>


      {/* =====================================
          RATING MODAL
      ===================================== */}

      {showRating && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-[#1e241d]/45 p-4 backdrop-blur-sm"
          onClick={
            closeRating
          }
        >

          <div
            onClick={(
              event
            ) =>
              event.stopPropagation()
            }
            className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-2xl sm:p-7"
          >

            <h2 className="text-center text-2xl font-black text-[#20251f]">
              تقييم المنتج
            </h2>


            <p className="mt-2 text-center text-sm text-[#7d8879]">
              {
                product.name
              }
            </p>


            {/* STARS */}

            <div className="mt-6 flex justify-center gap-2">

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
                  <button
                    key={
                      star
                    }
                    type="button"
                    onClick={() =>
                      setSelectedRating(
                        star
                      )
                    }
                    aria-label={`اختيار ${star} نجوم`}
                    className="rounded-xl p-1 transition hover:scale-110 active:scale-95"
                  >

                    <Star
                      size={30}
                      className={
                        star <=
                        selectedRating
                          ? "fill-[#b49c59] text-[#b49c59]"
                          : "text-[#d6dbd2]"
                      }
                    />

                  </button>
                )
              )}

            </div>


            {selectedRating >
              0 && (
              <p className="mt-2 text-center text-xs font-black text-[#657361]">

                اخترت{" "}

                {
                  selectedRating
                }

                {" "}
                من 5

              </p>
            )}


            {/* COMMENT */}

            <textarea
              value={
                reviewText
              }
              onChange={(
                event
              ) =>
                setReviewText(
                  event.target.value
                )
              }
              placeholder="اكتب ملاحظتك عن المنتج..."
              className="mt-6 h-28 w-full resize-none rounded-2xl border border-[#dfe6dc] p-4 text-sm outline-none transition focus:border-[#B4C4AD] focus:ring-4 focus:ring-[#eef2eb]"
            />


            {/* ACTIONS */}

            <div className="mt-5 flex gap-3">

              <button
                type="button"
                onClick={
                  closeRating
                }
                className="flex-1 rounded-xl border border-[#d9e1d6] bg-[#f8faf7] py-3.5 font-black text-[#667263] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#c6d2c2] hover:bg-[#eef2eb] hover:text-[#4f5d4b] hover:shadow-md active:translate-y-0"
              >

                إلغاء

              </button>


              <button
                type="button"
                onClick={
                  handleSubmitReview
                }
                disabled={
                  selectedRating ===
                  0
                }
                className="flex-1 rounded-xl bg-[#2f382c] py-3 font-bold text-white transition hover:bg-[#3c4838] disabled:cursor-not-allowed disabled:opacity-50"
              >

                إرسال التقييم

              </button>

            </div>

          </div>

        </div>
      )}

    </>
  );
}


export default ProductCard;