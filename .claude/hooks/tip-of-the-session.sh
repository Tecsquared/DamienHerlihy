#!/usr/bin/env bash
# Shows one random Claude Code tip from .claude/tips.md at session start,
# and asks Claude to remind the user to try it during the session.
set -euo pipefail

tips_file="${CLAUDE_PROJECT_DIR:-$(pwd)}/.claude/tips.md"
[ -f "$tips_file" ] || exit 0

tip=$(grep '^- ' "$tips_file" | shuf -n 1 | sed 's/^- //')
[ -n "$tip" ] || exit 0

TIP="$tip" python3 -c '
import json, os
tip = os.environ["TIP"]
print(json.dumps({
    "systemMessage": "Tip of the session: " + tip,
    "hookSpecificOutput": {
        "hookEventName": "SessionStart",
        "additionalContext": (
            "Tip of the session (from .claude/tips.md): " + tip + "\n"
            "In your first reply, briefly remind the user of this tip in one or two "
            "plain sentences and suggest how it could apply to what they are doing. "
            "If a natural moment comes up later in the session, nudge them to try it."
        ),
    },
}))
'
