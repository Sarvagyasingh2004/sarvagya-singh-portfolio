/**
 * Stops React DevTools crashing on @react-three/fiber's renderer.
 *
 * r3f 9.3 registers its renderer with `version: undefined`, and DevTools 7.x
 * runs `gte(version, "19.3.0-canary")` on it, which throws. r3f 9.7 fixes this
 * upstream but changes how the scene renders — the hero room blows out — so
 * the version stays pinned and the missing field is filled in here instead.
 *
 * Runs from <head> so it wraps the hook before any renderer registers. Dev
 * only: a production build never reaches that check.
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
