import { Outlet } from "react-router-dom";
import Navbar from "./components/CommonComponents/Navbar";
import Header from "./components/CommonComponents/Header";
import Footer from "./components/CommonComponents/Footer";
import { StoreCartProvider } from "./context/StoreCartProvider";

function App() {
  return (
    <StoreCartProvider>
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <Header />
        <main className="flex-1 mt-26 overflow-hidden">
          <Outlet />
        </main>
        <Footer />
      </div>
    </StoreCartProvider>
  );
}

export default App;
