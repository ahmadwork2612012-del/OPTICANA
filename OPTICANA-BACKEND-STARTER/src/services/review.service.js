import prisma from "../lib/prisma.js";

async function refreshProductRating(tx, productId) {
  const summary = await tx.review.aggregate({
    where: { productId, status: "APPROVED" },
    _avg: { rating: true },
    _count: { _all: true },
  });
  await tx.product.update({
    where: { id: productId },
    data: { rating: summary._avg.rating || 0, ratingCount: summary._count._all },
  });
}


function serializeReview(review) {
  if (!review) {
    return null;
  }

  return {
    id: review.id,
    productId: review.productId,
    rating: review.rating,
    comment: review.comment || "",
    status: review.status,
    featured: review.featured === true,
    customer: review.customer
      ? { id: review.customer.id, name: review.customer.name }
      : null,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
  };
}


/* =====================================
   PUBLIC: SUBMIT REVIEW (goes to PENDING)
===================================== */

export async function submitReview({ productId, rating, comment }) {
  const review = await prisma.$transaction(async (tx) => {
    const created = await tx.review.create({
      data: {
        productId,
        rating,
        comment: comment || null,
        status: "PENDING",
      },
    });
    await tx.notification.create({
      data: {
        title: "مراجعة جديدة",
        message: "تم استلام مراجعة جديدة وتنتظر الموافقة",
        type: "review",
        entityType: "review",
        entityId: created.id,
        source: "system",
      },
    });
    return created;
  });

  return serializeReview(review);
}


/* =====================================
   PUBLIC: GET APPROVED REVIEWS FOR A PRODUCT
===================================== */

export async function getApprovedReviews() {
  const reviews = await prisma.review.findMany({
    where: { status: "APPROVED" },
    include: { customer: { select: { id: true, name: true } }, product: { select: { id: true, name: true, sku: true } } },
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  return reviews.map((review) => ({
    ...serializeReview(review),
    product: review.product
      ? { id: review.product.id, name: review.product.name, sku: review.product.sku }
      : null,
  }));
}


export async function getApprovedReviewsForProduct(productId) {
  const reviews = await prisma.review.findMany({
    where: { productId, status: "APPROVED" },
    include: { customer: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return reviews.map(serializeReview);
}


/* =====================================
   ADMIN: LIST ALL / UPDATE STATUS / DELETE
===================================== */

export async function listAllReviews() {
  const reviews = await prisma.review.findMany({
    include: {
      customer: { select: { id: true, name: true } },
      product: { select: { id: true, name: true, sku: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return reviews.map((review) => ({
    ...serializeReview(review),
    product: review.product
      ? { id: review.product.id, name: review.product.name, sku: review.product.sku }
      : null,
  }));
}

export async function updateReviewStatus(id, status, approvedById, featured) {
  const review = await prisma.$transaction(async (tx) => {
    const updated = await tx.review.update({
      where: { id },
      data: {
        status,
        approvedById: status === "APPROVED" ? (approvedById || null) : null,
        ...(featured === undefined ? {} : { featured: Boolean(featured) }),
      },
      include: { customer: { select: { id: true, name: true } } },
    });
    await refreshProductRating(tx, updated.productId);
    return updated;
  });

  return serializeReview(review);
}

export async function deleteReview(id) {
  return prisma.$transaction(async (tx) => {
    const review = await tx.review.delete({ where: { id } });
    await refreshProductRating(tx, review.productId);
    return { id };
  });
}
