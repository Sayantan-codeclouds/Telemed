import AppRoutes from "./routes/AppRoutes";
import { CurrencyProvider } from "./contexts/CurrencyProvider";

function App() {
  return (
    <CurrencyProvider>
      <AppRoutes />
    </CurrencyProvider>
  );
}

export default App;