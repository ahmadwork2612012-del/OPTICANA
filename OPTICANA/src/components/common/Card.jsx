function Card({
  children,
  className = "",
}) {
  return (
    <div
      className={`rounded-3xl border border-gray-200 bg-white shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export default Card;