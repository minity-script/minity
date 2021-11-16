# Release history

## v1.0.0-alpha.30
* macro calls with equal arguments no longer produce duplicate functions
* constants, vars, scores and tags in the same name are now correctly shared between files
* importing an already imported file is now a noop
* **EXPERIMENTAL**: You can now use the `...` spread operator in arrays to include another array. Does not yet work for objects.
  