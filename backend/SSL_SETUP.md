# SSL Certificate Setup for Aiven MySQL

This guide explains how to configure the SSL certificate required for connecting to your Aiven MySQL database.

## Why SSL is Required

Aiven MySQL databases require SSL/TLS connections for security. The connection will fail without proper SSL configuration.

## Getting Your CA Certificate from Aiven

1. **Log in to Aiven Console**
   - Go to https://console.aiven.io
   - Navigate to your MySQL service

2. **Download CA Certificate**
   - Click on your MySQL service
   - Go to the "Overview" tab
   - Scroll down to "Connection information"
   - Click "Download CA cert" button
   - Save the file as `ca-certificate.crt`

## Configuration Options

You have two ways to provide the CA certificate:

### Option 1: Environment Variable (Recommended for Render)

Copy the certificate content and set it as an environment variable:

```bash
DB_CA_CERT="-----BEGIN CERTIFICATE-----
MIIEQTCCAqmgAwIBAgIUZPz8...
[certificate content here]
...
-----END CERTIFICATE-----"
```

**For Render deployment:**
1. Go to your Render dashboard
2. Select your backend service
3. Go to "Environment" tab
4. Add a new environment variable:
   - Key: `DB_CA_CERT`
   - Value: Paste the entire certificate content (including BEGIN/END lines)

### Option 2: File Path (For Local Development)

Place the certificate file in your project and reference its path:

```bash
DB_CA_CERT_PATH=/path/to/ca-certificate.crt
```

**For local development:**
```bash
# In backend/.env
DB_CA_CERT_PATH=./ca-certificate.crt
```

**Note:** Don't commit the certificate file to Git! Add it to `.gitignore`.

## Complete Environment Configuration

Here's your complete `.env` file for the backend:

```bash
# Server Configuration
PORT=3001
NODE_ENV=production

# Database Configuration (MySQL on Aiven)
DB_HOST=mysql-example.aivencloud.com
DB_PORT=12345
DB_USER=avnadmin
DB_PASSWORD=admin_password
DB_NAME=defaultdb

# SSL Certificate (choose ONE option)
# Option 1: Direct certificate content
DB_CA_CERT="-----BEGIN CERTIFICATE-----
[your certificate here]
-----END CERTIFICATE-----"

# Option 2: File path
# DB_CA_CERT_PATH=./ca-certificate.crt

# Frontend URL (for CORS)
FRONTEND_URL=https://your-app.vercel.app
```

## Testing Your Connection

After setting up the SSL certificate, test your connection:

```bash
# Install dependencies
npm install

# Run the migration
npm run migrate

# Start the server
npm run dev
```

If the connection is successful, you should see:
```
Database connected successfully
Server running on port 3001
```

## Troubleshooting

### Error: "ER_ACCESS_DENIED_ERROR"
- Check your DB_USER and DB_PASSWORD
- Ensure you're using the correct Aiven credentials

### Error: "ECONNREFUSED"
- Verify DB_HOST and DB_PORT
- Check your internet connection
- Ensure Aiven service is running

### Error: "SSL connection error"
- Verify the CA certificate is correct
- Check that DB_CA_CERT or DB_CA_CERT_PATH is properly set
- Ensure the certificate includes BEGIN/END lines

### Error: "certificate has expired"
- Download a fresh CA certificate from Aiven
- Update your DB_CA_CERT environment variable

## Security Best Practices

1. **Never commit credentials to Git**
   - Keep `.env` in `.gitignore`
   - Use environment variables in production

2. **Rotate passwords regularly**
   - Update DB_PASSWORD in Aiven console
   - Update environment variables accordingly

3. **Use different databases for dev/prod**
   - Create separate MySQL services in Aiven
   - Use different credentials for each environment

4. **Monitor database access**
   - Check Aiven logs regularly
   - Set up alerts for suspicious activity
