#!/usr/bin/env bash
# Autopilota: impedisce a Claude di chiudere il turno finché in docs/PLAN.md
# restano task aperti (M1–M9, esclusi quelli "(umano)").
# Attivo solo nelle sessioni cloud (CLAUDE_CODE_REMOTE=true) o se esiste .claude/autopilot.on.
# Si disattiva se esiste docs/BLOCKED.md o se per 3 stop consecutivi non ci sono nuovi commit.
set -uo pipefail
cd "${CLAUDE_PROJECT_DIR:-$(pwd)}" || exit 0

[[ "${CLAUDE_CODE_REMOTE:-}" == "true" || -f .claude/autopilot.on ]] || exit 0
[[ -f docs/BLOCKED.md ]] && exit 0
[[ -f docs/PLAN.md ]] || exit 0
grep -q "Layout scelto: _DA DEFINIRE_" docs/PLAN.md && exit 0

open_tasks=$(awk '/^### M1 /{on=1} /^### M10/{on=0} on && /^- \[ \]/ && !/\(umano\)/' docs/PLAN.md)
[[ -z "$open_tasks" ]] && exit 0

# Protezione anti-loop: se HEAD non cambia per 3 stop di fila, lascia fermare.
state=.claude/.autopilot-state
head=$(git rev-parse HEAD 2>/dev/null || echo none)
last_head=""; count=0
[[ -f "$state" ]] && read -r last_head count < "$state"
if [[ "$head" == "$last_head" ]]; then count=$((count + 1)); else count=1; fi
echo "$head $count" > "$state"
if (( count > 3 )); then
  rm -f "$state"
  echo "Autopilota: nessun nuovo commit in 3 tentativi, mi fermo." >&2
  exit 0
fi

remaining=$(printf '%s\n' "$open_tasks" | wc -l | tr -d ' ')
next=$(printf '%s\n' "$open_tasks" | head -n1 | cut -c7-200)
next=${next//\\/\\\\}
next=${next//\"/\\\"}
next=${next//$'\t'/ }
reason="Autopilota: restano ${remaining} task aperti in docs/PLAN.md. Prossimo: ${next}. Continua seguendo §4 (test dopo ogni task, gate di fine milestone, commit e aggiornamento di PLAN/PROGRESS). Non chiedere conferme all'utente: per i dubbi decidi e annota; per i blocchi reali marca [!] e prosegui, oppure crea docs/BLOCKED.md se non resta nulla di eseguibile."
printf '{"decision":"block","reason":"%s"}\n' "$reason"
exit 0
