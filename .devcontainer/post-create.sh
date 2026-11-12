#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "${SCRIPT_DIR}/.." && pwd)"
cd "$REPO_ROOT"

echo "Installing the repository's pinned pnpm version..."
sudo npm install --global pnpm@10.32.1
pnpm --version

echo "Installing workspace dependencies..."
pnpm install --frozen-lockfile

echo "Creating local development environment files..."
mkdir -p apps/api apps/codeimage

cat > apps/api/.env <<'EOF'
DATABASE_URL=postgresql://postgres:postgres@db:5432/codeimage?schema=public
CLIENT_ID_AUTH0=clientId
CLIENT_SECRET_AUTH0=clientSecret
DOMAIN_AUTH0=dev
AUTH0_CLIENT_CLAIMS=https://example.com/
AUDIENCE_AUTH0=https://example.com/
GRANT_TYPE_AUTH0=client_credentials
MOCK_AUTH=true
MOCK_AUTH_EMAIL=dev@example.it
ALLOWED_ORIGINS=*
EOF

cat > apps/api/.env.test <<'EOF'
DATABASE_URL=postgresql://postgres:postgres@test_db:5432/codeimage_test
CLIENT_ID_AUTH0=clientId
CLIENT_SECRET_AUTH0=clientSecret
DOMAIN_AUTH0=https://example.com
AUTH0_CLIENT_CLAIMS=https://example.com/
AUDIENCE_AUTH0=https://example.com/
GRANT_TYPE_AUTH0=client_credentials
MOCK_AUTH=false
MOCK_AUTH_EMAIL=dev@example.it
ALLOWED_ORIGINS=*
EOF

cat > apps/codeimage/.env.local <<'EOF'
VITE_ENABLE_MSW=true
VITE_MOCK_AUTH=true
VITE_API_BASE_URL=
VITE_PUBLIC_AUTH0_DOMAIN=
VITE_PUBLIC_AUTH0_CLIENT_ID=
VITE_PUBLIC_MY_CALLBACK_URL=
VITE_PUBLIC_AUTH0_AUDIENCE=
EOF

echo "Applying development and test database migrations..."
pnpm --filter=@codeimage/api prisma:migrate:deploy
pnpm --filter=@codeimage/api prisma:migrate:deploy-test

echo "Generating the Prisma client..."
pnpm --filter=@codeimage/api exec prisma generate

echo "Building workspace packages..."
pnpm libs:build

echo "Building the API..."
pnpm --filter=@codeimage/api build:ts

echo "Building the frontend..."
pnpm --filter=@codeimage/app build

echo "CodeImage setup and build completed successfully."
