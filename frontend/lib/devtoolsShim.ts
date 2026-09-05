/**
 * Keeps React DevTools from crashing on @react-three/fiber's renderer.
 *
 * r3f 9.3.0 calls `reconciler.injectIntoDevTools({ ..., version: React.version })`,
 * but react-reconciler 0.31's `injectIntoDevTools()` takes NO arguments — it
 * builds its payload from the reconciler config's `rendererVersion`, which r3f
 * never sets. The Three.js renderer therefore registers with `version:
 * undefined`, and React DevTools 7.x does:
 *
 *     1 === renderer.bundleType && gte(renderer.version, "19.3.0-canary")
 *
 * whose `function gte(e = "", t = "")` turns that undefined into an empty
 * string, which fails semver parsing and throws
 * `Invalid argument not valid semver ('' received)` — surfaced by Next as a
 * runtime error overlay on every dev page load.
 *
 * r3f 9.7.0 fixes this upstream, but that release also changes how the scene
 * is rendered: the hero room blows out to white under the same lighting rig.
 * So the version stays pinned at 9.3.0 (exactly — a caret range would drift
 * back onto 9.7) and the missing field is filled in here instead.
 *
 * Runs from <head>, so it wraps the hook before any renderer registers.
 * Dev only: a production build sets bundleType 0, so DevTools short-circuits
 * before it ever reaches that version check.
 */
export const devtoolsVersionShim = `(function () {
  try {
    var hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!hook || typeof hook.inject !== "function" || hook.__r3fVersionShim) return;
    hook.__r3fVersionShim = true;
    var inject = hook.inject;
    hook.inject = function (internals) {
      if (internals && typeof internals.version !== "string") {
        try {
          internals.version = internals.reconcilerVersion || "19.0.0";
        } catch (e) {}
      }
      return inject.apply(this, arguments);
    };
  } catch (e) {}
})();`;
