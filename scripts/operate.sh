#!/usr/bin/env bash
set -euo pipefail

: "${DEPLOY_HOST:?DEPLOY_HOST is required for operate}"
: "${DEPLOY_USER:?DEPLOY_USER is required for operate}"
: "${DEPLOY_PATH:?DEPLOY_PATH is required for operate}"
: "${SSH_KEY_PATH:?SSH_KEY_PATH is required for operate}"

ssh -i "$SSH_KEY_PATH" -o StrictHostKeyChecking=no "${DEPLOY_USER}@${DEPLOY_HOST}" <<EOF
  cd "${DEPLOY_PATH}"
  pkill -f "node src/app.js" || true
  nohup npm run start >/tmp/ci-lab-app.log 2>&1 &
  echo "Server running with PID" $!
EOF
