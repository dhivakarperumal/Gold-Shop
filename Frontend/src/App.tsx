import { Outlet } from "react-router-dom";
import Navbar from "./components/CommonComponents/Navbar";
import Header from "./components/CommonComponents/Header";
import Footer from "./components/CommonComponents/Footer";

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <Header />
      <main className="mt-26 flex-1 overflow-x-hidden">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default App;
