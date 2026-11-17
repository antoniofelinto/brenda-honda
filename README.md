# Brenda Honda — vitrine de motos Honda (Motorac Toritama)

Site estático (HTML/CSS/JS) com painel de administrador em `/admin.html`.

- `index.html`, `css/`, `js/`, `assets/` — o site público
- `admin.html`, `js/admin.js` — painel (login, fotos, nomes, valores, texto do topo do site)
- `api/site.js` — função do Vercel que guarda as edições (Vercel Blob) e faz o login

## Variáveis de ambiente (Vercel → Settings → Environment Variables)

| Nome | Para quê |
| --- | --- |
| `ADMIN_EMAIL` | e-mail de acesso ao painel |
| `ADMIN_PASSWORD` | senha de acesso ao painel |
| `SESSION_SECRET` | (opcional) segredo da sessão |
| `BLOB_READ_WRITE_TOKEN` | entra sozinha ao conectar um armazenamento Blob (público) ao projeto |

Nenhuma senha fica no código.
