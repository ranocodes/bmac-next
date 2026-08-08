interface PaystackPopHandler {
  openIframe: () => void;
}

interface PaystackPopApi {
  setup: (options: Record<string, unknown>) => PaystackPopHandler;
}

interface PaystackPopWindow extends Window {
  PaystackPop?: PaystackPopApi;
}

export function loadPaystack(timeoutMs = 8000): Promise<PaystackPopApi> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Paystack only runs in the browser."));
      return;
    }
    const win = window as PaystackPopWindow;
    const tryResolve = () => {
      if (win.PaystackPop) {
        resolve(win.PaystackPop);
        return true;
      }
      return false;
    };
    if (tryResolve()) return;

    if (!document.querySelector('script[data-paystack-inline]')) {
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;
      script.dataset.paystackInline = "1";
      script.onerror = () => reject(new Error("Could not load the payment gateway. Please try again."));
      document.head.appendChild(script);
    }

    const started = Date.now();
    const timer = setInterval(() => {
      if (tryResolve()) {
        clearInterval(timer);
        return;
      }
      if (Date.now() - started > timeoutMs) {
        clearInterval(timer);
        reject(new Error("The payment gateway took too long to load. Check your connection and try again."));
      }
    }, 100);
  });
}
