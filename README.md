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

## Foto da Brenda: recorte automático do fundo

Ao trocar a foto no painel, o fundo é removido no próprio navegador (para a roda do site passar por trás dela):

- modelo **MODNet** (Apache-2.0) via **Transformers.js** `3.7.3` — a biblioteca vem do jsDelivr e o modelo (~26 MB) do Hugging Face, só na 1ª vez (fica em cache do navegador)
- foto que já vem com fundo transparente (PNG/WebP) é usada como está
- se o recorte falhar (sem internet, pessoa não encontrada…), a foto sobe como veio e o painel avisa
- no iPhone/Safari (que não grava WebP) a foto sai em PNG com transparência, reduzida até caber em 2,3 MB
