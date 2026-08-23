/** Loads the Cashfree Checkout SDK and opens the hosted payment page. */
type CashfreeSdk = (opts: { mode: "sandbox" | "production" }) => {
  checkout: (opts: { paymentSessionId: string; redirectTarget?: string }) => Promise<unknown>;
};

declare global {
  interface Window {
    Cashfree?: CashfreeSdk;
  }
}

let loader: Promise<CashfreeSdk> | null = null;

function loadSdk(): Promise<CashfreeSdk> {
  if (typeof window === "undefined") return Promise.reject(new Error("Browser only"));
  if (window.Cashfree) return Promise.resolve(window.Cashfree);
  if (loader) return loader;

  loader = new Promise<CashfreeSdk>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.async = true;
    script.onload = () =>
      window.Cashfree ? resolve(window.Cashfree) : reject(new Error("Cashfree SDK unavailable"));
    script.onerror = () => reject(new Error("Could not load the payment gateway"));
    document.head.appendChild(script);
  });
  return loader;
}

export async function openCashfreeCheckout(paymentSessionId: string, mode: "sandbox" | "production") {
  const Cashfree = await loadSdk();
  await Cashfree({ mode }).checkout({ paymentSessionId, redirectTarget: "_self" });
}
