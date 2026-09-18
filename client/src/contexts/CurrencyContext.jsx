import { createContext, useContext, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/api/axios";

const CurrencyContext = createContext({
  currencySign: "$",
  formatPrice: (price) => `$${price}`,
  refreshCurrency: () => {},
});

const CURRENCY_QUERY_KEY = ["currency-sign"];

async function fetchCurrencySign() {
  const res = await api.get("/pharmacy/settings");
  return res.data?.data?.currencySign || "$";
}

export function CurrencyProvider({ children }) {
  const queryClient = useQueryClient();

  const { data: currencySign = localStorage.getItem("telemed_currency_sign") || "$", refetch } = useQuery({
    queryKey: CURRENCY_QUERY_KEY,
    queryFn: fetchCurrencySign,
    staleTime: Infinity,
  });

  useEffect(() => {
    localStorage.setItem("telemed_currency_sign", currencySign);
  }, [currencySign]);

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === "telemed_currency_sign" && e.newValue) {
        queryClient.setQueryData(CURRENCY_QUERY_KEY, e.newValue);
      }
    };

    const handleCustomUpdate = () => {
      refetch();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("currency-updated", handleCustomUpdate);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("currency-updated", handleCustomUpdate);
    };
  }, [queryClient, refetch]);

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
        refreshCurrency: refetch,
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
