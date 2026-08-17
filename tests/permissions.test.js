import test from "node:test";
import assert from "node:assert/strict";
import {
  PERMISSIONS,
  ROLE_PERMISSIONS,
} from "../src/features/hotels/permissions.js";

test("owner receives every application permission", () => {
  assert.deepEqual(
    new Set(ROLE_PERMISSIONS.owner),
    new Set(Object.values(PERMISSIONS)),
  );
});

test("front desk can run stays but cannot manage hotel configuration", () => {
  assert.equal(
    ROLE_PERMISSIONS.front_desk.includes(PERMISSIONS.BOOKINGS_CHECKIN),
    true,
  );
  assert.equal(
    ROLE_PERMISSIONS.front_desk.includes(PERMISSIONS.SETTINGS_MANAGE),
    false,
  );
  assert.equal(
    ROLE_PERMISSIONS.front_desk.includes(PERMISSIONS.REPORTS_EXPORT),
    false,
  );
});

test("finance is read-only for operational resources", () => {
  assert.equal(
    ROLE_PERMISSIONS.finance.includes(PERMISSIONS.REPORTS_EXPORT),
    true,
  );
  assert.equal(
    ROLE_PERMISSIONS.finance.includes(PERMISSIONS.BOOKINGS_UPDATE),
    false,
  );
  assert.equal(
    ROLE_PERMISSIONS.finance.includes(PERMISSIONS.CABINS_MANAGE),
    false,
  );
});
