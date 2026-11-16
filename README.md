# Brenda Honda — vitrine de motos Honda (Motorac Toritama)

Site estático (HTML/CSS/JS) com painel de administrador em `/admin.html`.

- `index.html`, `css/`, `js/`, `assets/` — o site público
- `admin.html`, `js/admin.js` — painel (login, fotos, nomes, valores)
- `api/site.js` — função do Vercel que guarda as edições (Redis/Upstash) e faz o login

## Variáveis de ambiente (Vercel → Settings → Environment Variables)

| Nome | Para quê |
| --- | --- |
| `ADMIN_EMAIL` | e-mail de acesso ao painel |
| `ADMIN_PASSWORD` | senha de acesso ao painel |
| `SESSION_SECRET` | (opcional) segredo da sessão |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | entram sozinhas ao conectar o Upstash Redis ao projeto |

Nenhuma senha fica no código.
