import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  User,
  CreditCard,
  Banknote,
  Receipt,
  Users,
  X,
  WalletCards,
  CircleCheck,
  AlertTriangle,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import toast from "react-hot-toast";

import useProductStore from "../store/productStore";
import useSalesStore from "../store/salesStore";
import useInventoryStore from "../store/inventoryStore";
import useCustomerStore from "../store/customerStore";
import usePaymentStore from "../store/paymentStore";


function POS() {
  /* =====================================
     STORES
  ===================================== */

  const products =
    useProductStore(
      (state) => state.products
    );

  const adjustStock =
    useProductStore(
      (state) =>
        state.adjustStock
    );

  const addSale =
    useSalesStore(
      (state) => state.addSale
    );

  const addMovement =
    useInventoryStore(
      (state) =>
        state.addMovement
    );

  const customers =
    useCustomerStore(
      (state) => state.customers
    );

  const fetchProducts = useProductStore((state) => state.fetchProducts);
  const fetchCustomers = useCustomerStore((state) => state.fetchCustomers);

  useEffect(() => {
    Promise.all([fetchProducts(), fetchCustomers()]).catch((error) => {
      toast.error(error?.message || "تعذر تحميل بيانات نقاط البيع");
    });
  }, [fetchProducts, fetchCustomers]);

  const addPayment =
    usePaymentStore(
      (state) =>
        state.addPayment
    );


  /* =====================================
     STATE
  ===================================== */

  const [search, setSearch] =
    useState("");

  const [cart, setCart] =
    useState([]);


  // Customer

  const [
    customerName,
    setCustomerName,
  ] = useState("");

  const [
    customerSearch,
    setCustomerSearch,
  ] = useState("");

  const [
    selectedCustomer,
    setSelectedCustomer,
  ] = useState(null);

  const [
    showCustomers,
    setShowCustomers,
  ] = useState(false);


  // Payment

  const [
    paymentMethod,
    setPaymentMethod,
  ] = useState("cash");

  const [
    paidAmount,
    setPaidAmount,
  ] = useState("");


  const [
    discount,
    setDiscount,
  ] = useState(0);


  /* =====================================
     PRODUCTS SEARCH
  ===================================== */

  const filteredProducts =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase();

      if (!value) {
        return products;
      }

      return products.filter(
        (product) =>
          product.name
            ?.toLowerCase()
            .includes(value) ||
          product.sku
            ?.toLowerCase()
            .includes(value)
      );
    }, [
      products,
      search,
    ]);


  /* =====================================
     CUSTOMERS SEARCH
  ===================================== */

  const filteredCustomers =
    useMemo(() => {
      const value =
        customerSearch
          .trim()
          .toLowerCase();

      if (!value) {
        return customers.slice(
          0,
          8
        );
      }

      return customers
        .filter(
          (customer) =>
            customer.name
              ?.toLowerCase()
              .includes(value) ||
            customer.phone
              ?.toLowerCase()
              .includes(value)
        )
        .slice(0, 8);
    }, [
      customers,
      customerSearch,
    ]);


  /* =====================================
     TOTALS
  ===================================== */

  const subtotal =
    cart.reduce(
      (total, item) =>
        total +
        Number(
          item.sellingPrice ||
            0
        ) *
          Number(
            item.quantity || 0
          ),
      0
    );


  const safeDiscount =
    Math.min(
      Math.max(
        Number(
          discount
        ) || 0,
        0
      ),
      subtotal
    );


  const total =
    subtotal -
    safeDiscount;


  /* =====================================
     COST / PROFIT
  ===================================== */

  const costOfGoods =
    cart.reduce(
      (totalCost, item) =>
        totalCost +
        Number(
          item.purchasePrice ||
            0
        ) *
          Number(
            item.quantity || 0
          ),
      0
    );


  const grossProfit =
    total -
    costOfGoods;


  /* =====================================
     PAYMENT CALCULATION
  ===================================== */

  const numericPaidAmount =
    Math.min(
      Math.max(
        Number(
          paidAmount
        ) || 0,
        0
      ),
      total
    );


  const remainingAmount =
    Math.max(
      total -
        numericPaidAmount,
      0
    );


  const paymentStatus =
    remainingAmount === 0
      ? "paid"
      : numericPaidAmount > 0
        ? "partial"
        : "unpaid";


  const hasDebt =
    remainingAmount > 0;


  /*
    لو فيه متبقي:
    لازم العميل يكون مسجلًا.
  */
  const canCompleteSale =
    cart.length > 0 &&
    (
      !hasDebt ||
      Boolean(
        selectedCustomer
      )
    );


  /* =====================================
     ADD PRODUCT
  ===================================== */

  const addToCart = (
    product
  ) => {
    if (
      Number(
        product.stock || 0
      ) <= 0
    ) {
      toast.error(
        "هذا المنتج غير متوفر"
      );

      return;
    }

    setCart(
      (
        currentCart
      ) => {
        const exists =
          currentCart.find(
            (item) =>
              item.productId ===
              product.id
          );

        if (exists) {
          if (
            exists.quantity >=
            Number(
              product.stock || 0
            )
          ) {
            toast.error(
              "لا توجد كمية إضافية متاحة في المخزون"
            );

            return currentCart;
          }

          return currentCart.map(
            (item) =>
              item.productId ===
              product.id
                ? {
                    ...item,
                    quantity:
                      item.quantity +
                      1,
                  }
                : item
          );
        }

        return [
          ...currentCart,

          {
            productId:
              product.id,

            name:
              product.name,

            sku:
              product.sku,

            sellingPrice:
              Number(
                product.sellingPrice ||
                  0
              ),

            purchasePrice:
              Number(
                product.purchasePrice ||
                  0
              ),

            quantity: 1,

            maxStock:
              Number(
                product.stock || 0
              ),
          },
        ];
      }
    );

    setSearch("");
  };


  /* =====================================
     CHANGE QUANTITY
  ===================================== */

  const changeQuantity = (
    productId,
    amount
  ) => {
    setCart(
      (
        currentCart
      ) =>
        currentCart
          .map(
            (item) => {
              if (
                item.productId !==
                productId
              ) {
                return item;
              }

              const product =
                products.find(
                  (
                    product
                  ) =>
                    product.id ===
                    productId
                );

              const nextQuantity =
                item.quantity +
                amount;

              if (
                !product ||
                nextQuantity <= 0
              ) {
                return null;
              }

              if (
                nextQuantity >
                Number(
                  product.stock ||
                    0
                )
              ) {
                toast.error(
                  "الكمية المطلوبة أكبر من المخزون"
                );

                return item;
              }

              return {
                ...item,
                quantity:
                  nextQuantity,
              };
            }
          )
          .filter(Boolean)
    );
  };


  /* =====================================
     REMOVE PRODUCT
  ===================================== */

  const removeItem = (
    productId
  ) => {
    setCart(
      (
        currentCart
      ) =>
        currentCart.filter(
          (item) =>
            item.productId !==
            productId
        )
    );
  };


  /* =====================================
     SELECT CUSTOMER
  ===================================== */

  const selectCustomer = (
    customer
  ) => {
    setSelectedCustomer(
      customer
    );

    setCustomerName(
      customer.name || ""
    );

    setCustomerSearch(
      ""
    );

    setShowCustomers(
      false
    );
  };


  /* =====================================
     CLEAR CUSTOMER
  ===================================== */

  const clearCustomer = () => {
    setSelectedCustomer(
      null
    );

    setCustomerName(
      ""
    );

    setCustomerSearch(
      ""
    );
  };


  /* =====================================
     CUSTOMER NAME CHANGE
  ===================================== */

  const handleCustomerNameChange =
    (value) => {
      setCustomerName(
        value
      );

      /*
        إذا عدّل الاسم بعد اختيار
        عميل مسجل، نعتبره اسمًا حرًا.
      */
      if (
        selectedCustomer
      ) {
        setSelectedCustomer(
          null
        );
      }
    };


  /* =====================================
     PAYMENT INPUT
  ===================================== */

  const handlePaidAmountChange =
    (value) => {
      setPaidAmount(
        value
      );
    };


  const setFullPayment = () => {
    setPaidAmount(
      String(total)
    );
  };


  /* =====================================
     COMPLETE SALE
  ===================================== */

  const completeSale = async () => {
    /* ---------------------------------
       Cart validation
    --------------------------------- */

    if (
      cart.length === 0
    ) {
      toast.error(
        "أضف منتجًا واحدًا على الأقل"
      );

      return;
    }


    /* ---------------------------------
       Stock validation
    --------------------------------- */

    for (
      const item of cart
    ) {
      const product =
        products.find(
          (
            product
          ) =>
            product.id ===
            item.productId
        );

      if (
        !product ||
        Number(
          product.stock || 0
        ) <
          Number(
            item.quantity || 0
          )
      ) {
        toast.error(
          `المخزون غير كافٍ للمنتج: ${item.name}`
        );

        return;
      }
    }


    /* ---------------------------------
       Debt validation
    --------------------------------- */

    if (
      hasDebt &&
      !selectedCustomer
    ) {
      toast.error(
        "يوجد مبلغ متبقي، لذلك يجب اختيار عميل مسجل"
      );

      setShowCustomers(
        true
      );

      return;
    }


    /* ---------------------------------
       Customer
    --------------------------------- */

    const cleanCustomerName =
      customerName.trim();

    let saleCustomer =
      null;


    if (
      selectedCustomer
    ) {
      saleCustomer = {
        id:
          selectedCustomer.id,

        name:
          selectedCustomer.name,

        phone:
          selectedCustomer.phone ||
          "",
      };
    } else if (
      cleanCustomerName
    ) {
      /*
        اسم حر مسموح فقط عندما
        لا يوجد دين.
      */
      saleCustomer = {
        id: null,

        name:
          cleanCustomerName,

        phone: "",
      };
    }


    /* ---------------------------------
       Sale items
    --------------------------------- */

    const saleItems =
      cart.map(
        (item) => ({
          productId:
            item.productId,

          name:
            item.name,

          sku:
            item.sku,

          quantity:
            Number(
              item.quantity || 0
            ),

          price:
            Number(
              item.sellingPrice ||
                0
            ),

          purchasePrice:
            Number(
              item.purchasePrice ||
                0
            ),

          total:
            Number(
              item.sellingPrice ||
                0
            ) *
            Number(
              item.quantity || 0
            ),
        })
      );


    /* ---------------------------------
       Customer type
    --------------------------------- */

    const customerType =
      selectedCustomer
        ? "registered"
        : saleCustomer
          ? "walk_in"
          : "anonymous";


    /* ---------------------------------
       Create sale
    --------------------------------- */

    const sale = await addSale({
      source: "pos",
      customer: saleCustomer,
      customerId: selectedCustomer?.id || null,
      items: saleItems,
      discount: safeDiscount,
      notes: null,
      paymentMethod,
    });


    /* ---------------------------------
       Record first payment
    --------------------------------- */

    if (
      numericPaidAmount > 0
    ) {
      await addPayment({
        orderId:
          sale.id,

        invoiceNumber:
          sale.invoiceNumber,

        customerId:
          saleCustomer?.id ||
          null,

        customerName:
          saleCustomer?.name ||
          "عميل نقدي",

        amount:
          numericPaidAmount,

        method:
          paymentMethod,

        type:
          "sale_payment",

        note:
          hasDebt
            ? "دفعة أولى — يوجد رصيد مستحق"
            : "دفع كامل عند إتمام البيع",
      });
    }





    /* ---------------------------------
       Success message
    --------------------------------- */

    if (
      paymentStatus ===
      "paid"
    ) {
      if (
        saleCustomer
      ) {
        toast.success(
          `تم تسجيل البيع بالكامل للعميل ${saleCustomer.name}`
        );
      } else {
        toast.success(
          "تم تسجيل البيع وتحديث المخزون"
        );
      }
    } else if (
      paymentStatus ===
      "partial"
    ) {
      toast.success(
        `تم تسجيل البيع — المتبقي ${remainingAmount.toLocaleString()} ج.م على ${saleCustomer.name}`
      );
    } else {
      toast.success(
        `تم تسجيل الفاتورة باسم ${saleCustomer.name}`
      );
    }


    /* ---------------------------------
       RESET
    --------------------------------- */

    setCart([]);

    setSelectedCustomer(
      null
    );

    setCustomerName(
      ""
    );

    setCustomerSearch(
      ""
    );

    setShowCustomers(
      false
    );

    setDiscount(
      0
    );

    setPaidAmount(
      ""
    );

    setPaymentMethod(
      "cash"
    );
  };


  return (
    <div className="space-y-6">

      {/* =================================
          HEADER
      ================================= */}

      <div>
        <div className="mb-3 inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-xs font-black text-blue-700">
          <ShoppingCart
            size={15}
          />
          نقطة البيع
        </div>

        <h1 className="text-3xl font-black text-slate-900">
          نقطة البيع
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          تسجيل مبيعات المحل وتحديث المخزون
          وإدارة دفعات العملاء من مكان واحد.
        </p>
      </div>


      {/* =================================
          MAIN GRID
      ================================= */}

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">

        {/* =================================
            PRODUCTS
        ================================= */}

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 p-5">

            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">

              <Search
                size={19}
                className="text-slate-400"
              />

              <input
                value={
                  search
                }
                onChange={(
                  event
                ) =>
                  setSearch(
                    event.target
                      .value
                  )
                }
                placeholder="ابحث عن المنتج أو SKU..."
                className="w-full bg-transparent text-sm outline-none"
              />

            </div>

          </div>


          <div className="grid max-h-[650px] gap-3 overflow-y-auto p-5 sm:grid-cols-2 lg:grid-cols-3">

            {filteredProducts.map(
              (
                product
              ) => {
                const unavailable =
                  Number(
                    product.stock ||
                      0
                  ) <= 0;

                return (
                  <button
                    key={
                      product.id
                    }
                    type="button"
                    disabled={
                      unavailable
                    }
                    onClick={() =>
                      addToCart(
                        product
                      )
                    }
                    className={`rounded-xl border p-4 text-right transition ${
                      unavailable
                        ? "cursor-not-allowed border-slate-100 bg-slate-50 opacity-50"
                        : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
                    }`}
                  >

                    <div className="flex items-start justify-between gap-3">

                      <div>
                        <p className="font-bold text-slate-800">
                          {
                            product.name
                          }
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {
                            product.sku
                          }
                        </p>
                      </div>

                      <div className="rounded-lg bg-blue-50 p-2 text-blue-700">
                        <ShoppingCart
                          size={17}
                        />
                      </div>

                    </div>


                    <div className="mt-5 flex items-end justify-between">

                      <span className="font-black text-slate-900">
                        {Number(
                          product.sellingPrice ||
                            0
                        ).toLocaleString()}{" "}
                        ج.م
                      </span>

                      <span
                        className={`text-xs font-bold ${
                          unavailable
                            ? "text-red-500"
                            : Number(
                                  product.stock ||
                                    0
                                ) <=
                                Number(
                                  product.reorderLevel ||
                                    0
                                )
                              ? "text-orange-500"
                              : "text-emerald-600"
                        }`}
                      >
                        {unavailable
                          ? "نفد المخزون"
                          : `${product.stock} متاح`}
                      </span>

                    </div>

                  </button>
                );
              }
            )}


            {filteredProducts.length ===
              0 && (
              <div className="col-span-full flex min-h-60 items-center justify-center text-sm text-slate-400">
                لا يوجد منتج مطابق للبحث.
              </div>
            )}

          </div>

        </div>


        {/* =================================
            CART
        ================================= */}

        <div className="flex h-fit flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Cart Header */}

          <div className="flex items-center justify-between border-b border-slate-200 p-5">

            <div>

              <h2 className="font-black text-slate-900">
                الفاتورة الحالية
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                {cart.length} منتجات
              </p>

            </div>

            <Receipt
              size={21}
              className="text-blue-700"
            />

          </div>


          {/* Cart Items */}

          <div className="max-h-[380px] overflow-y-auto p-5">

            {cart.length ===
            0 ? (
              <div className="flex min-h-40 flex-col items-center justify-center text-center">

                <ShoppingCart
                  size={35}
                  className="text-slate-300"
                />

                <p className="mt-3 font-bold text-slate-600">
                  السلة فارغة
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  اختر منتجًا لإضافته للفاتورة.
                </p>

              </div>
            ) : (
              <div className="space-y-3">

                {cart.map(
                  (item) => (
                    <div
                      key={
                        item.productId
                      }
                      className="rounded-xl border border-slate-100 bg-slate-50 p-3"
                    >

                      <div className="flex items-start justify-between gap-3">

                        <div>

                          <p className="text-sm font-bold text-slate-800">
                            {
                              item.name
                            }
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {Number(
                              item.sellingPrice ||
                                0
                            ).toLocaleString()}{" "}
                            ج.م
                          </p>

                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeItem(
                              item.productId
                            )
                          }
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2
                            size={
                              16
                            }
                          />
                        </button>

                      </div>


                      <div className="mt-3 flex items-center justify-between">

                        <span className="font-black text-slate-800">
                          {(
                            Number(
                              item.sellingPrice ||
                                0
                            ) *
                            Number(
                              item.quantity ||
                                0
                            )
                          ).toLocaleString()}{" "}
                          ج.م
                        </span>


                        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-1">

                          <button
                            type="button"
                            onClick={() =>
                              changeQuantity(
                                item.productId,
                                -1
                              )
                            }
                            className="rounded-md p-1 hover:bg-slate-100"
                          >
                            <Minus
                              size={
                                14
                              }
                            />
                          </button>

                          <span className="min-w-6 text-center text-sm font-black">
                            {
                              item.quantity
                            }
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              changeQuantity(
                                item.productId,
                                1
                              )
                            }
                            className="rounded-md p-1 hover:bg-slate-100"
                          >
                            <Plus
                              size={
                                14
                              }
                            />
                          </button>

                        </div>

                      </div>

                    </div>
                  )
                )}

              </div>
            )}

          </div>


          {/* =================================
              CUSTOMER
          ================================= */}

          <div className="border-t border-slate-200 p-5">

            <div className="mb-2 flex items-center justify-between">

              <p className="text-xs font-bold text-slate-500">
                العميل
              </p>

              {selectedCustomer && (
                <button
                  type="button"
                  onClick={
                    clearCustomer
                  }
                  className="text-xs font-bold text-red-500 hover:text-red-600"
                >
                  إزالة
                </button>
              )}

            </div>


            <div className="flex gap-2">

              <div className={`flex flex-1 items-center gap-3 rounded-xl border px-4 py-3 ${
                hasDebt &&
                !selectedCustomer
                  ? "border-red-200 bg-red-50"
                  : "border-slate-200 bg-white"
              }`}>

                <User
                  size={18}
                  className={
                    hasDebt &&
                    !selectedCustomer
                      ? "shrink-0 text-red-400"
                      : "shrink-0 text-slate-400"
                  }
                />

                <input
                  value={
                    customerName
                  }
                  onChange={(
                    event
                  ) =>
                    handleCustomerNameChange(
                      event
                        .target
                        .value
                    )
                  }
                  placeholder="اكتب اسم العميل..."
                  className="w-full bg-transparent text-sm outline-none"
                />

              </div>


              <button
                type="button"
                onClick={() => {
                  setCustomerSearch(
                    ""
                  );

                  setShowCustomers(
                    true
                  );
                }}
                className="flex shrink-0 items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-100"
              >
                <Users
                  size={17}
                />
                اختيار
              </button>

            </div>


            {selectedCustomer && (
              <div className="mt-2 flex items-center gap-2 text-xs text-blue-600">

                <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />

                عميل مسجل

                {selectedCustomer.phone
                  ? ` • ${selectedCustomer.phone}`
                  : ""}

              </div>
            )}


            {!selectedCustomer &&
              customerName.trim() &&
              !hasDebt && (
                <p className="mt-2 text-[11px] text-slate-400">
                  سيتم حفظ الاسم كعميل جديد داخل الفاتورة فقط.
                </p>
              )}


            {hasDebt &&
              !selectedCustomer && (
                <div className="mt-3 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-xs leading-5 text-red-600">

                  <AlertTriangle
                    size={15}
                    className="mt-0.5 shrink-0"
                  />

                  <p>
                    يوجد مبلغ متبقي قدره{" "}
                    <strong>
                      {remainingAmount.toLocaleString()}{" "}
                      ج.م
                    </strong>
                    . يجب اختيار عميل مسجل حتى يتم حفظ الرصيد عليه.
                  </p>

                </div>
              )}

          </div>


          {/* =================================
              CUSTOMER PICKER
          ================================= */}

          {showCustomers && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">

              <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">

                <div className="flex items-center justify-between border-b border-slate-200 p-5">

                  <div>

                    <h2 className="font-black text-slate-900">
                      اختيار عميل
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                      اختر عميلًا مسجلًا مسبقًا.
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setShowCustomers(
                        false
                      )
                    }
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X
                      size={19}
                    />
                  </button>

                </div>


                <div className="p-5">

                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">

                    <Search
                      size={18}
                      className="text-slate-400"
                    />

                    <input
                      autoFocus
                      value={
                        customerSearch
                      }
                      onChange={(
                        event
                      ) =>
                        setCustomerSearch(
                          event
                            .target
                            .value
                        )
                      }
                      placeholder="ابحث بالاسم أو رقم الهاتف..."
                      className="w-full bg-transparent text-sm outline-none"
                    />

                  </div>


                  <div className="mt-3 max-h-72 overflow-y-auto">

                    {filteredCustomers.length >
                    0 ? (
                      <div className="space-y-1">

                        {filteredCustomers.map(
                          (
                            customer
                          ) => (
                            <button
                              key={
                                customer.id
                              }
                              type="button"
                              onClick={() =>
                                selectCustomer(
                                  customer
                                )
                              }
                              className="flex w-full items-center gap-3 rounded-xl p-3 text-right transition hover:bg-slate-50"
                            >

                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-black text-blue-700">
                                {customer.name
                                  ?.charAt(
                                    0
                                  )
                                  .toUpperCase()}
                              </div>

                              <div className="min-w-0">

                                <p className="truncate text-sm font-bold text-slate-800">
                                  {
                                    customer.name
                                  }
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                  {
                                    customer.phone ||
                                    "بدون هاتف"
                                  }
                                </p>

                              </div>

                            </button>
                          )
                        )}

                      </div>
                    ) : (
                      <div className="py-10 text-center">

                        <Users
                          size={32}
                          className="mx-auto text-slate-300"
                        />

                        <p className="mt-3 text-sm font-bold text-slate-600">
                          لا يوجد عميل مطابق
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          يمكنك إغلاق النافذة وكتابة اسم عميل جديد في الفاتورة.
                        </p>

                      </div>
                    )}

                  </div>

                </div>

              </div>

            </div>
          )}


          {/* =================================
              PAYMENT
          ================================= */}

          <div className="space-y-4 border-t border-slate-200 p-5">

            {/* Payment Method */}

            <div>

              <p className="mb-2 text-xs font-bold text-slate-500">
                طريقة الدفع
              </p>

              <div className="grid grid-cols-2 gap-2">

                <button
                  type="button"
                  onClick={() =>
                    setPaymentMethod(
                      "cash"
                    )
                  }
                  className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-bold transition ${
                    paymentMethod ===
                    "cash"
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <Banknote
                    size={17}
                  />
                  كاش
                </button>


                <button
                  type="button"
                  onClick={() =>
                    setPaymentMethod(
                      "card"
                    )
                  }
                  className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-bold transition ${
                    paymentMethod ===
                    "card"
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <CreditCard
                    size={17}
                  />
                  بطاقة
                </button>

              </div>

            </div>


            {/* Discount */}

            <div>

              <label className="mb-2 block text-xs font-bold text-slate-500">
                الخصم
              </label>

              <input
                type="number"
                min="0"
                max={
                  subtotal
                }
                value={
                  discount
                }
                onChange={(event) =>
                  setDiscount(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                placeholder="0"
              />

            </div>


            {/* Paid Amount */}

            <div>

              <div className="mb-2 flex items-center justify-between">

                <label className="text-xs font-bold text-slate-500">
                  المبلغ المدفوع
                </label>

                <button
                  type="button"
                  onClick={
                    setFullPayment
                  }
                  disabled={
                    total <= 0
                  }
                  className="text-xs font-black text-blue-700 hover:text-blue-800 disabled:opacity-40"
                >
                  دفع كامل
                </button>

              </div>


              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 focus-within:border-blue-500">

                <WalletCards
                  size={18}
                  className="shrink-0 text-slate-400"
                />

                <input
                  type="number"
                  min="0"
                  max={
                    total
                  }
                  value={
                    paidAmount
                  }
                  onChange={(
                    event
                  ) =>
                    handlePaidAmountChange(
                      event
                        .target
                        .value
                    )
                  }
                  placeholder={`الإجمالي ${total.toLocaleString()} ج.م`}
                  className="w-full text-sm font-bold outline-none"
                />

                <span className="shrink-0 text-xs font-bold text-slate-400">
                  ج.م
                </span>

              </div>

            </div>


            {/* Payment Status */}

            {cart.length > 0 && (
              <div
                className={`rounded-xl p-4 ${
                  paymentStatus ===
                  "paid"
                    ? "bg-emerald-50"
                    : paymentStatus ===
                        "partial"
                      ? "bg-orange-50"
                      : "bg-red-50"
                }`}
              >

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-2">

                    {paymentStatus ===
                    "paid" ? (
                      <CircleCheck
                        size={18}
                        className="text-emerald-600"
                      />
                    ) : (
                      <AlertTriangle
                        size={18}
                        className={
                          paymentStatus ===
                          "partial"
                            ? "text-orange-600"
                            : "text-red-600"
                        }
                      />
                    )}

                    <p
                      className={`text-sm font-black ${
                        paymentStatus ===
                        "paid"
                          ? "text-emerald-700"
                          : paymentStatus ===
                              "partial"
                            ? "text-orange-700"
                            : "text-red-700"
                      }`}
                    >
                      {paymentStatus ===
                      "paid"
                        ? "مدفوعة بالكامل"
                        : paymentStatus ===
                            "partial"
                          ? "مدفوعة جزئيًا"
                          : "غير مدفوعة"}
                    </p>

                  </div>


                  <div className="text-left">

                    <p className="text-[11px] font-bold text-slate-400">
                      المتبقي
                    </p>

                    <p
                      className={`mt-1 font-black ${
                        remainingAmount >
                        0
                          ? "text-orange-600"
                          : "text-emerald-600"
                      }`}
                    >
                      {remainingAmount.toLocaleString()}{" "}
                      ج.م
                    </p>

                  </div>

                </div>

              </div>
            )}


            {/* Totals */}

            <div className="space-y-2 border-t border-slate-100 pt-4 text-sm">

              <div className="flex justify-between text-slate-500">
                <span>
                  المجموع
                </span>

                <span>
                  {subtotal.toLocaleString()}{" "}
                  ج.م
                </span>
              </div>


              <div className="flex justify-between text-slate-500">
                <span>
                  الخصم
                </span>

                <span>
                  -{" "}
                  {safeDiscount.toLocaleString()}{" "}
                  ج.م
                </span>
              </div>


              <div className="flex items-center justify-between pt-2">

                <span className="font-black text-slate-900">
                  الإجمالي
                </span>

                <span className="text-2xl font-black text-blue-700">
                  {total.toLocaleString()}{" "}
                  ج.م
                </span>

              </div>

            </div>


            {/* Validation message */}

            {hasDebt &&
              !selectedCustomer && (
                <p className="rounded-xl bg-red-50 px-3 py-2 text-xs font-bold leading-5 text-red-600">
                  لا يمكن إتمام البيع مع وجود مبلغ متبقي
                  بدون تحديد عميل مسجل.
                </p>
              )}


            {/* Complete */}

            <button
              type="button"
              onClick={
                completeSale
              }
              disabled={
                !canCompleteSale
              }
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 py-4 font-black text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
            >
              <Receipt
                size={19}
              />

              {paymentStatus ===
              "paid"
                ? "إتمام البيع"
                : "تسجيل البيع والدين"}

            </button>

          </div>

        </div>

      </div>

    </div>
  );
}


export default POS;