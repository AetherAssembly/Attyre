#!/bin/bash
# Checks that every CSS class referenced in JS files exists in style.css.
# Exits 1 (fails the build) if any are missing.

JS_FILES=$(find js -name "*.js" ! -name "*.test.js")

MISSING=()
while IFS= read -r cls; do
  if ! grep -qE "\.${cls}([^_a-zA-Z0-9-]|$)" style.css; then
    MISSING+=("$cls")
  fi
done < <(grep -ohE '"[a-z][a-z0-9 -]+"' $JS_FILES \
  | grep -ohE '[a-z][a-z0-9-]{2,}' \
  | sort -u)

if [ ${#MISSING[@]} -eq 0 ]; then
  echo "✓ All CSS classes found in style.css"
  exit 0
else
  echo "✗ Classes used in JS but missing from style.css:"
  printf '  %s\n' "${MISSING[@]}"
  exit 1
fi
