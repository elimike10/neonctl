#!/bin/bash
set -e
set -x

# Install dependencies
npm install

# Remove existing credentials
rm -f ~/.config/neonctl/credentials.json
rm -f ~/.neonctl_api_key

# Try running neon me command without authentication
echo "Attempting to run 'neon me' without authentication..."
DEBUG=* npx tsx src/cli.ts me || true

# Run neon auth command (this will require manual intervention)
echo "Please complete the authentication in your web browser"
DEBUG=* npx tsx src/cli.ts auth || true

# Check if the API key file exists
if [ ! -f ~/.neonctl_api_key ]; then
    echo "Error: API key file not created after authentication"
    exit 1
else
    echo "API key file created successfully"
fi

# Remove credentials file (but not the API key)
rm -f ~/.config/neonctl/credentials.json

# Run neon me command
echo "Now running 'neon me' command"
DEBUG=* npx tsx src/cli.ts me || true

echo "Test completed successfully"
