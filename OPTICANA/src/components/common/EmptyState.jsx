function EmptyState({
  title,
  description,
}) {
  return (
    <div className="rounded-3xl border border-dashed border-gray-300 bg-slate-50 py-20 text-center">

      <h3 className="text-2xl font-bold">
        {title}
      </h3>

      {description && (
        <p className="mt-3 text-gray-500">
          {description}
        </p>
      )}

    </div>
  );
}

export default EmptyState;