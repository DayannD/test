#!/bin/bash

# Script to generate self-signed SSL certificates for development/testing
# For production, use Let's Encrypt with Certbot

set -e

SSL_DIR="$(dirname "$0")/ssl"
DAYS_VALID=365

echo "Generating self-signed SSL certificate..."
echo "Certificate will be valid for $DAYS_VALID days"
echo ""

# Create SSL directory if it doesn't exist
mkdir -p "$SSL_DIR"

# Generate private key and certificate
openssl req -x509 -nodes -days $DAYS_VALID -newkey rsa:2048 \
  -keyout "$SSL_DIR/key.pem" \
  -out "$SSL_DIR/cert.pem" \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

# Set proper permissions
chmod 600 "$SSL_DIR/key.pem"
chmod 644 "$SSL_DIR/cert.pem"

echo ""
echo "✅ SSL certificates generated successfully!"
echo "   - Certificate: $SSL_DIR/cert.pem"
echo "   - Private key: $SSL_DIR/key.pem"
echo ""
echo "⚠️  WARNING: These are self-signed certificates for development only!"
echo "   For production, use Let's Encrypt with Certbot."
