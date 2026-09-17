import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialFilters = {
  category: "الكل",
  color: "الكل",
  material: "الكل",
  size: "الكل",
  minPrice: "",
  maxPrice: "",
};

const useSearchStore = create(
  persist(
    (set) => ({
      filters: initialFilters,

      searchOpen: false,

      setFilters: (filters) =>
        set({
          filters,
        }),

      setCategory: (category) =>
        set((state) => ({
          filters: {
            ...state.filters,
            category,
          },
        })),

      openSearch: () =>
        set({
          searchOpen: true,
        }),

      closeSearch: () =>
        set({
          searchOpen: false,
        }),

      resetFilters: () =>
        set({
          filters: initialFilters,
          searchOpen: false,
        }),
    }),

    {
      name: "opticana-search",

      partialize: (state) => ({
        filters: state.filters,
      }),
    }
  )
);

export default useSearchStore;