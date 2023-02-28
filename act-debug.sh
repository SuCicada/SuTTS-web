#!/bin/bash

source $SECRET_ENV
architecture="linux/amd64"
if [ "$(uname -m)" == "arm64" ]; then
  architecture="linux/arm64"
fi

act -j build \
  --container-architecture $architecture \
  -s WEBHOOK_URL=${WEBHOOK_URL} \
  -s API_TOKEN_GITHUB=${API_TOKEN_GITHUB} \
  -s ENV_PRODUCTION="$(cat .env.production)" \
  --insecure-secrets \
#  -s DEBUG=true \
#  --use-gitignore true \
#  -v


