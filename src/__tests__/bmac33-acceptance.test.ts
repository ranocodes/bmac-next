import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import crypto from "crypto";

const mockQuery = vi.fn();
const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockGetById = vi.fn();
const mockRequirePermission = vi.fn();
const mockRequireAdmin = vi.fn();
const mockLog = vi.fn();
const mockFindOrCreate = vi.fn();
const mockEnsureRoles = vi.fn();
const mockUpsertRecord = vi.fn();
const mockCreateNotification = vi.fn();
const mockSendWorkflowEmail = vi.fn();
const mockCreateTicket = vi.fn();
const mockReserveCapacity = vi.fn();
const mockCheckInTicket = vi.fn();
const mockPassUrlFor = vi.fn();
const mockGetSuperAdminEmails = vi.fn();
const mockEmailSuperAdmins = vi.fn();
const mockSendRegistrationConfirmed = vi.fn();
const mockSendTicketReceipt = vi.fn();
const mockSendDonationThanks = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    query: (...args: unknown[]) => mockQuery(...args),
    create: (...args: unknown[]) => mockCreate(...args),
    update: (...args: unknown[]) => mockUpdate(...args),
    getById: (...args: unknown[]) => mockGetById(...args),
  },
}));
vi.mock("@/lib/auth/server", () => ({
  requirePermission: (...args: unknown[]) => mockRequirePermission(...args),
  requireAdmin: (...args: unknown[]) => mockRequireAdmin(...args),
}));
vi.mock("@/lib/activity-log", () => ({
  logActivity: (...args: unknown[]) => mockLog(...args),
}));
vi.mock("@/lib/people", () => ({
  findOrCreatePerson: (...args: unknown[]) => mockFindOrCreate(...args),
  ensurePersonRoles: (...args: unknown[]) => mockEnsureRoles(...args),
  upsertPersonRecord: (...args: unknown[]) => mockUpsertRecord(...args),
}));
vi.mock("@/lib/notifications", () => ({
  createAdminNotification: (...args: unknown[]) => mockCreateNotification(...args),
  getSuperAdminEmails: (...args: unknown[]) => mockGetSuperAdminEmails(...args),
  emailSuperAdmins: (...args: unknown[]) => mockEmailSuperAdmins(...args),
}));
vi.mock("@/actions/emails", () => ({
  sendWorkflowEmail: (...args: unknown[]) => mockSendWorkflowEmail(...args),
}));
vi.mock("@/lib/tickets", () => ({
  createTicket: (...args: unknown[]) => mockCreateTicket(...args),
  reserveCapacity: (...args: unknown[]) => mockReserveCapacity(...args),
  releaseCapacity: vi.fn(),
  passUrlFor: (...args: unknown[]) => mockPassUrlFor(...args),
  checkInTicket: (...args: unknown[]) => mockCheckInTicket(...args),
}));
vi.mock("@/lib/email", () => ({
  sendRegistrationConfirmedEmail: (...args: unknown[]) => mockSendRegistrationConfirmed(...args),
  sendEventReminderEmail: vi.fn(),
  sendRegistrationAlertEmail: vi.fn(),
  sendCheckInAlertEmail: vi.fn(),
  sendTicketReceiptEmail: (...args: unknown[]) => mockSendTicketReceipt(...args),
  sendTicketAlertEmail: vi.fn(),
  sendDonationThanksEmail: (...args: unknown[]) => mockSendDonationThanks(...args),
  sendDonationAlertEmail: vi.fn(),
}));

const admin = { email: "boss@x.com", firstName: "Boss", role: "super_admin", permissions: [] };

describe("BMAC-33 acceptance: free event registration → pass → check-in", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("registers a free event, issues a pass URL, then checks the attendee in", async () => {
    const { registerForEvent } = await import("@/actions/events");
    mockQuery
      .mockResolvedValueOnce([{
        id: "ev-1", title: "BMAC Monthly Meetup", date: "2026-09-01", venue: "Jos", time: "4:00 PM",
        category: "community", description: "", long_desc: "", is_paid: false, price: 0,
        capacity: 100, capacity_used: 0, registration_deadline: null, max_per_person: 1,
        allow_public_registration: true, reminders_enabled: false, status: "published",
      }])
      .mockResolvedValueOnce([]);
    mockReserveCapacity.mockResolvedValueOnce(1);
    mockFindOrCreate.mockResolvedValueOnce({ id: "p-1" });
    mockCreateTicket.mockResolvedValueOnce({
      id: "t-1", reference: "REF-1", qr_token: "tok-1", event_id: "ev-1", quantity: 1,
    });
    mockPassUrlFor.mockReturnValue("/pass/tok-1");

    const res = await registerForEvent({ eventId: "ev-1", name: "Jane Doe", email: "jane@x.com", consent: true });

    expect(res.error).toBeUndefined();
    expect(res.passUrl).toBe("/pass/tok-1");
    expect(res.reference).toBe("REF-1");
    expect(mockCreateTicket).toHaveBeenCalledWith(expect.objectContaining({ status: "confirmed" }));

    const { checkInAttendee } = await import("@/actions/events");
    mockRequirePermission.mockResolvedValueOnce(admin);
    mockCheckInTicket.mockResolvedValueOnce({ checkedIn: true, attendeeName: "Jane Doe", eventTitle: "BMAC Monthly Meetup" });

    const result = await checkInAttendee({ token: "tok-1" });

    expect(result.result?.checkedIn).toBe(true);
    expect(mockCheckInTicket).toHaveBeenCalledWith({ token: "tok-1" });
    expect(mockLog).toHaveBeenCalledWith(admin.email, "check_in", "event_tickets", expect.anything());
  });

  it("flags a second scan as already checked in", async () => {
    const { checkInAttendee } = await import("@/actions/events");
    mockRequirePermission.mockResolvedValueOnce(admin);
    mockCheckInTicket.mockResolvedValueOnce({ alreadyCheckedIn: true, attendeeName: "Jane Doe", eventTitle: "BMAC Monthly Meetup" });

    const result = await checkInAttendee({ token: "tok-1" });

    expect(result.result?.alreadyCheckedIn).toBe(true);
    expect(mockLog).toHaveBeenCalledWith(admin.email, "check_in", "event_tickets", expect.anything());
  });

  it("blocks check-in server-side without check_in_attendees permission", async () => {
    const { checkInAttendee } = await import("@/actions/events");
    mockRequirePermission.mockRejectedValueOnce(new Error("Forbidden: insufficient permissions"));

    await expect(checkInAttendee({ token: "tok-1" })).rejects.toThrow("Forbidden");
    expect(mockCheckInTicket).not.toHaveBeenCalled();
  });
});

describe("BMAC-33 acceptance: paid event webhook confirms ticket + pass", () => {
  const PAYSTACK_SECRET = "test-secret-key";
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv("PAYSTACK_SECRET_KEY", PAYSTACK_SECRET);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  function signPayload(body: string): string {
    return crypto.createHmac("sha512", PAYSTACK_SECRET).update(body).digest("hex");
  }

  async function postWebhook(payload: object) {
    const { POST } = await import("@/app/api/webhooks/paystack/route");
    const req = new Request("http://localhost:3000/api/webhooks/paystack", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-paystack-signature": signPayload(JSON.stringify(payload)) },
      body: JSON.stringify(payload),
    });
    return POST(req);
  }

  it("confirms a pending ticket and sends a pass-backed receipt", async () => {
    mockSendTicketReceipt.mockResolvedValue({});
    mockQuery
      .mockResolvedValueOnce([]) // dedup
      .mockResolvedValueOnce([{
        id: "t-1", event_id: "ev-1", reference: "REF-PAID", qr_token: "tok-paid",
        payer_name: "Jane Doe", payer_email: "jane@x.com", quantity: 1, status: "pending",
      }])
      .mockResolvedValueOnce([{ id: "t-1" }]) // confirm UPDATE RETURNING
      .mockResolvedValueOnce([]) // person_records completion
      .mockResolvedValueOnce([{ title: "BMAC Gala" }]) // event title
      .mockResolvedValueOnce([]); // workflow resolution

    const payload = {
      event: "charge.success",
      data: {
        reference: "REF-PAID",
        amount: 500000,
        currency: "NGN",
        customer: { email: "jane@x.com" },
        metadata: { source_type: "event_ticket", source_id: "ev-1", ticket_id: "t-1", payer_name: "Jane Doe" },
      },
    };

    const res = await postWebhook(payload);
    expect(res.status).toBe(200);

    const confirmCall = mockQuery.mock.calls.find(c => String(c[0]).includes("SET status = 'confirmed'"));
    expect(confirmCall).toBeTruthy();
    expect(mockSendTicketReceipt).toHaveBeenCalledWith(expect.objectContaining({
      reference: "REF-PAID",
      passUrl: expect.stringContaining("/pass/tok-paid"),
    }));
    expect(mockCreateNotification).toHaveBeenCalledWith(expect.objectContaining({ type: "ticket" }));
  });
});

describe("BMAC-33 acceptance: program apply → accept → cohort → attendance", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("accepts an application and adds the applicant to a cohort", async () => {
    const { updateApplicationStatus, createCohort, addParticipantToCohort } = await import("@/actions/programs");
    mockRequireAdmin.mockResolvedValue(admin);

    mockGetById
      .mockResolvedValueOnce({ id: "app-1", program_id: "prg-1", person_id: "p-1" }) // updateApplicationStatus app
      .mockResolvedValueOnce({ id: "p-1", email: "jane@x.com", first_name: "Jane", last_name: "Doe" }) // person
      .mockResolvedValueOnce({ id: "prg-1", title: "Code Camp" }) // createCohort program
      .mockResolvedValueOnce({ id: "cohort-1", title: "Cohort 1", capacity: 20 }) // addParticipantToCohort cohort
      .mockResolvedValueOnce({ id: "p-1", email: "jane@x.com", first_name: "Jane", last_name: "Doe" }) // person again
      .mockResolvedValueOnce({ id: "cohort-1", title: "Cohort 1", capacity: 20, program_id: "prg-1" }); // cohort info
    mockQuery.mockResolvedValueOnce([]); // existing participant check
    mockQuery.mockResolvedValueOnce([{ count: "0" }]); // cohort participant count

    const statusRes = await updateApplicationStatus({ applicationId: "app-1", status: "accepted", adminEmail: admin.email });
    expect(statusRes.success).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith("program_applications", "app-1", expect.objectContaining({ status: "accepted" }));
    expect(mockLog).toHaveBeenCalledWith(admin.email, "program_application_status", "program_applications", expect.anything());

    const cohortRes = await createCohort({ programId: "prg-1", title: "Cohort 1", startDate: "2026-09-01", endDate: "2026-12-01", capacity: 20 });
    expect(cohortRes.error).toBeUndefined();
    expect(cohortRes.cohortId).toMatch(/^cohort-/);

    const addRes = await addParticipantToCohort({ cohortId: "cohort-1", personId: "p-1", applicationId: "app-1" });
    expect(addRes.success).toBe(true);
    expect(mockCreate).toHaveBeenCalledWith("participants", expect.objectContaining({ status: "enrolled" }));
    expect(mockSendWorkflowEmail).toHaveBeenCalledWith("program", "jane@x.com", expect.anything(), expect.objectContaining({ action: "accepted" }));
  });

  it("records attendance and summarises per-person rates", async () => {
    const { recordAttendance, getCohortAttendanceSummary } = await import("@/actions/programs");
    mockRequireAdmin.mockResolvedValue(admin);
    mockGetById.mockResolvedValueOnce({ id: "cohort-1" });
    mockQuery.mockResolvedValueOnce([]); // existing attendance check

    const rec = await recordAttendance({ cohortId: "cohort-1", personId: "p-1", sessionDate: "2026-09-01", present: true, markedBy: admin.email });
    expect(rec.success).toBe(true);
    expect(mockCreate).toHaveBeenCalledWith("attendance_records", expect.objectContaining({ present: true }));

    mockQuery.mockResolvedValueOnce([{
      person_id: "p-1", first_name: "Jane", last_name: "Doe", email: "jane@x.com", present: 2, total: 3,
    }]);
    const summary = await getCohortAttendanceSummary("cohort-1");
    expect(summary[0]).toMatchObject({ personId: "p-1", present: 2, total: 3, attendanceRate: 67 });
  });

  it("returns [] when program admin actions lack permission", async () => {
    const { getCohortAttendanceSummary } = await import("@/actions/programs");
    mockRequireAdmin.mockRejectedValueOnce(new Error("Forbidden"));

    const summary = await getCohortAttendanceSummary("cohort-1");
    expect(summary).toEqual([]);
  });
});

describe("BMAC-33 acceptance: donation pending → verified by webhook", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("creates a pending donation record before checkout", async () => {
    const { createPendingDonation } = await import("@/actions/donations");
    mockFindOrCreate.mockResolvedValueOnce({ id: "p-1" });
    mockUpsertRecord.mockResolvedValueOnce({ id: "rec-1" });

    const res = await createPendingDonation({ name: "Jane Doe", email: "jane@x.com", amount: 5000, reference: "REF-DON" });

    expect(res.error).toBeUndefined();
    expect(res.donation).toEqual({ personId: "p-1", recordId: "rec-1", reference: "REF-DON" });
    expect(mockUpsertRecord).toHaveBeenCalledWith("p-1", "donation", expect.objectContaining({
      refId: "REF-DON", status: "pending", meta: expect.objectContaining({ amount: 5000 }),
    }));
    expect(mockLog).toHaveBeenCalledWith("system", "donation_initiated", "person_records", expect.anything());
  });

  it("webhook marks the pending donation completed and sends a thank-you", async () => {
    const PAYSTACK_SECRET = "test-secret-key";
    vi.stubEnv("PAYSTACK_SECRET_KEY", PAYSTACK_SECRET);
    mockQuery.mockResolvedValueOnce([]); // dedup
    mockQuery.mockResolvedValueOnce([{ meta: { amount: 5000, currency: "NGN" } }]); // expected amount
    mockQuery.mockResolvedValueOnce([{ id: "rec-1" }]); // pending → completed UPDATE
    mockFindOrCreate.mockResolvedValueOnce({ id: "p-1" });
    mockSendDonationThanks.mockResolvedValue({});
    mockGetSuperAdminEmails.mockResolvedValue([]);
    mockEmailSuperAdmins.mockResolvedValue(undefined);

    const payload = {
      event: "charge.success",
      data: {
        reference: "REF-DON",
        amount: 500000,
        currency: "NGN",
        customer: { email: "jane@x.com" },
        metadata: { source_type: "donation", source_id: "get-involved", payer_name: "Jane Doe" },
      },
    };
    const signature = crypto.createHmac("sha512", PAYSTACK_SECRET).update(JSON.stringify(payload)).digest("hex");
    const { POST } = await import("@/app/api/webhooks/paystack/route");
    const req = new Request("http://localhost:3000/api/webhooks/paystack", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-paystack-signature": signature },
      body: JSON.stringify(payload),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const completeCall = mockQuery.mock.calls.find(c => String(c[0]).includes("jsonb_set"));
    expect(completeCall).toBeTruthy();
    expect(completeCall?.[1]).toContain("REF-DON");
    expect(mockSendDonationThanks).toHaveBeenCalledWith(expect.objectContaining({
      email: "jane@x.com", reference: "REF-DON", amountLabel: "₦5,000",
    }));
    expect(mockCreateNotification).toHaveBeenCalledWith(expect.objectContaining({ type: "donation" }));
    vi.unstubAllEnvs();
  });
});

describe("BMAC-33 acceptance: analytics + donation exports are permission-gated", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns 403 from the analytics API when permission is missing", async () => {
    mockRequirePermission.mockRejectedValueOnce(new Error("Forbidden"));
    const { GET } = await import("@/app/api/admin/analytics/route");

    const res = await GET();
    expect(res.status).toBe(403);
  });

  it("returns 200 from the analytics API with permission", async () => {
    mockRequirePermission.mockResolvedValueOnce(admin);
    mockQuery
      .mockResolvedValueOnce([]) // ticket stats
      .mockResolvedValueOnce([{ total: "0" }]) // event revenue
      .mockResolvedValueOnce([{ total: "0", count: "0" }]) // donation totals
      .mockResolvedValueOnce([]) // donation byStatus
      .mockResolvedValueOnce([{ count: "0" }]) // applications
      .mockResolvedValueOnce([{ count: "0" }]) // checked in
      .mockResolvedValueOnce([{ count: "0" }]) // participants
      .mockResolvedValueOnce([]) // applications by status
      .mockResolvedValueOnce([{ count: "0" }]) // overview: total views
      .mockResolvedValueOnce([{ count: "0" }]) // overview: unique visitors
      .mockResolvedValueOnce([{ count: "0" }]) // overview: today views
      .mockResolvedValueOnce([{ count: "1" }]) // overview: distinct days
      .mockResolvedValueOnce([]) // daily views series
      .mockResolvedValueOnce([]) // top pages
      .mockResolvedValueOnce([]) // referrers
      .mockResolvedValueOnce([]) // devices
      .mockResolvedValueOnce([]) // conversions: event counts
      .mockResolvedValueOnce([{ count: "0" }]); // conversions: page views
    const { GET } = await import("@/app/api/admin/analytics/route");

    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.operational.tickets).toBeDefined();
    expect(json.operational.programs).toBeDefined();
    expect(json.traffic.overview).toEqual({ totalViews: 0, uniqueVisitors: 0, todayViews: 0, avgDailyViews: 0 });
    expect(json.conversions.funnel).toHaveLength(3);
  });

  it("blocks event admin detail without manage_events", async () => {
    mockRequirePermission.mockRejectedValueOnce(new Error("Forbidden"));
    const { getEventAdminDetail } = await import("@/actions/events");

    await expect(getEventAdminDetail("ev-1")).rejects.toThrow("Forbidden");
    expect(mockQuery).not.toHaveBeenCalled();
  });
});
