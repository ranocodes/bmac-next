import { describe, it, expect, vi, beforeEach } from "vitest";

const mockQuery = vi.fn();
const mockReserveCapacity = vi.fn();
const mockCreateTicket = vi.fn();
const mockFindOrCreatePerson = vi.fn();
const mockPassUrlFor = vi.fn();

vi.mock("@/lib/db", () => ({
  db: { query: (...args: unknown[]) => mockQuery(...args) },
}));
vi.mock("@/lib/auth/server", () => ({
  requirePermission: vi.fn(),
}));
vi.mock("@/actions/activity-logs", () => ({
  logActivity: vi.fn(),
}));
vi.mock("@/actions/people", () => ({
  findOrCreatePerson: (...args: unknown[]) => mockFindOrCreatePerson(...args),
  ensurePersonRoles: vi.fn(),
  upsertPersonRecord: vi.fn(),
}));
vi.mock("@/lib/tickets", () => ({
  createTicket: (...args: unknown[]) => mockCreateTicket(...args),
  reserveCapacity: (...args: unknown[]) => mockReserveCapacity(...args),
  releaseCapacity: vi.fn(),
  passUrlFor: (...args: unknown[]) => mockPassUrlFor(...args),
  checkInTicket: vi.fn(),
}));
vi.mock("@/lib/workflows", () => ({
  createWorkflowRecord: vi.fn(),
}));
vi.mock("@/lib/notifications", () => ({
  createAdminNotification: vi.fn(),
  getSuperAdminEmails: vi.fn(),
  emailSuperAdmins: vi.fn(),
}));
vi.mock("@/lib/email", () => ({
  sendRegistrationConfirmedEmail: vi.fn(),
  sendEventReminderEmail: vi.fn(),
  sendRegistrationAlertEmail: vi.fn(),
  sendCheckInAlertEmail: vi.fn(),
}));

import { registerForEvent } from "@/actions/events";

const baseRow = {
  id: "ev-1",
  title: "BMAC Monthly Meetup",
  date: "2026-09-01",
  venue: "Jos",
  time: "4:00 PM",
  category: "community",
  description: "",
  long_desc: "",
  is_paid: false,
  price: 0,
  capacity: 100,
  capacity_used: 0,
  registration_deadline: null,
  max_per_person: 1,
  allow_public_registration: true,
  reminders_enabled: false,
  status: "published",
};

const ticket = { id: "t-1", reference: "REF-1", qr_token: "tok-1", event_id: "ev-1", quantity: 1 };

describe("registerForEvent paid-event guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects paid events without consuming capacity or creating a ticket", async () => {
    mockQuery.mockResolvedValueOnce([{ ...baseRow, is_paid: true, price: 5000 }]);

    const res = await registerForEvent({
      eventId: "ev-1",
      name: "Jane Doe",
      email: "jane@example.com",
      consent: true,
    });

    expect(res.error).toContain("paid pass");
    expect(mockReserveCapacity).not.toHaveBeenCalled();
    expect(mockCreateTicket).not.toHaveBeenCalled();
    expect(mockFindOrCreatePerson).not.toHaveBeenCalled();
  });

  it("still registers free published events (regression)", async () => {
    mockQuery
      .mockResolvedValueOnce([baseRow])
      .mockResolvedValueOnce([]); // duplicate-email check
    mockReserveCapacity.mockResolvedValueOnce(1);
    mockFindOrCreatePerson.mockResolvedValueOnce({ id: "p-1", first_name: "Jane" });
    mockCreateTicket.mockResolvedValueOnce(ticket);
    mockPassUrlFor.mockReturnValue("/pass/tok-1");

    const res = await registerForEvent({
      eventId: "ev-1",
      name: "Jane Doe",
      email: "jane@example.com",
      consent: true,
    });

    expect(res.error).toBeUndefined();
    expect(res.reference).toBe("REF-1");
    expect(mockReserveCapacity).toHaveBeenCalledWith("ev-1", 1);
    expect(mockCreateTicket).toHaveBeenCalledWith(expect.objectContaining({ status: "confirmed" }));
  });
});
