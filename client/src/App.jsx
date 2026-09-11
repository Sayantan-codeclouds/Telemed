import AppRoutes from "./routes/AppRoutes";
import { CurrencyProvider } from "./contexts/CurrencyContext";

function App() {
  return (
    <CurrencyProvider>
      <AppRoutes />
    </CurrencyProvider>
  );
}

export default App;