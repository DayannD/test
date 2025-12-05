# Nginx Configuration

Configuration Nginx pour BeeSure API avec reverse proxy, SSL/TLS, et rate limiting.

## Structure

```
docker/nginx/
├── nginx.conf              # Configuration principale Nginx
├── conf.d/
│   └── api.conf           # Configuration reverse proxy pour l'API
├── ssl/                   # Certificats SSL
│   ├── cert.pem          # Certificat SSL
│   └── key.pem           # Clé privée
├── generate-ssl-cert.sh  # Script pour générer des certificats auto-signés
└── README.md             # Ce fichier
```

## Déploiement

### 1. Générer les certificats SSL

#### Pour le développement/testing (certificats auto-signés) :

```bash
cd docker/nginx
chmod +x generate-ssl-cert.sh
./generate-ssl-cert.sh
```

#### Pour la production (Let's Encrypt) :

Sur le serveur de production, utilisez Certbot :

```bash
# Installer Certbot
sudo apt update
sudo apt install certbot

# Générer le certificat (nginx doit tourner sur le port 80)
sudo certbot certonly --webroot \
  -w /var/www/certbot \
  -d votre-domaine.com \
  --email votre-email@example.com \
  --agree-tos

# Copier les certificats dans le dossier nginx/ssl
sudo cp /etc/letsencrypt/live/votre-domaine.com/fullchain.pem docker/nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/votre-domaine.com/privkey.pem docker/nginx/ssl/key.pem
sudo chmod 644 docker/nginx/ssl/cert.pem
sudo chmod 600 docker/nginx/ssl/key.pem
```

### 2. Démarrer les services

```bash
docker compose -f docker-compose.prod.yml up -d
```

## Configuration

### Reverse Proxy

Nginx fait office de reverse proxy devant l'API :
- Toutes les requêtes vers `/api/*` sont proxifiées vers le service `api:3000`
- Headers HTTP ajoutés pour le proxy (X-Real-IP, X-Forwarded-For, etc.)
- Support WebSocket activé

### SSL/TLS

- HTTP (port 80) redirige automatiquement vers HTTPS (port 443)
- TLS 1.2 et 1.3 activés
- Certificats configurés dans `ssl/cert.pem` et `ssl/key.pem`

### Rate Limiting

Deux zones de rate limiting configurées :

1. **API générale** (`api_limit`) :
   - 10 requêtes par seconde
   - Burst de 20 requêtes

2. **Authentification** (`auth_limit`) :
   - 5 requêtes par minute pour `/api/v1/auth/login` et `/api/v1/auth/register`
   - Burst de 5 requêtes

### Compression

Gzip activé pour :
- text/plain, text/css, text/xml, text/javascript
- application/json, application/javascript
- images SVG, fonts

### Security Headers

Headers de sécurité ajoutés automatiquement :
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`

## Endpoints

- `https://votre-domaine.com/` → Status JSON
- `https://votre-domaine.com/api/*` → Proxifié vers l'API
- `https://votre-domaine.com/api/health` → Health check (sans rate limit)

## Logs

Les logs Nginx sont disponibles :
- Logs d'accès : `/var/log/nginx/access.log`
- Logs d'erreur : `/var/log/nginx/error.log`

Pour voir les logs :

```bash
docker logs beesure_nginx
docker logs -f beesure_nginx  # Follow mode
```

## Renouvellement Let's Encrypt

Les certificats Let's Encrypt expirent tous les 90 jours. Pour les renouveler automatiquement :

```bash
# Créer un cron job pour renouveler automatiquement
sudo crontab -e

# Ajouter cette ligne (renouvellement tous les lundis à 3h du matin)
0 3 * * 1 certbot renew --quiet && cp /etc/letsencrypt/live/votre-domaine.com/fullchain.pem /path/to/beesure/docker/nginx/ssl/cert.pem && cp /etc/letsencrypt/live/votre-domaine.com/privkey.pem /path/to/beesure/docker/nginx/ssl/key.pem && docker restart beesure_nginx
```

## Troubleshooting

### Nginx ne démarre pas

Vérifier que les certificats SSL existent :

```bash
ls -la docker/nginx/ssl/
```

Si absents, générer avec `./generate-ssl-cert.sh`

### Erreur 502 Bad Gateway

L'API n'est pas accessible. Vérifier :

```bash
docker logs beesure_api
docker logs beesure_nginx
```

### Tester la configuration Nginx

```bash
docker exec beesure_nginx nginx -t
```
