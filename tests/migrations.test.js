import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const workflowPath = new URL(
  "../supabase/migrations/202608170002_booking_workflows.sql",
  import.meta.url,
);
const rlsPath = new URL(
  "../supabase/migrations/202608170003_rls_policies.sql",
  import.meta.url,
);
const relationshipCleanupPath = new URL(
  "../supabase/migrations/202608170005_relationship_cleanup.sql",
  import.meta.url,
);

test("database workflow exposes every RPC used by the frontend", async () => {
  const workflow = await readFile(workflowPath, "utf8");

  for (const rpc of [
    "create_booking",
    "reschedule_booking",
    "create_maintenance_block",
  ]) {
    assert.match(workflow, new RegExp(`function public\\.${rpc}\\(`));
  }
});

test("RLS migration removes old permissive policies before creating scoped policies", async () => {
  const rls = await readFile(rlsPath, "utf8");

  assert.match(rls, /from pg_policies/);
  assert.match(rls, /bookings_select_members/);
  assert.match(rls, /hotel_members_insert_owner/);
  assert.match(rls, /audit_select_authorized/);
});

test("relationship cleanup preserves composite constraints before removing ambiguous legacy keys", async () => {
  const cleanup = await readFile(relationshipCleanupPath, "utf8");

  for (const requiredConstraint of [
    "bookings_cabin_same_hotel_fkey",
    "bookings_guest_same_hotel_fkey",
    "maintenance_cabin_same_hotel_fkey",
  ]) {
    assert.match(cleanup, new RegExp(`conname = '${requiredConstraint}'`));
  }

  for (const redundantConstraint of [
    "bookings_cabinId_fkey",
    "bookings_guestId_fkey",
    "maintenance_blocks_cabinId_fkey",
  ]) {
    assert.match(
      cleanup,
      new RegExp(`drop constraint if exists "${redundantConstraint}"`),
    );
  }

  assert.match(cleanup, /notify pgrst, 'reload schema'/);
});
