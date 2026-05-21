#!/bin/bash
# Checks that every CSS class referenced in JS files exists in style.css.
# Only inspects class-setting contexts to avoid false positives from id/type/role/name/value strings.
# Exits 1 (fails the build) if any are missing.

JS_FILES=$(find js -name "*.js" ! -name "*.test.js")

# Extract classes only from:
#   class="..."         HTML attribute in template literals
#   className="..."     JSX / direct assignment
#   classList.add/remove/toggle/contains("...")
#   .className = "..."  direct property assignment
extract_classes() {
  grep -ohE 'class="[^"]*"' "$@" \
    | grep -ohE '"[^"]*"' \
    | tr -d '"' \
    | sed 's/\${[^}]*}//g' \
    | tr ' ' '\n'

  grep -ohE 'className[= ]+["'"'"'][^"'"'"']*["'"'"']' "$@" \
    | grep -ohE '["'"'"'][^"'"'"']*["'"'"']' \
    | tr -d '"'"'" \
    | tr ' ' '\n'

  grep -ohE 'classList\.(add|remove|toggle|contains)\(["'"'"'][^"'"'"']*["'"'"']\)' "$@" \
    | grep -ohE '["'"'"'][^"'"'"']*["'"'"']' \
    | tr -d '"'"'"
}

MISSING=()
while IFS= read -r cls; do
  [[ -z "$cls" || ${#cls} -lt 2 ]] && continue
  if ! grep -qE "\.${cls}([^_a-zA-Z0-9-]|$)" style.css; then
    MISSING+=("$cls")
  fi
done < <(extract_classes $JS_FILES | grep -E '^[a-z][a-z0-9-]{1,}$' | sort -u)

if [ ${#MISSING[@]} -eq 0 ]; then
  echo "✓ All CSS classes found in style.css"
  exit 0
else
  echo "✗ Classes used in JS but missing from style.css:"
  printf '  %s\n' "${MISSING[@]}"
  exit 1
fi
