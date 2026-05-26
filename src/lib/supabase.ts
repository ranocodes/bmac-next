/**
 * Supabase Data Layer (Zero-Dependency)
 * Using standard fetch to interact with Supabase REST API for maximum stability.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function insertRegistration(data: {
  event_title: string;
  attendee_name: string;
  email: string;
  amount: number;
  reference: string;
}) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing Supabase credentials");
    return { error: "Configuration Error" };
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/registrations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Prefer": "return=minimal"
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Supabase Error:", errorText);
      return { error: errorText };
    }

    return { success: true };
  } catch (err) {
    console.error("Database connection failed:", err);
    return { error: "Database Connection Failed" };
  }
}
