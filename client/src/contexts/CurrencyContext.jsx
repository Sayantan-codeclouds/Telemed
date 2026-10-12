import { createContext, useContext } from "react";

// The provider lives in CurrencyProvider.jsx (a component-only module).
export const CurrencyContext = createContext({
  currencySign: "$",
  formatPrice: (price) => `$${price}`,
  refreshCurrency: () => {},
});

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    return {
      currencySign: "$",
      formatPrice: (amount) => `$${Number(amount) || 0}`,
      refreshCurrency: () => {},
    };
  }
  return context;
}
