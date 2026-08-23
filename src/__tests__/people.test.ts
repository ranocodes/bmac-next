import { describe, it, expect, vi, beforeEach } from "vitest";

const mockRequirePermission = vi.fn();
const mockLog = vi.fn();
const mockQuery = vi.fn();

vi.mock("@/lib/auth/server", () => ({
  requirePermission: (...args: unknown[]) => mockRequirePermission(...args),
}));
vi.mock("@/actions/activity-logs", () => ({
  logActivity: (...args: unknown[]) => mockLog(...args),
}));
vi.mock("@/lib/db", () => ({
  db: { query: (...args: unknown[]) => mockQuery(...args) },
}));

import { findOrCreatePerson, ensurePersonRoles } from "@/lib/people";
import { getPeople, getPerson, exportPeople } from "@/actions/people";

const caller = { email: "boss@x.com", firstName: "Boss", role: "super_admin", permissions: ["manage_users"] };

const personRow = {
  id: "person-1",
  first_name: "Jane",
  last_name: "Doe",
  email: "jane@example.com",
  phone: "080123",
  roles: ["donor"],
  notes: "",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

describe("people actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("findOrCreatePerson creates a new person with lowercased email", async () => {
    mockQuery
      .mockResolvedValueOnce([])            // email lookup: none
      .mockResolvedValueOnce([])            // name lookup: none
      .mockResolvedValueOnce([])            // insert: success
      .mockResolvedValueOnce([personRow]);  // reselect

    const person = await findOrCreatePerson({ firstName: "Jane", lastName: "Doe", email: "JANE@Example.com" });

    expect(person?.email).toBe("jane@example.com");
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO public.people"),
      expect.arrayContaining(["jane@example.com"])
    );
    expect(mockLog).toHaveBeenCalledWith("system", "person_create", "people", expect.anything());
  });

  it("findOrCreatePerson returns existing person when email matches", async () => {
    mockQuery.mockResolvedValueOnce([personRow]);

    const person = await findOrCreatePerson({ firstName: "Jane", email: "jane@example.com" });

    expect(person?.id).toBe("person-1");
    expect(person?.roles).toEqual(["donor"]);
    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(mockLog).not.toHaveBeenCalled();
  });

  it("findOrCreatePerson falls back to phone match when email is empty", async () => {
    mockQuery.mockResolvedValueOnce([personRow]);

    const person = await findOrCreatePerson({ firstName: "Jane", phone: "080123" });

    expect(person?.id).toBe("person-1");
    expect(mockQuery).toHaveBeenCalledWith(
      "SELECT * FROM public.people WHERE phone = $1 AND phone <> ''",
      ["080123"]
    );
  });

  it("ensurePersonRoles is idempotent (no duplicate roles)", async () => {
    mockQuery.mockResolvedValueOnce([{ roles: ["donor"] }]);

    const roles = await ensurePersonRoles("person-1", ["donor", "donor"]);

    expect(roles).toEqual(["donor"]);
    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(mockQuery).not.toHaveBeenCalledWith(expect.stringContaining("UPDATE public.people"), expect.anything());
  });

  it("ensurePersonRoles unions new roles into existing ones", async () => {
    mockQuery
      .mockResolvedValueOnce([{ roles: ["donor"] }])
      .mockResolvedValueOnce([]); // UPDATE

    const roles = await ensurePersonRoles("person-1", ["attendee"]);

    expect(roles).toEqual(["donor", "attendee"]);
    expect(mockQuery).toHaveBeenLastCalledWith(
      "UPDATE public.people SET roles = $2::jsonb, updated_at = now() WHERE id = $1",
      ["person-1", JSON.stringify(["donor", "attendee"])]
    );
  });

  it("getPeople requires manage_users permission", async () => {
    mockRequirePermission.mockRejectedValue(new Error("Forbidden: insufficient permissions"));

    await expect(getPeople()).rejects.toThrow("Forbidden");
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("getPerson returns records newest-first and flags admins", async () => {
    mockRequirePermission.mockResolvedValue(caller);
    mockQuery
      .mockResolvedValueOnce([personRow])
      .mockResolvedValueOnce([
        { id: "rec-new", person_id: "person-1", kind: "donation", ref_id: "r2", ref_title: "Donation", status: "completed", meta: {}, created_at: "2026-02-01T00:00:00Z" },
        { id: "rec-old", person_id: "person-1", kind: "event_registration", ref_id: "r1", ref_title: "Event", status: "confirmed", meta: {}, created_at: "2026-01-01T00:00:00Z" },
      ])
      .mockResolvedValueOnce([{ id: "au-1" }]);

    const result = await getPerson("person-1");

    expect(result?.person.id).toBe("person-1");
    expect(result?.isAdmin).toBe(true);
    expect(result?.person.roles).toContain("admin");
    expect(result?.records.map(r => r.id)).toEqual(["rec-new", "rec-old"]);
  });

  it("exportPeople requires permission and returns core fields", async () => {
    mockRequirePermission.mockResolvedValue(caller);
    mockQuery.mockResolvedValueOnce([
      { ...personRow, record_count: "2", is_admin: false },
    ]);

    const rows = await exportPeople();

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      firstName: "Jane",
      email: "jane@example.com",
      recordCount: 2,
    });
  });

  it("getPerson returns null when person not found", async () => {
    mockRequirePermission.mockResolvedValue(caller);
    mockQuery.mockResolvedValueOnce([]);

    const result = await getPerson("missing");

    expect(result).toBeNull();
  });
});
