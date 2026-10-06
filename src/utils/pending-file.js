/**
 * One-shot handoff of a user-picked File across SPA navigations.
 *
 * Used by the homepage smart drop: the user drops any supported file on the
 * hero, we stash it here, navigate to the right tool, and that tool consumes
 * it on mount via takePendingFile(). Nothing is persisted — the File object
 * lives only in memory for the current session.
 */

let pendingFile = null;

export function setPendingFile(file) {
  pendingFile = file || null;
}

export function takePendingFile() {
  const f = pendingFile;
  pendingFile = null;
  return f;
}

export function hasPendingFile() {
  return pendingFile !== null;
}
