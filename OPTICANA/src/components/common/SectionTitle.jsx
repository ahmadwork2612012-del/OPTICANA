function SectionTitle({
  title,
  description,
  center = true,
  size = "large",
}) {
  const titleSize =
    size === "small"
      ? "text-3xl"
      : size === "medium"
      ? "text-4xl"
      : "text-5xl";

  return (
    <div className={center ? "text-center" : ""}>
      <h2 className={`${titleSize} font-black`}>
        {title}
      </h2>

      {description && (
        <p className="mt-4 text-gray-500">
          {description}
        </p>
      )}
    </div>
  );
}

export default SectionTitle;