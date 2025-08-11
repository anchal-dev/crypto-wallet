import { useWallet } from './context/WalletContext.jsx';
import Login from './components/Login.jsx';
import WalletDashboard from './components/WalletDashboard.jsx';

function App() {
  const { wallet, loading } = useWallet();

  const LoadingSpinner = () => (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex justify-center items-center">
      <div className="text-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-purple-200 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-pink-300 border-t-transparent rounded-full animate-spin animate-reverse mx-auto mt-2 ml-2"></div>
        </div>
        <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Initializing Wallet...
        </div>
        <div className="text-purple-300 mt-2 animate-pulse">
          Securing your digital assets
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
      <div className="min-h-screen backdrop-blur-sm bg-white/5">
        <div className="container mx-auto p-4 md:p-8">
          {loading ? <LoadingSpinner /> : wallet ? <WalletDashboard /> : <Login />}
        </div>
      </div>
    </div>
  );
}

export default App;