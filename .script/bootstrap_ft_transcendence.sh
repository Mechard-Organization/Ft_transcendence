#!/usr/bin/env bash
set -euo pipefail

# ========= Pré-requis =========
if ! command -v jq >/dev/null 2>&1; then
  echo "Erreur: 'jq' est requis. Installe-le (ex: sudo apt install -y jq) puis relance."
  exit 1
fi

# ========= Auto-détection du repo courant =========
REMOTE_URL="$(git config --get remote.origin.url || true)"
if [[ -z "${REMOTE_URL}" ]]; then
  echo "Erreur: pas de remote configuré. Fais: git remote add origin <url_github> && git push -u origin main"
  exit 1
fi
if [[ "${REMOTE_URL}" =~ github.com[:/]+([^/]+)/([^/.]+) ]]; then
  OWNER="${BASH_REMATCH[1]}"
  REPO="${BASH_REMATCH[2]}"
else
  echo "Erreur: impossible d'extraire owner/repo depuis ${REMOTE_URL}"
  exit 1
fi
FULL_REPO="${OWNER}/${REPO}"
echo "Repo détecté: ${FULL_REPO}"

# ========= Vérif accès repo =========
echo "Vérification accès/scopes…"
if ! gh api "repos/${FULL_REPO}" -q .full_name >/dev/null 2>&1; then
  echo "Impossible d'accéder au repo ${FULL_REPO}."
  echo "Si le repo est privé : gh auth refresh -h github.com -s repo -s project --sso"
  exit 1
fi

# ========= Labels =========
echo "==> Création labels…"
declare -a LABELS=(
  "area:frontend:#1f6feb"
  "area:backend:#0e8a16"
  "area:gameplay:#a371f7"
  "area:ws:#8250df"
  "area:chat:#fbca04"
  "area:matchmaking:#d93f0b"
  "area:devops:#5319e7"
  "area:security:#b60205"
  "area:db:#00ffbb"
  "area:ux:#ff7f50"
  "area:docs:#0075ca"
  "area:testing:#c5def5"
  "priority:high:#e11d48"
)
for L in "${LABELS[@]}"; do
  NAME="${L%%:#*}"; COLOR="${L##*:}"; COLOR="${COLOR#\#}"
  gh label create "$NAME" --color "$COLOR" --repo "$FULL_REPO" --description "" >/dev/null 2>&1 \
    || gh label edit "$NAME" --color "$COLOR" --repo "$FULL_REPO" >/dev/null 2>&1 || true
done

# ========= Jalons S1→S6 =========
echo "==> Création jalons (S1->S6)…"
for i in 1 2 3 4 5 6; do
  TITLE="S$i"
  gh api --method POST -H "Accept: application/vnd.github+json" \
    "/repos/${FULL_REPO}/milestones" -f title="$TITLE" >/dev/null 2>&1 || true
done

# Helper pour récupérer le "number" d'un milestone par son titre
get_milestone_number() {
  local title="$1"
  gh api "/repos/${FULL_REPO}/milestones?state=open" \
    | jq -r --arg T "$title" '.[] | select(.title==$T) | .number' | head -n1
}

# ========= Project v2 (sous TON compte) =========
echo "==> Création du Project v2…"
OWNER_LOGIN="$(gh api user -q .login)"
PROJECT_NAME="ft_transcendence Roadmap"

# Création silencieuse (idempotent)
gh project create "$PROJECT_NAME" --owner "$OWNER_LOGIN" >/dev/null 2>&1 || true

# Récup NUMÉRO du project (pas l'id)
PROJECT_NUMBER="$(gh api graphql \
  -F login="$OWNER_LOGIN" \
  -f query='
    query($login:String!) {
      user(login:$login) {
        projectsV2(first:100) { nodes { number title } }
      }
    }' \
  | jq -r --arg TITLE "$PROJECT_NAME" '.data.user.projectsV2.nodes[] | select(.title==$TITLE) | .number' \
)"
if [[ -z "${PROJECT_NUMBER}" || "${PROJECT_NUMBER}" == "null" ]]; then
  echo "Erreur: impossible d’obtenir le numéro du Project v2 « $PROJECT_NAME »."
  exit 1
fi
echo "ProjectNumber: $PROJECT_NUMBER"

# ========= Champ Status (tolérant aux différentes formes JSON) =========
RAW_FIELDS="$(gh project field-list "$PROJECT_NUMBER" --owner "$OWNER_LOGIN" --format json || true)"
STATUS_FIELD_ID="$(
  echo "${RAW_FIELDS}" \
  | jq -r '(.[]?, .fields[]?) | select(.name?=="Status") | .id' 2>/dev/null || true
)"
if [[ -z "${STATUS_FIELD_ID}" || "${STATUS_FIELD_ID}" == "null" ]]; then
  echo "Avertissement: champ 'Status' introuvable. Les statuts ne seront pas positionnés."
  STATUS_FIELD_ID=""
fi

# ========= Helper: création issue via REST + ajout Project + set Status =========
create_issue() {
  local title="$1"; shift
  local body="$1"; shift
  local csv_labels="$1"; shift          # "a,b,c"
  local milestone_title="$1"; shift     # "S1"...
  local assignee="$1"; shift            # login SANS @
  local status="$1"; shift

  # Convertit labels CSV -> tableau JSON
  local labels_json
  labels_json="$(jq -Rc 'split(",")' <<<"$csv_labels")"

  # Récup numéro de milestone
  local ms_number
  ms_number="$(get_milestone_number "$milestone_title")"
  if [[ -z "${ms_number}" || "${ms_number}" == "null" ]]; then
    ms_number="null"
  fi

  # Tentative avec assignee ; si échec, retente sans
  local PAYLOAD ISSUE_JSON
  PAYLOAD="$(jq -n \
    --arg title "$title" \
    --arg body "$body" \
    --argjson labels "$labels_json" \
    --arg assignee "$assignee" \
    --argjson milestone "${ms_number}" \
    '{title:$title, body:$body, labels:$labels, assignees: [$assignee], milestone: $milestone}' \
  )"

  set +e
  ISSUE_JSON="$(gh api --method POST "/repos/${FULL_REPO}/issues" --input - <<<"$PAYLOAD" 2>/dev/null)"
  RC=$?
  set -e
  if [[ $RC -ne 0 || -z "${ISSUE_JSON}" ]]; then
    # Fallback sans assignee
    PAYLOAD="$(jq -n \
      --arg title "$title" \
      --arg body "$body" \
      --argjson labels "$labels_json" \
      --argjson milestone "${ms_number}" \
      '{title:$title, body:$body, labels:$labels, milestone: $milestone}' \
    )"
    ISSUE_JSON="$(gh api --method POST "/repos/${FULL_REPO}/issues" --input - <<<"$PAYLOAD")"
  fi

  local NUMBER URL
  NUMBER="$(jq -r '.number' <<<"$ISSUE_JSON")"
  URL="$(jq -r '.html_url' <<<"$ISSUE_JSON")"

  # Ajoute l’issue au Project (NUMÉRO)
  gh project item-add "$PROJECT_NUMBER" --owner "$OWNER_LOGIN" --url "$URL" >/dev/null

  # Fixe Status si possible
  if [[ -n "${STATUS_FIELD_ID}" ]]; then
    local RAW_ITEMS ITEM_ID
    RAW_ITEMS="$(gh project item-list "$PROJECT_NUMBER" --owner "$OWNER_LOGIN" --format json || true)"
    ITEM_ID="$(
      echo "${RAW_ITEMS}" \
      | jq -r --arg url "$URL" '(.items[]?, .[]?) | select(.content?.url==$url) | .id' 2>/dev/null || true
    )"
    if [[ -n "${ITEM_ID}" && "${ITEM_ID}" != "null" ]]; then
      gh project item-edit --owner "$OWNER_LOGIN" --id "$PROJECT_NUMBER" \
        --item-id "$ITEM_ID" --field-id "$STATUS_FIELD_ID" --value "$status" >/dev/null || true
    fi
  fi

  echo "✓ #$NUMBER $title"
}

# ========= Assignees (logins SANS @) =========
YOU="M2000-fr"
LYLOU="LylouGavmild"
JEANNE="namoule"

# =========================
# SEMAINE 1 — Kickoff & fondations
# =========================
create_issue \
  "S1/DevOps – Monorepo & Docker one-liner" \
  "Init monorepo, docker-compose, Nginx TLS (HTTPS/WSS), Makefile \`make up\`.\nDoD: https://localhost OK." \
  "area:devops,area:security,area:backend,priority:high" "S1" "$YOU" "In progress"

create_issue \
  "S1/Backend – Auth minimal (signup/login JWT) + SQLite migrations" \
  "Fastify auth, Argon2id, migrations SQLite, routes /signup /login, refresh token." \
  "area:backend,area:db,area:security" "S1" "$YOU" "To do"

create_issue \
  "S1/Gameplay – Pong local (2 joueurs, collisions)" \
  "Canvas TS, state, collisions, vitesses égales, score." \
  "area:gameplay" "S1" "$LYLOU" "In progress"

create_issue \
  "S1/Frontend – SPA Vite+TS+Tailwind + routes" \
  "Home/Login/Register, layout, nav, gestion Back/Forward sans erreurs UI." \
  "area:frontend,area:ux" "S1" "$JEANNE" "In progress"

# =========================
# SEMAINE 2 — Chat & intégration UI
# =========================
create_issue \
  "S2/Backend – Service Chat WS (DM/rooms, blocklist) + schéma DB" \
  "Fastify WS, persistance messages, endpoints block/unblock, tests unitaires." \
  "area:backend,area:ws,area:chat,area:db" \
  "S2" "$YOU" "To do"

create_issue \
  "S2/Gameplay – Spéc WS du jeu (proto inputs/state), intégration SPA" \
  "Définir messages join/input/state/leave, cadence tick, anti-cheat simple, intégration canvas dans SPA." \
  "area:gameplay,area:ws" \
  "S2" "$LYLOU" "To do"

create_issue \
  "S2/Frontend – UI Chat (DM, rooms, block, invite to game)" \
  "Liste amis, DM, block user, CTA 'Inviter à jouer', toasts, erreurs gérées." \
  "area:frontend,area:ux,area:chat" \
  "S2" "$JEANNE" "To do"

# =========================
# SEMAINE 3 — Remote play & matchmaking
# =========================
create_issue \
  "S3/Backend – Matchmaking & Tournois (alias, brackets, annonces WS)" \
  "CRUD tournois, enregistrement alias, émission des prochains matchs, résilience aux déconnexions." \
  "area:backend,area:ws,area:matchmaking" \
  "S3" "$YOU" "To do"

create_issue \
  "S3/Gameplay – Remote players (serveur WS, resync, reconnect)" \
  "Inputs → serveur → frame broadcast, resync périodique, lissage latence et gestion reconnect." \
  "area:gameplay,area:ws" \
  "S3" "$LYLOU" "To do"

create_issue \
  "S3/Frontend – UI Tournoi (inscription alias, bracket, notifications)" \
  "Affichage bracket clair, statut en temps réel, navigation fluide, notifications de match." \
  "area:frontend,area:ux" \
  "S3" "$JEANNE" "To do"

# =========================
# SEMAINE 4 — Auth avancée & sécurité
# =========================
create_issue \
  "S4/Backend – 2FA TOTP + recovery + OAuth2 GitHub" \
  "Provisioning QR, vérif TOTP, recovery codes, flow OAuth2 code+PKCE, liaison comptes." \
  "area:backend,area:security" \
  "S4" "$YOU" "To do"

create_issue \
  "S4/Gameplay – Fairness + début IA (vision 1Hz, prédiction rebonds)" \
  "Clamp vitesses, seeds RNG, esquisser IA (entrées clavier simulées), début heuristiques." \
  "area:gameplay" \
  "S4" "$LYLOU" "To do"

create_issue \
  "S4/Frontend – Flows sécurité (2FA, OAuth2), UX erreurs & accessibilité" \
  "Écrans activer 2FA, login 2FA, bouton OAuth2, messages d’erreur propres, focus management." \
  "area:frontend,area:ux,area:security" \
  "S4" "$JEANNE" "To do"

# =========================
# SEMAINE 5 — IA & microservices & observabilité
# =========================
create_issue \
  "S5/DevOps – Microservices + API Gateway + Monitoring" \
  "Découpe services auth/game/chat/matchmaking, API Gateway, Prometheus+Grafana dashboards." \
  "area:devops,area:backend" \
  "S5" "$YOU" "To do"

create_issue \
  "S5/Gameplay – IA adversaire intégrée (peut gagner), paramétrable" \
  "Vision 1Hz, prédiction multi-rebonds, bruit contrôlé, entrées simulées, niveaux de difficulté." \
  "area:gameplay" \
  "S5" "$LYLOU" "To do"

create_issue \
  "S5/Frontend – Profils, stats & historique + choix IA" \
  "Pages profils (W/L, derniers matchs), activer match vs IA, états vides élégants." \
  "area:frontend,area:ux" \
  "S5" "$JEANNE" "To do"

# =========================
# SEMAINE 6 — Finalisation & soutenance
# =========================
create_issue \
  "S6/Qualité – Tests e2e (Playwright), test charge WS, docs & schémas" \
  "Scénarios critiques bout-en-bout, p95 latence WS, README, schémas d’archi, scripts seed démo." \
  "area:testing,area:docs,area:devops" \
  "S6" "$YOU" "To do"

create_issue \
  "S6/Gameplay – Polish réseau & gameplay (resync, collisions, FX)" \
  "Tuning tick/lerp, collisions fiables, feedback visuel, sons si temps ok." \
  "area:gameplay" \
  "S6" "$LYLOU" "To do"

create_issue \
  "S6/Frontend – UX finale + i18n FR/EN minimal" \
  "Palette cohérente, composants Tailwind unifiés, i18n menus/titres/erreurs." \
  "area:frontend,area:ux" \
  "S6" "$JEANNE" "To do"

echo "==> Terminé. Ouvre le board : gh project view \"$PROJECT_NAME\" --owner \"$OWNER_LOGIN\" || true"
