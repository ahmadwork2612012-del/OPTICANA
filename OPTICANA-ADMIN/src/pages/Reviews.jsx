import {
  Search,
  Star,
  StarHalf,
  CheckCircle2,
  EyeOff,
  Trash2,
  X,
  Users,
  Package,
  MessageSquare,
  Sparkles,
  Clock3,
  Eye,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import toast from "react-hot-toast";

import useReviewStore from "../store/reviewStore";
import useProductStore from "../store/productStore";
import useCustomerStore from "../store/customerStore";

const STATUS_CONFIG = {
  pending: {
    label: "بانتظار المراجعة",
    className:
      "bg-orange-50 text-orange-600",
    icon: Clock3,
  },

  approved: {
    label: "منشورة",
    className:
      "bg-emerald-50 text-emerald-600",
    icon: CheckCircle2,
  },

  hidden: {
    label: "مخفية",
    className:
      "bg-slate-100 text-slate-600",
    icon: EyeOff,
  },
};

const STATUS_OPTIONS = [
  "all",
  "pending",
  "approved",
  "hidden",
];

const RATING_OPTIONS = [
  "all",
  "5",
  "4",
  "3",
  "2",
  "1",
];

function Reviews() {
  const reviews = useReviewStore(
    (state) => state.reviews
  );

  const approveReview =
    useReviewStore(
      (state) => state.approveReview
    );

  const hideReview =
    useReviewStore(
      (state) => state.hideReview
    );

  const deleteReview =
    useReviewStore(
      (state) => state.deleteReview
    );

  const toggleFeatured =
    useReviewStore(
      (state) => state.toggleFeatured
    );

  const products = useProductStore(
    (state) => state.products
  );

  const customers = useCustomerStore(
    (state) => state.customers
  );

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [ratingFilter, setRatingFilter] =
    useState("all");

  const [productFilter, setProductFilter] =
    useState("all");

  const [selectedReview, setSelectedReview] =
    useState(null);

  const [deleteTarget, setDeleteTarget] =
    useState(null);

  // =========================
  // HELPERS
  // =========================

  const getProductName = (productId) => {
    if (!productId) {
      return "منتج غير محدد";
    }

    return (
      products.find(
        (product) =>
          String(product.id) ===
          String(productId)
      )?.name ||
      "منتج غير معروف"
    );
  };

  const getCustomerName = (review) => {
    if (
      review.customerName
    ) {
      return review.customerName;
    }

    if (review.customerId) {
      return (
        customers.find(
          (customer) =>
            String(customer.id) ===
            String(review.customerId)
        )?.name ||
        "عميل"
      );
    }

    return "عميل";
  };

  // =========================
  // FILTERED
  // =========================

  const filteredReviews = useMemo(() => {
    const value =
      search
        .trim()
        .toLowerCase();

    return [...reviews]
      .sort(
        (a, b) =>
          new Date(
            b.createdAt || 0
          ) -
          new Date(
            a.createdAt || 0
          )
      )
      .filter((review) => {
        const productName =
          getProductName(
            review.productId
          );

        const customerName =
          getCustomerName(
            review
          );

        const matchesSearch =
          !value ||
          review.id
            ?.toLowerCase()
            .includes(value) ||
          review.comment
            ?.toLowerCase()
            .includes(value) ||
          customerName
            ?.toLowerCase()
            .includes(value) ||
          productName
            ?.toLowerCase()
            .includes(value);

        const matchesStatus =
          statusFilter === "all" ||
          review.status ===
            statusFilter;

        const matchesRating =
          ratingFilter === "all" ||
          String(
            review.rating
          ) === ratingFilter;

        const matchesProduct =
          productFilter === "all" ||
          String(
            review.productId
          ) ===
            String(
              productFilter
            );

        return (
          matchesSearch &&
          matchesStatus &&
          matchesRating &&
          matchesProduct
        );
      });
  }, [
    reviews,
    products,
    customers,
    search,
    statusFilter,
    ratingFilter,
    productFilter,
  ]);

  // =========================
  // STATS
  // =========================

  const totalReviews =
    reviews.length;

  const pendingReviews =
    reviews.filter(
      (review) =>
        review.status ===
        "pending"
    ).length;

  const approvedReviews =
    reviews.filter(
      (review) =>
        review.status ===
        "approved"
    ).length;

  const hiddenReviews =
    reviews.filter(
      (review) =>
        review.status ===
        "hidden"
    ).length;

  const averageRating =
    reviews.length > 0
      ? reviews.reduce(
          (sum, review) =>
            sum +
            Number(
              review.rating || 0
            ),
          0
        ) /
        reviews.length
      : 0;

  const featuredReviews =
    reviews.filter(
      (review) =>
        review.featured
    ).length;

  const ratingDistribution =
    [5, 4, 3, 2, 1].map(
      (rating) => ({
        rating,

        count:
          reviews.filter(
            (review) =>
              Number(
                review.rating
              ) === rating
          ).length,
      })
    );

  // =========================
  // ACTIONS
  // =========================

  const handleApprove = (review) => {
    approveReview(
      review.id
    );

    setSelectedReview(
      (current) =>
        current?.id ===
        review.id
          ? {
              ...current,
              status:
                "approved",
            }
          : current
    );

    toast.success(
      "تم اعتماد المراجعة"
    );
  };

  const handleHide = (review) => {
    hideReview(
      review.id
    );

    setSelectedReview(
      (current) =>
        current?.id ===
        review.id
          ? {
              ...current,
              status:
                "hidden",
            }
          : current
    );

    toast.success(
      "تم إخفاء المراجعة"
    );
  };

  const handleFeatured = (review) => {
    toggleFeatured(
      review.id
    );

    setSelectedReview(
      (current) =>
        current?.id ===
        review.id
          ? {
              ...current,
              featured:
                !current.featured,
            }
          : current
    );

    toast.success(
      review.featured
        ? "تم إلغاء تمييز المراجعة"
        : "تم تمييز المراجعة"
    );
  };

  const confirmDelete = () => {
    if (!deleteTarget) {
      return;
    }

    deleteReview(
      deleteTarget.id
    );

    if (
      selectedReview?.id ===
      deleteTarget.id
    ) {
      setSelectedReview(
        null
      );
    }

    toast.success(
      "تم حذف المراجعة"
    );

    setDeleteTarget(
      null
    );
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div>
        <div className="mb-3 inline-flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs font-black text-amber-700">
          <Star size={15} />
          تقييمات المتجر
        </div>

        <h1 className="text-3xl font-black text-slate-900">
          المراجعات
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          إدارة تقييمات العملاء ومراجعات المنتجات
          واعتمادها وإخفائها وتمييز الأفضل منها.
        </p>
      </div>

      {/* MAIN STATS */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">

        <SummaryCard
          icon={MessageSquare}
          title="كل المراجعات"
          value={totalReviews}
          accent="blue"
        />

        <SummaryCard
          icon={Clock3}
          title="بانتظار المراجعة"
          value={pendingReviews}
          accent="orange"
        />

        <SummaryCard
          icon={CheckCircle2}
          title="منشورة"
          value={approvedReviews}
          accent="green"
        />

        <SummaryCard
          icon={Star}
          title="متوسط التقييم"
          value={averageRating.toFixed(
            1
          )}
          accent="purple"
        />

        <SummaryCard
          icon={Sparkles}
          title="مميزة"
          value={featuredReviews}
          accent="gold"
        />

      </div>

      {/* FILTERS */}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="grid gap-3 xl:grid-cols-[1fr_180px_170px_220px]">

          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">

            <Search
              size={18}
              className="text-slate-400"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="ابحث بالتقييم أو العميل أو المنتج..."
              className="w-full bg-transparent text-sm outline-none"
            />

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
                className="rounded-lg p-1 text-slate-400 hover:bg-white"
              >
                <X size={15} />
              </button>
            )}

          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 outline-none focus:border-blue-500"
          >
            <option value="all">
              كل الحالات
            </option>

            {STATUS_OPTIONS
              .filter(
                (status) =>
                  status !== "all"
              )
              .map((status) => (
                <option
                  key={status}
                  value={status}
                >
                  {
                    STATUS_CONFIG[
                      status
                    ].label
                  }
                </option>
              ))}
          </select>

          <select
            value={ratingFilter}
            onChange={(event) =>
              setRatingFilter(
                event.target.value
              )
            }
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 outline-none focus:border-blue-500"
          >
            <option value="all">
              كل التقييمات
            </option>

            {RATING_OPTIONS
              .filter(
                (rating) =>
                  rating !== "all"
              )
              .map((rating) => (
                <option
                  key={rating}
                  value={rating}
                >
                  {rating} نجوم
                </option>
              ))}
          </select>

          <select
            value={productFilter}
            onChange={(event) =>
              setProductFilter(
                event.target.value
              )
            }
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 outline-none focus:border-blue-500"
          >
            <option value="all">
              كل المنتجات
            </option>

            {products.map(
              (product) => (
                <option
                  key={product.id}
                  value={product.id}
                >
                  {
                    product.name
                  }
                </option>
              )
            )}
          </select>

        </div>

      </div>

      {/* OVERVIEW */}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">

        {/* REVIEWS */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-slate-200 p-5">

            <div>
              <h2 className="font-black text-slate-900">
                مراجعات العملاء
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                {filteredReviews.length} مراجعة مطابقة للفلاتر.
              </p>
            </div>

            <Star
              size={20}
              className="text-amber-500"
            />

          </div>

          {filteredReviews.length ===
          0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center">

              <MessageSquare
                size={42}
                className="text-slate-300"
              />

              <p className="mt-4 font-bold text-slate-700">
                لا توجد مراجعات
              </p>

              <p className="mt-1 text-sm text-slate-400">
                لا توجد مراجعات تطابق الفلاتر الحالية.
              </p>

            </div>
          ) : (
            <div className="divide-y divide-slate-100">

              {filteredReviews.map(
                (review) => {
                  const status =
                    STATUS_CONFIG[
                      review.status
                    ] ||
                    STATUS_CONFIG.pending;

                  const StatusIcon =
                    status.icon;

                  return (
                    <ReviewRow
                      key={
                        review.id
                      }
                      review={
                        review
                      }
                      productName={getProductName(
                        review.productId
                      )}
                      customerName={getCustomerName(
                        review
                      )}
                      status={
                        status
                      }
                      StatusIcon={
                        StatusIcon
                      }
                      onOpen={() =>
                        setSelectedReview(
                          review
                        )
                      }
                      onApprove={() =>
                        handleApprove(
                          review
                        )
                      }
                      onHide={() =>
                        handleHide(
                          review
                        )
                      }
                      onFeature={() =>
                        handleFeatured(
                          review
                        )
                      }
                      onDelete={() =>
                        setDeleteTarget(
                          review
                        )
                      }
                    />
                  );
                }
              )}

            </div>
          )}

        </div>

        {/* RATING BREAKDOWN */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-amber-50 p-2 text-amber-600">
              <Star size={19} />
            </div>

            <div>
              <h2 className="font-black text-slate-900">
                توزيع التقييمات
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                نظرة سريعة على تقييمات العملاء.
              </p>
            </div>

          </div>

          <div className="mt-6 space-y-4">

            {ratingDistribution.map(
              (item) => {
                const percentage =
                  totalReviews
                    ? Math.round(
                        (item.count /
                          totalReviews) *
                          100
                      )
                    : 0;

                return (
                  <RatingBar
                    key={
                      item.rating
                    }
                    rating={
                      item.rating
                    }
                    count={
                      item.count
                    }
                    percentage={
                      percentage
                    }
                  />
                );
              }
            )}

          </div>

          <div className="mt-6 rounded-2xl bg-slate-50 p-5 text-center">

            <p className="text-xs font-bold text-slate-400">
              متوسط التقييم
            </p>

            <div className="mt-2 flex items-center justify-center gap-2">

              <span className="text-3xl font-black text-slate-900">
                {averageRating.toFixed(
                  1
                )}
              </span>

              <Stars
                rating={
                  averageRating
                }
                size={17}
              />

            </div>

          </div>

        </div>

      </div>

      {/* DETAILS */}

      {selectedReview && (
        <ReviewDetails
          review={
            selectedReview
          }
          productName={getProductName(
            selectedReview.productId
          )}
          customerName={getCustomerName(
            selectedReview
          )}
          onClose={() =>
            setSelectedReview(
              null
            )
          }
          onApprove={() =>
            handleApprove(
              selectedReview
            )
          }
          onHide={() =>
            handleHide(
              selectedReview
            )
          }
          onFeature={() =>
            handleFeatured(
              selectedReview
            )
          }
          onDelete={() =>
            setDeleteTarget(
              selectedReview
            )
          }
        />
      )}

      {/* DELETE */}

      {deleteTarget && (
        <DeleteModal
          review={
            deleteTarget
          }
          onClose={() =>
            setDeleteTarget(
              null
            )
          }
          onConfirm={
            confirmDelete
          }
        />
      )}

    </div>
  );
}

/* =========================
   REVIEW ROW
========================= */

function ReviewRow({
  review,
  productName,
  customerName,
  status,
  StatusIcon,
  onOpen,
  onApprove,
  onHide,
  onFeature,
  onDelete,
}) {
  return (
    <div
      className={`group p-5 transition hover:bg-slate-50 ${
        !review.read
          ? "bg-blue-50/20"
          : ""
      }`}
    >
      <div className="flex items-start justify-between gap-4">

        <div className="flex min-w-0 gap-4">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Star size={19} />
          </div>

          <div className="min-w-0">

            <div className="flex flex-wrap items-center gap-2">

              <p className="font-black text-slate-800">
                {customerName}
              </p>

              <span className="text-slate-300">
                •
              </span>

              <p className="truncate text-xs font-bold text-slate-400">
                {productName}
              </p>

            </div>

            <div className="mt-2 flex flex-wrap items-center gap-3">

              <Stars
                rating={
                  review.rating
                }
                size={14}
              />

              <span
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-black ${status.className}`}
              >
                <StatusIcon size={12} />
                {
                  status.label
                }
              </span>

              {review.featured && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-violet-50 px-2.5 py-1.5 text-[10px] font-black text-violet-600">
                  <Sparkles
                    size={12}
                  />
                  مميزة
                </span>
              )}

            </div>

            <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">
              {review.comment ||
                "بدون تعليق"}
            </p>

            <p className="mt-2 text-[10px] text-slate-400">
              {formatDate(
                review.createdAt
              )}
            </p>

          </div>

        </div>

        <div className="flex shrink-0 items-center gap-1">

          <button
            type="button"
            onClick={onOpen}
            className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-700"
            title="عرض التفاصيل"
          >
            <Eye size={16} />
          </button>

          {review.status !==
            "approved" && (
            <button
              type="button"
              onClick={
                onApprove
              }
              className="rounded-lg p-2 text-emerald-500 hover:bg-emerald-50"
              title="اعتماد"
            >
              <CheckCircle2
                size={16}
              />
            </button>
          )}

          {review.status !==
            "hidden" && (
            <button
              type="button"
              onClick={
                onHide
              }
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              title="إخفاء"
            >
              <EyeOff size={16} />
            </button>
          )}

          <button
            type="button"
            onClick={
              onFeature
            }
            className={`rounded-lg p-2 ${
              review.featured
                ? "bg-violet-50 text-violet-600"
                : "text-slate-400 hover:bg-violet-50 hover:text-violet-600"
            }`}
            title="تمييز"
          >
            <Sparkles
              size={16}
            />
          </button>

          <button
            type="button"
            onClick={
              onDelete
            }
            className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500"
            title="حذف"
          >
            <Trash2 size={16} />
          </button>

        </div>

      </div>
    </div>
  );
}

/* =========================
   DETAILS
========================= */

function ReviewDetails({
  review,
  productName,
  customerName,
  onClose,
  onApprove,
  onHide,
  onFeature,
  onDelete,
}) {
  const status =
    STATUS_CONFIG[
      review.status
    ] ||
    STATUS_CONFIG.pending;

  const StatusIcon =
    status.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">

      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">

        <div className="flex items-center justify-between border-b border-slate-200 p-6">

          <div>
            <p className="text-xs font-bold text-amber-600">
              تفاصيل المراجعة
            </p>

            <h2 className="mt-1 text-2xl font-black text-slate-900">
              مراجعة {customerName}
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              {formatDate(
                review.createdAt
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
          >
            <X size={20} />
          </button>

        </div>

        <div className="overflow-y-auto p-6">

          <div className="grid gap-3 sm:grid-cols-2">

            <InfoCard
              label="المنتج"
              value={
                productName
              }
              icon={
                Package
              }
            />

            <InfoCard
              label="العميل"
              value={
                customerName
              }
              icon={
                Users
              }
            />

            <InfoCard
              label="الحالة"
              value={
                <span
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-black ${status.className}`}
                >
                  <StatusIcon
                    size={14}
                  />
                  {
                    status.label
                  }
                </span>
              }
              icon={
                CheckCircle2
              }
            />

            <InfoCard
              label="التقييم"
              value={
                <div className="flex items-center gap-2">
                  <Stars
                    rating={
                      review.rating
                    }
                    size={17}
                  />

                  <span className="font-black text-slate-800">
                    {review.rating}/5
                  </span>
                </div>
              }
              icon={
                Star
              }
            />

          </div>

          <div className="mt-5 rounded-2xl bg-slate-50 p-5">

            <p className="text-xs font-bold text-slate-400">
              التعليق
            </p>

            <p className="mt-3 text-sm leading-7 text-slate-700">
              {review.comment ||
                "لم يكتب العميل تعليقًا."}
            </p>

          </div>

          {review.featured && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-violet-50 p-4 text-sm font-bold text-violet-700">
              <Sparkles size={17} />
              هذه المراجعة مميزة ويمكن استخدامها في قسم التقييمات المميزة بالمتجر.
            </div>
          )}

        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 p-5 sm:flex-row">

          {review.status !==
            "approved" && (
            <button
              type="button"
              onClick={
                onApprove
              }
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-black text-white hover:bg-emerald-700"
            >
              <CheckCircle2
                size={16}
              />
              اعتماد
            </button>
          )}

          {review.status !==
            "hidden" && (
            <button
              type="button"
              onClick={
                onHide
              }
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-black text-slate-600 hover:bg-slate-100"
            >
              <EyeOff
                size={16}
              />
              إخفاء
            </button>
          )}

          <button
            type="button"
            onClick={
              onFeature
            }
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-violet-100 bg-violet-50 py-3 text-sm font-black text-violet-700 hover:bg-violet-100"
          >
            <Sparkles
              size={16}
            />
            {review.featured
              ? "إلغاء التمييز"
              : "تمييز"}
          </button>

          <button
            type="button"
            onClick={
              onDelete
            }
            className="rounded-xl border border-red-100 bg-white px-5 py-3 text-sm font-black text-red-500 hover:bg-red-50"
          >
            <Trash2
              size={16}
            />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-blue-700 px-6 py-3 text-sm font-black text-white hover:bg-blue-800"
          >
            إغلاق
          </button>

        </div>

      </div>
    </div>
  );
}

/* =========================
   DELETE
========================= */

function DeleteModal({
  review,
  onClose,
  onConfirm,
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">

      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
          <Trash2 size={21} />
        </div>

        <h2 className="mt-4 text-lg font-black text-slate-900">
          حذف المراجعة؟
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          سيتم حذف مراجعة{" "}
          <strong className="text-slate-800">
            {review.customerName ||
              "العميل"}
          </strong>{" "}
          نهائيًا من النظام.
        </p>

        <div className="mt-6 flex gap-3">

          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
          >
            إلغاء
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-black text-white hover:bg-red-700"
          >
            حذف المراجعة
          </button>

        </div>

      </div>
    </div>
  );
}

/* =========================
   COMPONENTS
========================= */

function SummaryCard({
  icon: Icon,
  title,
  value,
  accent = "blue",
}) {
  const colors = {
    blue:
      "bg-blue-50 text-blue-700",

    orange:
      "bg-orange-50 text-orange-600",

    green:
      "bg-emerald-50 text-emerald-600",

    purple:
      "bg-violet-50 text-violet-600",

    gold:
      "bg-amber-50 text-amber-600",
  };

  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div>
        <p className="text-sm font-semibold text-slate-500">
          {title}
        </p>

        <p className="mt-2 text-2xl font-black text-slate-900">
          {value}
        </p>
      </div>

      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${
          colors[accent]
        }`}
      >
        <Icon size={21} />
      </div>

    </div>
  );
}

function RatingBar({
  rating,
  count,
  percentage,
}) {
  return (
    <div>

      <div className="flex items-center justify-between text-xs">

        <div className="flex items-center gap-2">
          <span className="font-black text-slate-700">
            {rating}
          </span>

          <Star
            size={13}
            className="fill-amber-400 text-amber-400"
          />
        </div>

        <span className="font-bold text-slate-400">
          {count}
        </span>

      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-amber-400 transition-all"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>

    </div>
  );
}

function Stars({
  rating = 0,
  size = 16,
}) {
  const rounded =
    Math.round(
      Number(rating || 0)
    );

  return (
    <div className="flex items-center gap-0.5">

      {[1, 2, 3, 4, 5].map(
        (star) => (
          <Star
            key={star}
            size={size}
            className={
              star <= rounded
                ? "fill-amber-400 text-amber-400"
                : "text-slate-300"
            }
          />
        )
      )}

    </div>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">

      <div className="flex items-center gap-2">

        <Icon
          size={15}
          className="text-slate-400"
        />

        <p className="text-xs font-bold text-slate-400">
          {label}
        </p>

      </div>

      <div className="mt-2 text-sm font-black text-slate-800">
        {value}
      </div>

    </div>
  );
}

function formatDate(date) {
  if (!date) {
    return "—";
  }

  return new Date(
    date
  ).toLocaleString(
    "ar-EG",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
}

export default Reviews;