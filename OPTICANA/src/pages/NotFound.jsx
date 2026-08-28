import {
  ArrowRight,
  Home,
  SearchX,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import {
  motion,
} from "framer-motion";


function NotFound() {
  return (
    <main className="min-h-[75vh] overflow-hidden bg-[#fbfcfa] text-[#20251f]">

      <section className="relative flex min-h-[75vh] items-center justify-center px-6 py-20">

        {/* DECORATION */}

        <div className="pointer-events-none absolute -right-32 top-10 h-80 w-80 rounded-full bg-[#dce6d8]/70 blur-3xl" />

        <div className="pointer-events-none absolute -left-28 bottom-0 h-72 w-72 rounded-full bg-[#eef1df]/80 blur-3xl" />


        <motion.div
          initial={{
            opacity: 0,
            y: 25,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.6,
          }}
          className="relative w-full max-w-2xl text-center"
        >

          {/* ICON */}

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-[#eef2eb] text-[#657361] shadow-sm">

            <SearchX
              size={36}
            />

          </div>


          {/* 404 */}

          <p className="mt-8 text-8xl font-black leading-none tracking-tight text-[#2f382c] sm:text-9xl">
            404
          </p>


          <h1 className="mt-5 text-3xl font-black text-[#263024] sm:text-4xl">
            الصفحة غير موجودة
          </h1>


          <p className="mx-auto mt-4 max-w-lg text-sm leading-8 text-[#7a8578] sm:text-base">
            يبدو أن الرابط الذي وصلت إليه غير موجود أو تم نقل الصفحة من مكانها.
          </p>


          {/* ACTIONS */}

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">

            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl bg-[#2f382c] px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-[#2f382c]/10 transition hover:-translate-y-0.5 hover:bg-[#3c4838]"
            >
              <Home
                size={18}
              />

              الرئيسية
            </Link>


            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-xl border border-[#d4ded1] bg-white px-6 py-3.5 text-sm font-black text-[#4c5949] transition hover:-translate-y-0.5 hover:border-[#B4C4AD] hover:bg-[#f1f4ee]"
            >
              تصفح المنتجات

              <ArrowRight
                size={17}
              />

            </Link>

          </div>


          {/* BRAND */}

          <div className="mt-12">

            <p className="text-sm font-black tracking-[0.08em] text-[#3d4939]">
              OPTICANA
            </p>

            <p className="mt-1 text-xs font-bold text-[#8b9588]">
              عيونك أحلى معانا
            </p>

          </div>

        </motion.div>

      </section>

    </main>
  );
}


export default NotFound;