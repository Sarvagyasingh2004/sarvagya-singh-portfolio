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
