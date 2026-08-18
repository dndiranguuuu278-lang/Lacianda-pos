import { EventEmitter } from "events";

export type PaymentEvent = {
  checkoutId: string;
  status: "pending" | "success" | "failed";
  mpesaReceipt?: string;
  resultCode?: number;
  resultDesc?: string;
  saleId?: string;
};

class PaymentEventBus extends EventEmitter {
  emitPayment(event: PaymentEvent) {
    this.emit(`payment:${event.checkoutId}`, event);
    this.emit("payment", event);
  }

  subscribe(checkoutId: string, listener: (event: PaymentEvent) => void) {
    this.on(`payment:${checkoutId}`, listener);
    return () => this.off(`payment:${checkoutId}`, listener);
  }
}

declare global {
  // eslint-disable-next-line no-var
  var paymentEventBus: PaymentEventBus | undefined;
}

export const paymentEvents =
  global.paymentEventBus ?? new PaymentEventBus();

if (process.env.NODE_ENV !== "production") {
  global.paymentEventBus = paymentEvents;
}
