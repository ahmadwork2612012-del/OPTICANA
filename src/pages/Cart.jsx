import {
  ArrowLeft,
  AlertTriangle,
  MessageCircle,
  Minus,
  Package,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import toast from "react-hot-toast";

import Card from "../components/common/Card";
import EmptyState from "../components/common/EmptyState";
import Loading from "../components/ui/Loading";

import useCartStore from "../store/cartStore";

import {
  getProducts,
} from "../services/productService";

import {
  getStoreInfo,
  createStoreOrder,
} from "../services/storeService";


/* =====================================
   CART
===================================== */

function Cart() {
  const cart =
    useCartStore(
      (state) =>
        state.cart
    );


  const removeFromCart =
    useCartStore(
      (state) =>
        state.removeFromCart
    );


  const increaseQuantity =
    useCartStore(
      (state) =>
        state.increaseQuantity
    );


  const decreaseQuantity =
    useCartStore(
      (state) =>
        state.decreaseQuantity
    );


  const setQuantity =
    useCartStore(
      (state) =>
        state.setQuantity
    );


  const [
    products,
    setProducts,
  ] = useState([]);


  const [
    store,
    setStore,
  ] = useState(null);


  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    checkoutLoading,
    setCheckoutLoading,
  ] = useState(false);


  /* =====================================
     LOAD CURRENT ADMIN DATA
  ===================================== */

  const loadCartData =
    async () => {
      try {
        setLoading(
          true
        );


        const [
          currentProducts,
          currentStore,
        ] = await Promise.all([
          getProducts(),
          getStoreInfo(),
        ]);


        setProducts(
          Array.isArray(
            currentProducts
          )
            ? currentProducts
            : []
        );


        setStore(
          currentStore || {}
        );

      } catch (error) {
        console.error(
          "Cart 3.0:",
          error
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


      await loadCartData();
    }


    load();


    const handleStorage =
      () => {
        loadCartData();
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
  }, []);


  /* =====================================
     CURRENT PRODUCT MAP
  ===================================== */

  const productMap =
    useMemo(() => {
      const map =
        new Map();


      products.forEach(
        (product) => {
          if (!product?.id) {
            return;
          }


          map.set(
            String(
              product.id
            ),
            product
          );
        }
      );


      return map;
    }, [
      products,
    ]);


  /* =====================================
     CART ITEMS
  ===================================== */

  const cartItems =
    useMemo(() => {
      return cart.map(
        (item) => {
          const current =
            productMap.get(
              String(
                item.id
              )
            );


          const currentPrice =
            Number(
              current?.price ??
                current?.sellingPrice ??
                0
            );


          const currentStock =
            Number(
              current?.stock ||
                0
            );


          const isAvailable =
            Boolean(
              current
            ) &&
            current?.showOnStore ===
              true &&
            current?.isPublished ===
              true &&
            currentStock > 0;


          return {
            ...item,

            currentProduct:
              current ||
              null,

            currentPrice,

            currentStock,

            isAvailable,

            hasPriceChanged:
              Boolean(
                current
              ) &&
              Number(
                item.price ||
                  0
              ) !==
                currentPrice,

            image:
              current?.image ||
              current?.images?.[0] ||
              item.image ||
              null,
          };
        }
      );
    }, [
      cart,
      productMap,
    ]);


  /* =====================================
     FIX QUANTITIES AGAINST CURRENT STOCK
  ===================================== */

  useEffect(() => {
    if (
      loading ||
      cart.length ===
        0
    ) {
      return;
    }


    cartItems.forEach(
      (item) => {
        if (
          !item.currentProduct
        ) {
          return;
        }


        const stock =
          Number(
            item.currentStock ||
              0
          );


        if (
          stock > 0 &&
          Number(
            item.quantity ||
              0
          ) >
            stock
        ) {
          setQuantity(
            item.id,
            stock
          );


          toast.error(
            `تم تعديل كمية ${item.name} حسب المخزون المتاح`
          );
        }
      }
    );
  }, [
    loading,
    cartItems,
    setQuantity,
  ]);


  /* =====================================
     AVAILABILITY
  ===================================== */

  const availableItems =
    useMemo(() => {
      return cartItems.filter(
        (item) =>
          item.isAvailable
      );
    }, [
      cartItems,
    ]);


  const unavailableItems =
    useMemo(() => {
      return cartItems.filter(
        (item) =>
          !item.isAvailable
      );
    }, [
      cartItems,
    ]);


  const hasUnavailable =
    unavailableItems.length >
    0;


  /* =====================================
     TOTALS
  ===================================== */

  const totalItems =
    cartItems.reduce(
      (
        total,
        item
      ) =>
        total +
        Number(
          item.quantity ||
            0
        ),
      0
    );


  const availableItemsCount =
    availableItems.reduce(
      (
        total,
        item
      ) =>
        total +
        Number(
          item.quantity ||
            0
        ),
      0
    );


  const total =
    availableItems.reduce(
      (
        sum,
        item
      ) =>
        sum +
        item.currentPrice *
          Number(
            item.quantity ||
              0
          ),
      0
    );


  /* =====================================
     STORE
  ===================================== */

  const currency =
    store?.currency ||
    "ج.م";


  const whatsappNumber =
    store?.whatsapp ||
    store?.whatsappLink ||
    "";


  const canCheckout =
    availableItems.length >
      0 &&
    !hasUnavailable &&
    Boolean(
      whatsappNumber
    );


  /* =====================================
     WHATSAPP MESSAGE
  ===================================== */

  const whatsappMessage =
    useMemo(() => {
      const lines =
        availableItems.map(
          (
            item,
            index
          ) => {
            const itemTotal =
              item.currentPrice *
              Number(
                item.quantity ||
                  0
              );


            return `المنتج ${index + 1}
الاسم: ${item.name}
الفئة: ${
              item.currentProduct
                ?.category ||
              item.category ||
              "-"
            }
الكمية: ${
              item.quantity
            }
سعر القطعة: ${
              item.currentPrice
            } ${currency}
إجمالي المنتج: ${
              itemTotal
            } ${currency}`;
          }
        );


      return encodeURIComponent(
        `السلام عليكم،

أرغب بطلب المنتجات التالية:

${lines.join(
  "\n\n"
)}

━━━━━━━━━━━━━━

عدد القطع: ${availableItemsCount}
الإجمالي: ${total} ${currency}

أرجو تأكيد توفر المنتجات، وشكرًا لكم.`
      );
    }, [
      availableItems,
      availableItemsCount,
      total,
      currency,
    ]);


  /* =====================================
     CHECKOUT
  ===================================== */

  const handleCheckout = async () => {
    if (!canCheckout || checkoutLoading) return;

    const customerName = window.prompt("اكتب اسمك لإتمام الطلب:");
    if (!customerName?.trim()) return;

    const phone = window.prompt("اكتب رقم الهاتف للتواصل:");
    if (!phone?.trim()) return;

    try {
      setCheckoutLoading(true);

      const order = await createStoreOrder({
        customer: {
          name: customerName.trim(),
          phone: phone.trim(),
          whatsapp: phone.trim(),
        },
        items: availableItems,
      });

      const orderNumber = order?.orderNumber || order?.id || "";
      const message = `${decodeURIComponent(whatsappMessage)}

رقم الطلب: ${orderNumber}
`;

      window.open(
        `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
        "_blank",
        "noopener,noreferrer"
      );

      toast.success(`تم إنشاء الطلب ${orderNumber}`);
    } catch (error) {
      toast.error(error?.message || "تعذر إنشاء الطلب، حاول مرة أخرى");
    } finally {
      setCheckoutLoading(false);
    }
  };

  /* =====================================
     REMOVE
  ===================================== */

  const handleRemove =
    (item) => {
      const confirmed =
        window.confirm(
          `هل أنت متأكد من حذف "${item.name}" من السلة؟`
        );


      if (!confirmed) {
        return;
      }


      removeFromCart(
        item.id
      );


      toast.success(
        "تم حذف المنتج من السلة"
      );
    };


  /* =====================================
     CHECKOUT STATE
  ===================================== */

  const getCheckoutMessage =
    () => {
      if (
        hasUnavailable
      ) {
        return "راجع المنتجات غير المتاحة أولًا";
      }


      if (
        availableItems.length ===
        0
      ) {
        return "لا توجد منتجات متاحة للطلب";
      }


      if (
        !whatsappNumber
      ) {
        return "واتساب غير مضاف في إعدادات المتجر";
      }


      return "";
    };


  /* =====================================
     LOADING
  ===================================== */

  if (loading) {
    return (
      <Loading
        label="جاري تحديث السلة..."
      />
    );
  }


  /* =====================================
     EMPTY
  ===================================== */

  if (
    cart.length ===
    0
  ) {
    return (
      <section className="min-h-[70vh] bg-[#fbfcfa] py-24">

        <div className="mx-auto max-w-4xl px-6">

          <div className="mb-10 flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eef2eb] text-[#52604e]">

              <ShoppingBag
                size={24}
              />

            </div>


            <h1 className="text-4xl font-black text-[#20251f]">
              سلة التسوق
            </h1>

          </div>


          <div className="rounded-[2rem] border border-[#dfe6dc] bg-white p-8 text-center shadow-sm sm:p-12">

            <EmptyState
              title="السلة فارغة"
              description="لم تقم بإضافة أي منتج بعد."
            />


            <Link
              to="/products"
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-[#2f382c] px-5 py-3 text-sm font-black text-white transition hover:bg-[#3c4838]"
            >

              <ArrowLeft
                size={18}
              />

              تصفح المنتجات

            </Link>

          </div>

        </div>

      </section>
    );
  }


  return (
    <section className="bg-[#fbfcfa] py-16 sm:py-20">

      <div className="mx-auto max-w-7xl px-6">


        {/* =================================
            HEADER
        ================================= */}

        <div className="flex flex-wrap items-end justify-between gap-5">

          <div>

            <p className="text-xs font-black text-[#6b7868]">
              OPTICANA
            </p>


            <div className="mt-2 flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eef2eb] text-[#52604e]">

                <ShoppingBag
                  size={23}
                />

              </div>


              <h1 className="text-4xl font-black text-[#20251f] sm:text-5xl">
                سلة التسوق
              </h1>

            </div>


            <p className="mt-3 text-sm font-bold text-[#818b80]">

              لديك{" "}

              <span className="text-[#4f5d4c]">
                {
                  totalItems
                }
              </span>

              {" "}
              قطعة في السلة

            </p>

          </div>


          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#cfdacb] bg-white px-5 py-3 text-sm font-black text-[#4f5d4c] transition hover:border-[#B4C4AD] hover:bg-[#eef2eb]"
          >

            <ArrowLeft
              size={17}
            />

            متابعة التسوق

          </Link>

        </div>


        {/* =================================
            UNAVAILABLE WARNING
        ================================= */}

        {hasUnavailable && (
          <div className="mt-8 rounded-2xl border border-[#eadfc6] bg-[#fbf6e9] p-4">

            <div className="flex items-start gap-3">

              <AlertTriangle
                size={20}
                className="mt-0.5 shrink-0 text-[#a17c34]"
              />


              <div>

                <p className="text-sm font-black text-[#66532d]">
                  بعض المنتجات تحتاج مراجعة
                </p>


                <p className="mt-1 text-xs leading-6 text-[#8b7850]">
                  بعض المنتجات لم تعد متاحة أو تغير مخزونها في لوحة الإدارة.
                  احذفها أو عدّل الكمية قبل إتمام الطلب.
                </p>

              </div>

            </div>

          </div>
        )}


        {/* =================================
            PRICE UPDATE NOTICE
        ================================= */}

        {cartItems.some(
          (item) =>
            item.hasPriceChanged
        ) && (
          <div className="mt-4 rounded-2xl border border-[#dce5d8] bg-[#eef2eb] p-4">

            <div className="flex items-start gap-3">

              <Package
                size={19}
                className="mt-0.5 shrink-0 text-[#61705e]"
              />


              <p className="text-xs leading-6 text-[#687565]">
                تم تحديث أسعار بعض المنتجات حسب الأسعار الحالية في المتجر.
              </p>

            </div>

          </div>
        )}


        {/* =================================
            CONTENT
        ================================= */}

        <div className="mt-10 grid gap-8 lg:grid-cols-[2fr_1fr]">


          {/* =================================
              ITEMS
          ================================= */}

          <div className="space-y-5">

            {cartItems.map(
              (item) => {
                const current =
                  item.currentProduct;


                const image =
                  item.image;


                const itemTotal =
                  item.currentPrice *
                  Number(
                    item.quantity ||
                      0
                  );


                const maxStock =
                  item.currentStock;


                const unavailable =
                  !item.isAvailable;


                return (
                  <Card
                    key={
                      item.id
                    }
                    className={`overflow-hidden p-0 ${
                      unavailable
                        ? "border-[#eadfc6]"
                        : ""
                    }`}
                  >

                    <div className="flex flex-col gap-5 p-5 sm:flex-row">


                      {/* IMAGE */}

                      <Link
                        to={`/product/${item.id}`}
                        className="group h-40 w-full shrink-0 overflow-hidden rounded-2xl bg-[#eef2eb] sm:h-36 sm:w-36"
                      >

                        {image ? (
                          <img
                            src={
                              image
                            }
                            alt={
                              item.name
                            }
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[#91a08d]">

                            <Package
                              size={
                                35
                              }
                            />

                          </div>
                        )}

                      </Link>


                      {/* INFO */}

                      <div className="min-w-0 flex-1">

                        <div className="flex items-start justify-between gap-4">

                          <div>

                            <Link
                              to={`/product/${item.id}`}
                              className="text-xl font-black text-[#20251f] transition hover:text-[#586654]"
                            >
                              {
                                current?.name ||
                                item.name
                              }
                            </Link>


                            <p className="mt-1 text-xs font-bold text-[#929b90]">
                              {
                                current?.category ||
                                item.category ||
                                "منتج"
                              }
                            </p>


                            {current?.sku && (
                              <p className="mt-1 text-[10px] font-bold text-[#a0a89e]">
                                SKU:{" "}
                                {
                                  current.sku
                                }
                              </p>
                            )}

                          </div>


                          <button
                            type="button"
                            onClick={() =>
                              handleRemove(
                                item
                              )
                            }
                            aria-label={`حذف ${item.name}`}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-red-500 transition hover:bg-red-50"
                          >

                            <Trash2
                              size={19}
                            />

                          </button>

                        </div>


                        {/* AVAILABILITY */}

                        <div className="mt-4">

                          {unavailable ? (
                            <div className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-black text-red-500">

                              <AlertTriangle
                                size={14}
                              />

                              {
                                current
                                  ? "غير متوفر حاليًا"
                                  : "المنتج لم يعد منشورًا"
                              }

                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-2 rounded-lg bg-[#eef2eb] px-3 py-1.5 text-xs font-black text-[#5c6a57]">

                              <Package
                                size={14}
                              />

                              متوفر في المخزون{" "}
                              (
                              {
                                maxStock
                              }
                              )

                            </div>
                          )}

                        </div>


                        {/* PRICE + QUANTITY */}

                        <div className="mt-5 flex flex-wrap items-end justify-between gap-5">


                          {/* UNIT PRICE */}

                          <div>

                            <p className="text-xs font-bold text-[#8e978b]">
                              سعر القطعة
                            </p>


                            <p className="mt-1 text-xl font-black text-[#52604e]">

                              {
                                item.currentPrice > 0
                                  ? item.currentPrice.toLocaleString()
                                  : "—"
                              }{" "}

                              {
                                currency
                              }

                            </p>


                            {current?.oldPrice &&
                              Number(
                                current.oldPrice
                              ) >
                                item.currentPrice && (
                                <p className="mt-1 text-xs font-bold text-[#a5ada2] line-through">
                                  {
                                    Number(
                                      current.oldPrice
                                    ).toLocaleString()
                                  }{" "}

                                  {
                                    currency
                                  }

                                </p>
                              )}

                          </div>


                          {/* TOTAL */}

                          <div>

                            <p className="text-xs font-bold text-[#8e978b]">
                              إجمالي المنتج
                            </p>


                            <p className="mt-1 text-xl font-black text-[#20251f]">

                              {
                                item.isAvailable
                                  ? itemTotal.toLocaleString()
                                  : "—"
                              }{" "}

                              {
                                currency
                              }

                            </p>

                          </div>


                          {/* QUANTITY */}

                          <div>

                            <p className="mb-2 text-xs font-bold text-[#8e978b]">
                              الكمية
                            </p>


                            <div className="flex items-center overflow-hidden rounded-xl border border-[#dfe6dc] bg-white">

                              <button
                                type="button"
                                onClick={() =>
                                  decreaseQuantity(
                                    item.id
                                  )
                                }
                                disabled={
                                  item.quantity <=
                                  1
                                }
                                className="flex h-10 w-10 items-center justify-center text-[#5f6b5d] transition hover:bg-[#eef2eb] disabled:cursor-not-allowed disabled:opacity-40"
                              >

                                <Minus
                                  size={16}
                                />

                              </button>


                              <span className="flex h-10 min-w-10 items-center justify-center border-x border-[#dfe6dc] px-3 text-sm font-black text-[#2f382c]">
                                {
                                  item.quantity
                                }
                              </span>


                              <button
                                type="button"
                                onClick={() => {

                                  if (
                                    unavailable
                                  ) {
                                    toast.error(
                                      "المنتج غير متوفر حاليًا"
                                    );

                                    return;
                                  }


                                  if (
                                    maxStock >
                                      0 &&
                                    item.quantity >=
                                      maxStock
                                  ) {
                                    toast.error(
                                      `المتاح حاليًا ${maxStock} فقط`
                                    );

                                    return;
                                  }


                                  increaseQuantity(
                                    item.id
                                  );
                                }}
                                disabled={
                                  unavailable ||
                                  (
                                    maxStock >
                                      0 &&
                                    item.quantity >=
                                      maxStock
                                  )
                                }
                                className="flex h-10 w-10 items-center justify-center text-[#5f6b5d] transition hover:bg-[#eef2eb] disabled:cursor-not-allowed disabled:opacity-40"
                              >

                                <Plus
                                  size={16}
                                />

                              </button>

                            </div>

                          </div>

                        </div>

                      </div>

                    </div>

                  </Card>
                );
              }
            )}

          </div>


          {/* =================================
              SUMMARY
          ================================= */}

          <Card className="h-fit rounded-[2rem] border-[#dfe6dc] p-7 shadow-sm lg:sticky lg:top-28">

            <h2 className="text-2xl font-black text-[#20251f]">
              ملخص الطلب
            </h2>


            <div className="mt-7 space-y-5">


              {/* ALL ITEMS */}

              <div className="flex items-center justify-between text-sm text-[#818b80]">

                <span>
                  عدد القطع
                </span>


                <span className="font-black text-[#20251f]">
                  {
                    totalItems
                  }
                </span>

              </div>


              {/* AVAILABLE ITEMS */}

              {hasUnavailable && (
                <div className="flex items-center justify-between text-sm text-[#818b80]">

                  <span>
                    القطع المتاحة
                  </span>


                  <span className="font-black text-[#52604e]">
                    {
                      availableItemsCount
                    }
                  </span>

                </div>
              )}


              <div className="flex items-center justify-between text-sm text-[#818b80]">

                <span>
                  عدد المنتجات
                </span>


                <span className="font-black text-[#20251f]">
                  {
                    cartItems.length
                  }
                </span>

              </div>


              <div className="border-t border-[#e6ebe3] pt-5">

                <div className="flex items-end justify-between gap-4">

                  <span className="text-lg font-black text-[#30382e]">
                    الإجمالي
                  </span>


                  <span className="text-3xl font-black text-[#2f382c]">

                    {
                      total.toLocaleString()
                    }{" "}

                    {
                      currency
                    }

                  </span>

                </div>


                {hasUnavailable && (
                  <p className="mt-2 text-right text-[11px] font-bold text-[#a17c34]">
                    الإجمالي محسوب للمنتجات المتاحة فقط.
                  </p>
                )}

              </div>

            </div>


            {/* CHECKOUT */}

            {canCheckout ? (
              <button
                type="button"
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2f382c] px-5 py-4 text-sm font-black text-white transition hover:bg-[#3c4838] disabled:cursor-wait disabled:opacity-60"
              >
                <MessageCircle size={20} />
                {checkoutLoading ? "جاري إنشاء الطلب..." : "إتمام الطلب عبر واتساب"}
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="mt-8 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-[#e3e7e0] px-5 py-4 text-sm font-black text-[#8f988d]"
              >

                <MessageCircle
                  size={20}
                />

                {
                  getCheckoutMessage()
                }

              </button>
            )}


            <p className="mt-4 text-center text-xs leading-6 text-[#929b90]">

              {hasUnavailable
                ? "احذف المنتجات غير المتاحة أو عدّل الكمية قبل إتمام الطلب."
                : !whatsappNumber
                  ? "أضف رقم واتساب من إعدادات المتجر لتفعيل الطلب."
                  : "سيتم إرسال تفاصيل الطلب إلى واتساب لتأكيد التوفر والطلب."}

            </p>

          </Card>

        </div>

      </div>

    </section>
  );
}


export default Cart;