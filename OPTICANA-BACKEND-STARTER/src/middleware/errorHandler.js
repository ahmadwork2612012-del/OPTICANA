export function notFoundHandler(
  req,
  res
) {
  res.status(404).json({
    success: false,

    error: {
      code:
        "NOT_FOUND",

      message:
        `Route not found: ${req.method} ${req.originalUrl}`,
    },
  });
}


export function errorHandler(
  error,
  req,
  res,
  next
) {
  console.error(error);

  const status = Number(error?.statusCode) || (
    error?.code === "P2025"
      ? 404
      : error?.code === "P2002" || error?.code === "P2003"
        ? 409
        : 500
  );


  const response = {
    success: false,

    error: {
      code: error?.code === "P2002"
        ? "DUPLICATE_RESOURCE"
        : error?.code === "P2003"
          ? "RELATION_CONSTRAINT"
          : error?.code || "INTERNAL_SERVER_ERROR",

      message:
        status >= 500 &&
        process.env.NODE_ENV ===
          "production"
          ? "An internal server error occurred."
          : error?.message ||
            "An unexpected error occurred.",
    },
  };


  /*
    Preserve structured validation
    details from Zod and other validators.
  */

  if (
    error?.details !==
    undefined
  ) {
    response.error.details =
      error.details;
  }


  /*
    Prisma errors should not leak
    internal database details in production.
  */

  if (
    status >= 500 &&
    process.env.NODE_ENV ===
      "production"
  ) {
    delete response.error.details;
  }


  res
    .status(status)
    .json(response);
}
