import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import AppRouter from "./routes/AppRouter";

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
        }}
      />

      <AppRouter />
    </BrowserRouter>
  );
}

export default App;