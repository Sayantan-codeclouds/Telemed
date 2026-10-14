import { test } from "node:test";
import assert from "node:assert/strict";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

/** Absolute path of the server package (…/server). */
export const SERVER_DIR = fileURLToPath(new URL("../../", import.meta.url));

/** Imports a module from server/src, e.g. load("app.js"). */
export const load = (relativePath) => import(pathToFileURL(path.join(SERVER_DIR, "src", relativePath)).href);

/**
 * The suites run as one end-to-end flow (each step depends on the previous
 * one), recording named checks as they go. report() then turns every check
 * into its own node:test case, so a failure names the exact check.
 */
export const createChecks = () => {
  const results = [];

  const check = (name, condition, details = "") => {
    results.push({ name, ok: Boolean(condition), details: typeof details === "string" ? details : String(details) });
  };

  const report = () => {
    if (results.length === 0) {
      test("suite recorded checks", () => assert.fail("No checks ran."));
      return;
    }
    for (const { name, ok, details } of results) {
      test(name, () => assert.ok(ok, details || `Check failed: ${name}`));
    }
  };

  return { check, report };
};
