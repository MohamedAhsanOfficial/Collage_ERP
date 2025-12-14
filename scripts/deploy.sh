#!/usr/bin/env bash
set -euo pipefail

: "${DEPLOY_HOST:?DEPLOY_HOST is required for the deploy script}"
: "${DEPLOY_USER:?DEPLOY_USER is required for the deploy script}"
: "${DEPLOY_PATH:?DEPLOY_PATH is required for the deploy script}"
: "${SSH_KEY_PATH:?SSH_KEY_PATH is required for the deploy script}"

archive=ci-app.tar.gz
rm -f "$archive"
tar -czf "$archive" package*.json src views public Jenkinsfile README.md docs scripts

scp -i "$SSH_KEY_PATH" -o StrictHostKeyChecking=no "$archive" "${DEPLOY_USER}@${DEPLOY_HOST}:/tmp/"
ssh -i "$SSH_KEY_PATH" -o StrictHostKeyChecking=no "${DEPLOY_USER}@${DEPLOY_HOST}" <<EOF
  mkdir -p "${DEPLOY_PATH}"
  tar -xzf /tmp/ci-app.tar.gz -C "${DEPLOY_PATH}"
  rm -f /tmp/ci-app.tar.gz
  cd "${DEPLOY_PATH}"
  npm install --production
EOF

echo "Deployed artifact to ${DEPLOY_HOST}:${DEPLOY_PATH}"
