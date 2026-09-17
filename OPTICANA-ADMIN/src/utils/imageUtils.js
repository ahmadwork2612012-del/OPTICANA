export const fileToDataUrl = (
  file
) => {
  return new Promise(
    (resolve, reject) => {
      if (!file) {
        reject(
          new Error(
            "لم يتم اختيار ملف"
          )
        );

        return;
      }

      if (
        !file.type?.startsWith(
          "image/"
        )
      ) {
        reject(
          new Error(
            "الملف المختار ليس صورة"
          )
        );

        return;
      }

      const maxSize =
        5 * 1024 * 1024;

      if (file.size > maxSize) {
        reject(
          new Error(
            "حجم الصورة يجب ألا يتجاوز 5MB"
          )
        );

        return;
      }

      const reader =
        new FileReader();

      reader.onload = () => {
        resolve(
          reader.result
        );
      };

      reader.onerror = () => {
        reject(
          new Error(
            "تعذر قراءة الصورة"
          )
        );
      };

      reader.readAsDataURL(
        file
      );
    }
  );
};