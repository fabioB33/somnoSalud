---
title: "VAULT-PUBLISH — Vault Obsidian público en vault.pampalabs.com"
date: 2026-04-19
last_synced_with_vault_reality: 2026-04-19
status: active
tags: [infra, vault, quartz, nginx, process]
owner: jorge
verified_real: "2026-04-19 — infra operativa, 8+ rebuilds exitosos en sesión 2026-04-18/19 con rsync + quartz build. No requiere cambios técnicos."
---

# VAULT-PUBLISH — Vault en `vault.pampalabs.com`

Vault Obsidian publicado como sitio estático detrás de Basic Auth + SSL.
Pensado para que Claude conversacional use `web_fetch` al inicio de cada
sesión (con `seguimos` / `continuemos` / `retomemos`) y no olvide contexto.

## Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│  VPS Hostinger 82.29.61.151                              │
│                                                          │
│  /root/Pampa-Labs-Core/docs/vault/                       │
│              │                                           │
│              │ (symlink)                                 │
│              ▼                                           │
│  /root/vault-site/content/  ──►  npx quartz build        │
│                                         │                │
│                                         ▼                │
│  /root/vault-site/public/                                │
│              │                                           │
│              │ (rsync --delete)                          │
│              ▼                                           │
│  /var/www/vault.pampalabs.com/  ──►  nginx host          │
│                                         │                │
│                                         │ SSL + BasicAuth│
│                                         ▼                │
│                               https://vault.pampalabs.com│
│                                                          │
│  Cron hourly (:15):                                      │
│    /root/scripts/rebuild-vault.sh                        │
│    (git pull, diff SHA, if changed → build + rsync)      │
└─────────────────────────────────────────────────────────┘
```

## Artefactos versionados (viven en el repo)

| Path | Rol |
|------|-----|
| `infra/vault-site/quartz.config.ts` | Theme Raycast dark + config Quartz 4 |
| `infra/vault-site/quartz.layout.ts` | Layout con graph, explorer, backlinks, search |
| `infra/scripts/rebuild-vault.sh` | Cron rebuild idempotente con diff por SHA |
| `infra/nginx/vault.pampalabs.com.conf` | Server block con BasicAuth + headers noindex |
| `docs/vault/processes/VAULT-PUBLISH.md` | Este documento |

Todo en git → si el VPS se recrea, se puede bootstrap el sitio entero desde
el repo en <30 min.

## Setup inicial (una sola vez)

Ejecutar como `root` en el VPS. Las líneas marcadas **⚠️** requieren input
interactivo de Jorge.

### 1. DNS (previo, Hostinger panel)

A record:
- Host: `vault`
- Type: `A`
- Points to: `82.29.61.151`
- TTL: 3600

Verificar propagación:

```bash
dig +short vault.pampalabs.com
# → 82.29.61.151
```

### 2. Instalar dependencias del host

```bash
apt update && apt install -y apache2-utils nginx certbot python3-certbot-nginx rsync
```

### 3. Clonar Quartz + aplicar configs de Pampa Labs

```bash
cd /root
git clone --depth 1 https://github.com/jackyzha0/quartz.git vault-site
cd vault-site
npm install

# Overwrite configs con los del monorepo (versionados en git)
cp /root/Pampa-Labs-Core/infra/vault-site/quartz.config.ts ./quartz.config.ts
cp /root/Pampa-Labs-Core/infra/vault-site/quartz.layout.ts ./quartz.layout.ts

# Symlink del content (vault live)
rm -rf content
ln -s /root/Pampa-Labs-Core/docs/vault content
```

### 4. Primer build + publish dir

```bash
mkdir -p /var/www/vault.pampalabs.com
chown -R www-data:www-data /var/www/vault.pampalabs.com
chmod -R 755 /var/www/vault.pampalabs.com

cd /root/vault-site
npx quartz build --output public
rsync -a --delete public/ /var/www/vault.pampalabs.com/
```

### 5. ⚠️ Basic Auth password

Elegir password larga (mínimo 20 chars, guardar en 1Password/Bitwarden).

```bash
htpasswd -c /etc/nginx/.htpasswd-vault claude
# Te pregunta la password 2 veces, escribila.
chmod 640 /etc/nginx/.htpasswd-vault
chown root:www-data /etc/nginx/.htpasswd-vault
```

### 6. Nginx server block

```bash
mkdir -p /var/www/certbot
cp /root/Pampa-Labs-Core/infra/nginx/vault.pampalabs.com.conf \
   /etc/nginx/sites-available/vault.pampalabs.com
ln -sf /etc/nginx/sites-available/vault.pampalabs.com \
   /etc/nginx/sites-enabled/

# Validar sintaxis ANTES de reload.
nginx -t
systemctl reload nginx
```

### 7. SSL con Let's Encrypt

```bash
certbot --nginx -d vault.pampalabs.com \
  --non-interactive --agree-tos \
  -m jorge@pampalabs.com \
  --redirect
```

Certbot inserta `listen 443 ssl` + paths de los certs en el server block y
configura la renovación automática (`/etc/cron.d/certbot` o systemd timer).

### 8. Cron del rebuild hourly

```bash
mkdir -p /root/scripts
cp /root/Pampa-Labs-Core/infra/scripts/rebuild-vault.sh /root/scripts/
chmod +x /root/scripts/rebuild-vault.sh

# Primera corrida manual para verificar que todo anda:
/root/scripts/rebuild-vault.sh

# Agendar cron. Ejecutar crontab -e y agregar:
#   15 * * * * /root/scripts/rebuild-vault.sh >> /var/log/vault-rebuild.log 2>&1
#
# O automático:
(crontab -l 2>/dev/null; echo "15 * * * * /root/scripts/rebuild-vault.sh >> /var/log/vault-rebuild.log 2>&1") | crontab -

# Verificar que está agendado:
crontab -l | grep rebuild-vault
```

Touch para que exista el log file:

```bash
touch /var/log/vault-rebuild.log
chown root:adm /var/log/vault-rebuild.log
```

### 9. Verificación (criterios de éxito)

```bash
# Sin auth → 401
curl -o /dev/null -w "%{http_code}\n" https://vault.pampalabs.com/
# Esperado: 401

# Con auth → 200
curl -u claude:PASSWORD -o /dev/null -w "%{http_code}\n" https://vault.pampalabs.com/
# Esperado: 200

# HTML del MASTER-PLAN
curl -u claude:PASSWORD -s https://vault.pampalabs.com/MASTER-PLAN | head -c 300
# Esperado: HTML empezando con <!DOCTYPE html>

# Headers de privacidad
curl -u claude:PASSWORD -sI https://vault.pampalabs.com/ | grep -i "x-robots-tag"
# Esperado: X-Robots-Tag: noindex, nofollow, noarchive, nosnippet

# HTTP → HTTPS redirect
curl -o /dev/null -w "%{http_code}\n" http://vault.pampalabs.com/
# Esperado: 301 (y location a https://)
```

En browser:
- ✅ Graph view visible (right sidebar)
- ✅ Search filtra notas al tipear
- ✅ Wikilinks `[[MASTER-PLAN]]` son clickeables y navegan
- ✅ Dark mode es el default

## Operaciones cotidianas

### Agregar/editar notas

```bash
# En tu máquina local:
cd Pampa-Labs-Core
# editá docs/vault/...
git add docs/vault/
git commit -m "docs: nota nueva"
git push origin main

# Esperar al próximo :15 (máximo 60 min).
# O forzar rebuild manual desde el VPS: ssh + /root/scripts/rebuild-vault.sh
```

### Rebuild manual

```bash
ssh root@82.29.61.151
/root/scripts/rebuild-vault.sh
tail -20 /var/log/vault-rebuild.log
```

### Cambiar password

```bash
htpasswd /etc/nginx/.htpasswd-vault claude    # sin -c para no borrar el file
# Actualizar la password en tu password manager.
```

### Agregar un segundo usuario

```bash
htpasswd /etc/nginx/.htpasswd-vault otro_user
```

### Rotar credenciales en emergencia

```bash
htpasswd -c /etc/nginx/.htpasswd-vault claude    # -c recrea el file
systemctl reload nginx
# Avisar a Claude conversacional la nueva pass.
```

## Troubleshooting

### `quartz build` falla

Logs completos en `/tmp/quartz-build.log` después de una corrida del
rebuild. Causas comunes:

- Frontmatter YAML inválido en una nota nueva (falta cerrar `---`, tags mal
  formateados). Quartz falla con el archivo ofensivo en el stacktrace.
  Fix: corregir el frontmatter, commit, next run.
- Wikilink roto con caracteres raros. Ver la línea del error.
- Dependencia de Node desactualizada: `cd /root/vault-site && npm install`.

### Cron corre pero no actualiza el sitio

Verificar:

```bash
tail -50 /var/log/vault-rebuild.log
cat /root/.vault-last-build-sha
```

Si el SHA stamp está igual al HEAD de `docs/vault/`, el script skip — es
comportamiento esperado. Forzar rebuild:

```bash
rm /root/.vault-last-build-sha
/root/scripts/rebuild-vault.sh
```

### 502 / 503 en el sitio

- Verificar que `/var/www/vault.pampalabs.com/index.html` existe:
  `ls -la /var/www/vault.pampalabs.com/`
- Si está vacío, forzar rebuild (ver arriba).
- Nginx no pudo leer: `ls -la /var/www/vault.pampalabs.com/ | head` debería
  mostrar owner `www-data` o al menos perms `755`.

### Certbot renewal falla

```bash
certbot renew --dry-run
# Si falla: verificar que vault.pampalabs.com todavía resuelve al VPS y que
# el bloque .well-known/acme-challenge sigue intacto en el server block.
```

### Claude conversacional dice que el vault no responde

Chequeos rápidos:

```bash
# DNS
dig +short vault.pampalabs.com
# → 82.29.61.151

# TLS
curl -sI https://vault.pampalabs.com/ | head -1
# → HTTP/2 401

# Basic Auth funciona
curl -u claude:PASSWORD -sI https://vault.pampalabs.com/ | head -1
# → HTTP/2 200
```

Si curl desde el VPS funciona pero desde Claude no, verificar que la URL
y credenciales que le pasaste a Claude sean exactas (sin trailing space).

## Seguridad

- **Basic Auth no es alta seguridad** — es disuasivo anti-scraper/bot. El
  cert SSL es el que garantiza que la password no viaje en claro.
- **No hay rate-limit ni brute-force protection** en el server block. Para
  un vault privado entre Jorge y Claude está bien. Si alguna vez se
  comparte con más personas, agregar `limit_req_zone` en nginx.
- **El vault es propiedad de Pampa Labs** — no publicar nunca en sitemap,
  no linkear desde sitios públicos. La cabecera `X-Robots-Tag` del server
  block ayuda pero no es garantía contra scraping.
- **Secrets en el vault: ninguno** (auditado 2026-04-16 en este sprint).
  Solo hay price IDs de Stripe que son públicos por diseño (lookup_keys +
  price IDs no son credenciales).

## Referencias externas

- Quartz 4: https://quartz.jzhao.xyz/
- GitHub: https://github.com/jackyzha0/quartz

## Relacionados

- [[../MASTER-PLAN]] — índice maestro.
- [[../debt/infra-audit-vps-config-drift]] — tracking de config del VPS en git.
- [[../hotfixes/2026-04-16-api-proxy-restore]] — precedente del patrón
  "config de infra vive en git, no en el servidor".
