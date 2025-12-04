# Steps to Change Apache Domain to api.elitegamerinsights.com

## Prerequisites
You're already SSH'd into the server: `ubuntu@vps-6fc73012`

## Step 1: Backup and View Current Configuration
```bash
sudo cp /etc/apache2/sites-available/elitegamerinsights.com.conf /etc/apache2/sites-available/elitegamerinsights.com.conf.backup
sudo cat /etc/apache2/sites-available/elitegamerinsights.com.conf
```

## Step 2: Edit Apache Configuration
```bash
sudo nano /etc/apache2/sites-available/elitegamerinsights.com.conf
```

### Changes to make:
- Change `ServerName` from `elitegamerinsights.com` to `api.elitegamerinsights.com`
- If there's a `ServerAlias`, you may want to update it or remove it
- The file should have lines like:
  ```
  ServerName api.elitegamerinsights.com
  ServerAlias www.api.elitegamerinsights.com  # optional
  ```

## Step 3: Test Apache Configuration
```bash
sudo apache2ctl configtest
```
This should return "Syntax OK" before proceeding.

## Step 4: Reload Apache
```bash
sudo systemctl reload apache2
```

## Step 5: Reissue Certbot Certificate for New Domain
```bash
sudo certbot --apache -d api.elitegamerinsights.com
```

OR if you want to keep the old domain too:
```bash
sudo certbot --apache -d api.elitegamerinsights.com -d www.api.elitegamerinsights.com
```

### During certbot:
- It will ask if you want to redirect HTTP to HTTPS (recommended: Yes)
- It should automatically detect and update your Apache configuration

## Step 6: Verify Everything Works
```bash
# Check Apache status
sudo systemctl status apache2

# Check certificate
sudo certbot certificates

# Test the site
curl -I https://api.elitegamerinsights.com
```

## Troubleshooting
If you get errors:
- Check Apache error logs: `sudo tail -f /var/log/apache2/error.log`
- Check certbot logs: `sudo tail -f /var/log/letsencrypt/letsencrypt.log`
- Make sure DNS is pointing to this server: `dig api.elitegamerinsights.com`


