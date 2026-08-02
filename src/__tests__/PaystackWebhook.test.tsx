import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
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
  return postRaw(JSON.stringify(payload), signature);
}

async function postRaw(body: string, signature?: string) {
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
      source_type: "event_registration",
      source_id: "event-1",
      payer_name: "Test User",
    }));
    const paymentArgs = mockCreate.mock.calls.find(c => c[0] === "paystack_payments")?.[1];
    expect(paymentArgs?.id).toMatch(/^pay-/);
    expect(paymentArgs?.id).not.toContain("NaN");
    expect(mockCreate).toHaveBeenCalledWith("activity_logs", expect.objectContaining({
      action: "payment_verified",
    }));
  });

  it("stores unknown source when metadata lacks source_type/source_id", async () => {
    mockQuery.mockResolvedValue([]);
    mockCreate.mockResolvedValue({ id: "pay-456" });

    const payload = {
      event: "charge.success",
      data: {
        reference: "BMAC-TEST-003",
        amount: 100000,
        currency: "NGN",
        customer: { email: "no-meta@example.com" },
        metadata: {},
      },
    };

    const signature = signPayload(JSON.stringify(payload));
    const res = await postWebhook(payload, signature);
    expect(res.status).toBe(200);

    expect(mockCreate).toHaveBeenCalledWith("paystack_payments", expect.objectContaining({
      source_type: "unknown",
      source_id: "",
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

  it("returns 401 when PAYSTACK_SECRET_KEY is unset", async () => {
    vi.stubEnv("PAYSTACK_SECRET_KEY", "");
    const res = await postWebhook({ event: "charge.success" });
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("Unauthorized");
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("rejects on malformed JSON body", async () => {
    const body = "not-json{";
    const signature = signPayload(body);
    // Route has no try/catch around JSON.parse; prod surfaces a 500.
    await expect(postRaw(body, signature)).rejects.toThrow();
  });

  it("rejects when dedup query fails", async () => {
    mockQuery.mockRejectedValue(new Error("db down"));

    const payload = {
      event: "charge.success",
      data: {
        reference: "BMAC-TEST-004",
        amount: 500000,
        currency: "NGN",
        customer: { email: "db-down@example.com" },
        metadata: { source_type: "donation", source_id: "don-2" },
      },
    };

    const signature = signPayload(JSON.stringify(payload));
    await expect(postWebhook(payload, signature)).rejects.toThrow("db down");
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("defaults currency and stamps verified_at", async () => {
    mockQuery.mockResolvedValue([]);
    mockCreate.mockResolvedValue({ id: "pay-789" });

    const payload = {
      event: "charge.success",
      data: {
        reference: "BMAC-TEST-005",
        amount: 75000,
        customer: { email: "default-currency@example.com" },
        metadata: { source_type: "donation", source_id: "don-3" },
      },
    };

    const signature = signPayload(JSON.stringify(payload));
    const res = await postWebhook(payload, signature);
    expect(res.status).toBe(200);

    expect(mockCreate).toHaveBeenCalledWith("paystack_payments", expect.objectContaining({
      currency: "NGN",
    }));
    const paymentArgs = mockCreate.mock.calls.find(c => c[0] === "paystack_payments")?.[1];
    expect(paymentArgs?.metadata?.verified_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });
});
