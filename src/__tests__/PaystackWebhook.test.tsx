import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "crypto";

const mockQuery = vi.fn();
const mockCreate = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    query: (...args: any[]) => mockQuery(...args),
    create: (...args: any[]) => mockCreate(...args),
  },
}));

const PAYSTACK_SECRET = "test-secret-key";
process.env.PAYSTACK_SECRET_KEY = PAYSTACK_SECRET;

function signPayload(body: string): string {
  return crypto.createHmac("sha512", PAYSTACK_SECRET).update(body).digest("hex");
}

async function postWebhook(payload: object, signature?: string) {
  const body = JSON.stringify(payload);
  const { POST } = await import("@/app/api/webhooks/paystack/route");
  const req = new Request("http://localhost:3000/api/webhooks/paystack", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(signature !== undefined ? { "x-paystack-signature": signature } : {}),
    },
    body,
  });
  return POST(req);
}

describe("Paystack Webhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when signature header is missing", async () => {
    const res = await postWebhook({ event: "charge.success" });
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("Unauthorized");
  });

  it("returns 401 when signature is invalid", async () => {
    const res = await postWebhook({ event: "charge.success" }, "bad-signature");
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("Invalid signature");
  });

  it("returns 200 and persists payment for valid charge.success", async () => {
    mockQuery.mockResolvedValue([]);
    mockCreate.mockResolvedValue({ id: "pay-123" });

    const payload = {
      event: "charge.success",
      data: {
        reference: "BMAC-TEST-001",
        amount: 500000,
        currency: "NGN",
        customer: { email: "test@example.com" },
        metadata: {
          source_type: "event_registration",
          source_id: "event-1",
          payer_name: "Test User",
        },
      },
    };

    const signature = signPayload(JSON.stringify(payload));
    const res = await postWebhook(payload, signature);
    expect(res.status).toBe(200);

    expect(mockQuery).toHaveBeenCalledWith(
      "SELECT id FROM public.paystack_payments WHERE reference = $1",
      ["BMAC-TEST-001"]
    );
    expect(mockCreate).toHaveBeenCalledWith("paystack_payments", expect.objectContaining({
      reference: "BMAC-TEST-001",
      status: "completed",
      payer_email: "test@example.com",
    }));
    expect(mockCreate).toHaveBeenCalledWith("activity_logs", expect.objectContaining({
      action: "payment_verified",
    }));
  });

  it("skips duplicate payment when reference already exists", async () => {
    mockQuery.mockResolvedValue([{ id: "pay-existing" }]);

    const payload = {
      event: "charge.success",
      data: {
        reference: "BMAC-TEST-002",
        amount: 250000,
        currency: "NGN",
        customer: { email: "dup@example.com" },
        metadata: { source_type: "donation", source_id: "don-1" },
      },
    };

    const signature = signPayload(JSON.stringify(payload));
    const res = await postWebhook(payload, signature);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe("already_processed");
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("ignores non-charge.success events", async () => {
    const payload = { event: "transfer.success", data: {} };
    const signature = signPayload(JSON.stringify(payload));
    const res = await postWebhook(payload, signature);
    expect(res.status).toBe(200);
    expect(mockQuery).not.toHaveBeenCalled();
    expect(mockCreate).not.toHaveBeenCalled();
  });
});
