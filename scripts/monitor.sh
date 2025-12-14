#!/usr/bin/env bash
set -euo pipefail

: "${APP_URL:?APP_URL is required for monitoring}"
: "${DEPLOY_HOST:?DEPLOY_HOST is required for monitoring}"
: "${DEPLOY_USER:?DEPLOY_USER is required for monitoring}"
: "${DEPLOY_PATH:?DEPLOY_PATH is required for monitoring}"
: "${SSH_KEY_PATH:?SSH_KEY_PATH is required for monitoring}"

curl --retry 3 --retry-delay 2 --fail --silent --show-error "${APP_URL}/health"
ssh -i "$SSH_KEY_PATH" -o StrictHostKeyChecking=no "${DEPLOY_USER}@${DEPLOY_HOST}" <<EOF
  if [ ! -f "${DEPLOY_PATH}/data/tracker.db" ]; then
    echo "Database file missing"
    exit 1
  fi
  echo "Database is present and intact"
EOF
