import {
  Loader2,
  Eye,
} from "lucide-react";


function Loading({
  label = "جاري التحميل...",
  fullScreen = true,
}) {
  const content = (
    <div className="flex flex-col items-center justify-center px-6 text-center">

      {/* Logo mark */}

      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-[#B4C4AD] text-[#263024] shadow-sm">

        <Eye
          size={28}
          strokeWidth={2.4}
        />

        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[#52604e] ring-4 ring-white" />

      </div>


      {/* Spinner */}

      <div className="mt-6 flex items-center justify-center">

        <Loader2
          size={22}
          className="animate-spin text-[#596655]"
        />

      </div>


      {/* Text */}

      <p className="mt-4 text-sm font-black text-[#4f5d4c]">
        {label}
      </p>


      <p className="mt-1 text-[11px] font-bold text-[#9aa398]">
        OPTICANA
      </p>

    </div>
  );


  if (!fullScreen) {
    return (
      <div className="py-16">
        {content}
      </div>
    );
  }


  return (
    <div className="flex min-h-[65vh] items-center justify-center bg-[#fbfcfa]">
      {content}
    </div>
  );
}


export default Loading;