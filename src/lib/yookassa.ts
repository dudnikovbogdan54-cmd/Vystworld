import { randomUUID } from "node:crypto";

const api = "https://api.yookassa.ru/v3";

function credentials() {
  const shop = process.env.YOOKASSA_SHOP_ID;
  const secret = process.env.YOOKASSA_SECRET_KEY;
  if (!shop || !secret) throw new Error("YooKassa is not configured.");
  return "Basic " + Buffer.from(`${shop}:${secret}`).toString("base64");
}

export async function createYooKassaPayment(input: {
  amount: number; orderId: string; description: string; returnUrl: string;
}) {
  const response = await fetch(`${api}/payments`, {
    method: "POST",
    headers: {
      Authorization: credentials(),
      "Content-Type": "application/json",
      "Idempotence-Key": randomUUID()
    },
    body: JSON.stringify({
      amount: { value: input.amount.toFixed(2), currency: "RUB" },
      capture: true,
      confirmation: { type: "redirect", return_url: input.returnUrl },
      description: input.description.slice(0, 128),
      metadata: { order_id: input.orderId }
    }),
    cache: "no-store"
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`YooKassa payment creation failed (${response.status}).`);
  return data as { id: string; status: string; confirmation?: { confirmation_url?: string } };
}

export async function getYooKassaPayment(paymentId: string) {
  const response = await fetch(`${api}/payments/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: credentials() }, cache: "no-store"
  });
  if (!response.ok) throw new Error(`Could not verify payment (${response.status}).`);
  return await response.json() as {
    id: string; status: string; paid: boolean;
    amount?: { value?: string; currency?: string };
    metadata?: { order_id?: string };
  };
}
