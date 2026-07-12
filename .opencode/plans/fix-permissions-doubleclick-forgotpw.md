# Fix: Permissions, Double-Click, Forgot Password

## Fix 1: Empty permissions for super_admin

**File:** `src/lib/auth/super-admin.ts:83`

Change:
```typescript
permissions = Array.isArray(userRows[0].permissions) ? userRows[0].permissions : ALL_PERMISSIONS;
```
To:
```typescript
permissions = role === "super_admin" ? ALL_PERMISSIONS : (Array.isArray(userRows[0].permissions) ? userRows[0].permissions : ALL_PERMISSIONS);
```

## Fix 2: Double-click on sidebar links

**File:** `src/components/admin/AdminLayout.tsx:128-135`

Remove the entire `useEffect` block:
```typescript
useEffect(() => {
  if (!error && !userProp && pathname !== "/admin/login") {
    router.push("/admin/login");
  }
}, [error, userProp, pathname, router]);
```

Server layout already handles session check — this useEffect races with Link navigation.

## Fix 3: Forgot-password error logging

**File:** `src/actions/admin-auth.ts:82-84`

Change the catch block in `requestPasswordReset`:
```typescript
  } catch (e) {
    console.error("requestPasswordReset error:", e);
    return { error: "Something went wrong. Try again." };
  }
```
To:
```typescript
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("requestPasswordReset error:", msg);
    return { error: "Email service error: " + msg };
  }
```

## Fix 4: DB data for existing user

Run via psql/Neon:
```sql
UPDATE public.admin_users
SET permissions = '["manage_users","edit_content","manage_courses","manage_partners","view_analytics","access_settings","delete_records","manage_moderators"]'
WHERE email = 'ummumarzuq996@gmail.com';
```

Then push, redeploy, and tell user to log out and back in for new session.
