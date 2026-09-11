import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "@/api/axios";

const CurrencyContext = createContext({
  currencySign: "$",
  formatPrice: (price) => `$${price}`,
  refreshCurrency: () => {},
});

export function CurrencyProvider({ children }) {
  const [currencySign, setCurrencySign] = useState(() => {
    return localStorage.getItem("telemed_currency_sign") || "$";
  });

  const fetchCurrency = useCallback(async () => {
    try {
      const res = await api.get("/pharmacy/settings");
      const sign = res.data?.data?.currencySign || "$";
      setCurrencySign(sign);
      localStorage.setItem("telemed_currency_sign", sign);
    } catch (_) {
      // Keep existing cached currency
    }
  }, []);

  useEffect(() => {
    fetchCurrency();

    const handleStorage = (e) => {
      if (e.key === "telemed_currency_sign" && e.newValue) {
        setCurrencySign(e.newValue);
      }
    };

    const handleCustomUpdate = () => {
      fetchCurrency();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("currency-updated", handleCustomUpdate);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("currency-updated", handleCustomUpdate);
    };
  }, [fetchCurrency]);

  const formatPrice = useCallback(
    (amount, decimals = 0) => {
      const num = Number(amount) || 0;
      if (decimals > 0) {
        return `${currencySign}${num.toFixed(decimals)}`;
      }
      return `${currencySign}${num.toLocaleString()}`;
    },
    [currencySign]
  );

  return (
    <CurrencyContext.Provider
      value={{
        currencySign,
        formatPrice,
        refreshCurrency: fetchCurrency,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

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
