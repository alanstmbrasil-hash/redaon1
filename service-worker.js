// ═══════════════════════════════════════════════════════════
// RedaON — Service Worker
// Estratégia: Cache First para assets, Network First para dados
// ═══════════════════════════════════════════════════════════

const CACHE_NAME      = 'redaon-v1.0.0';
const CACHE_DINAMICO  = 'redaon-dinamico-v1.0.0';

// Arquivos essenciais — cacheados na instalação
const CACHE_ESTATICO = [
  '/',
  '/login.html',
  '/cadastro.html',
  '/inicio.html',
  '/nova-redacao.html',
  '/elite-profa.html',
  '/temas.html',
  '/hub-preparacao.html',
  '/minhas-redacoes.html',
  '/evolucao.html',
  '/plano.html',
  '/ranking.html',
  '/configuracoes.html',
  '/professor.html',
  '/estudio-blanche.html',
  '/manifest.json',
  // Fontes Google (cacheadas para uso offline)
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap',
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap',
];

// URLs que nunca devem ser cacheadas (sempre online)
const NAO_CACHEAR = [
  'api.anthropic.com',
  'generativelanguage.googleapis.com',
  'supabase.co',
  'stripe.com',
];

// ── INSTALAÇÃO ────────────────────────────────────────────
self.addEventListener('install', event => {
  console.log('[RedaON SW] Instalando versão', CACHE_NAME);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[RedaON SW] Cacheando arquivos essenciais...');
        // Cachear individualmente para não falhar tudo se um arquivo não existir
        return Promise.allSettled(
          CACHE_ESTATICO.map(url =>
            cache.add(url).catch(err =>
              console.warn('[RedaON SW] Não foi possível cachear:', url, err)
            )
          )
        );
      })
      .then(() => {
        console.log('[RedaON SW] Instalação concluída!');
        return self.skipWaiting();
      })
  );
});

// ── ATIVAÇÃO ─────────────────────────────────────────────
self.addEventListener('activate', event => {
  console.log('[RedaON SW] Ativando...');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME && key !== CACHE_DINAMICO)
          .map(key => {
            console.log('[RedaON SW] Removendo cache antigo:', key);
            return caches.delete(key);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// ── INTERCEPTAÇÃO DE REQUISIÇÕES ─────────────────────────
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Ignorar extensões do Chrome e outros protocolos
  if (!event.request.url.startsWith('http')) return;

  // Nunca cachear chamadas de API
  if (NAO_CACHEAR.some(domain => url.hostname.includes(domain))) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Estratégia por tipo de recurso
  if (event.request.method === 'GET') {
    // HTML → Network First (sempre tenta a versão mais recente)
    if (event.request.headers.get('accept')?.includes('text/html')) {
      event.respondWith(networkFirst(event.request));
      return;
    }

    // Fontes e CSS → Cache First (raramente mudam)
    if (
      url.hostname.includes('fonts.googleapis.com') ||
      url.hostname.includes('fonts.gstatic.com') ||
      url.hostname.includes('cdn.tailwindcss.com') ||
      url.hostname.includes('cdn.jsdelivr.net') ||
      url.pathname.endsWith('.css') ||
      url.pathname.endsWith('.woff2') ||
      url.pathname.endsWith('.woff')
    ) {
      event.respondWith(cacheFirst(event.request));
      return;
    }

    // Demais recursos → Stale While Revalidate
    event.respondWith(staleWhileRevalidate(event.request));
  }
});

// ── ESTRATÉGIAS DE CACHE ─────────────────────────────────

// Network First: tenta rede, cai para cache se offline
async function networkFirst(request) {
  try {
    const resposta = await fetch(request);
    if (resposta.ok) {
      const cache = await caches.open(CACHE_DINAMICO);
      cache.put(request, resposta.clone());
    }
    return resposta;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    // Fallback para página offline
    return caches.match('/login.html');
  }
}

// Cache First: retorna cache, busca rede só se não tiver
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const resposta = await fetch(request);
    if (resposta.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, resposta.clone());
    }
    return resposta;
  } catch (err) {
    return new Response('Recurso não disponível offline.', { status: 503 });
  }
}

// Stale While Revalidate: entrega cache instantaneamente, atualiza em background
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_DINAMICO);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then(resposta => {
    if (resposta.ok) cache.put(request, resposta.clone());
    return resposta;
  }).catch(() => null);

  return cached || fetchPromise;
}

// ── SINCRONIZAÇÃO EM BACKGROUND ──────────────────────────
self.addEventListener('sync', event => {
  if (event.tag === 'sync-redacoes') {
    event.waitUntil(sincronizarRedacoes());
  }
});

async function sincronizarRedacoes() {
  // Em produção: busca redações pendentes no IndexedDB e envia ao Supabase
  console.log('[RedaON SW] Sincronizando redações pendentes...');
  const db = await abrirIndexedDB();
  const pendentes = await db.getAll('redacoes_pendentes');
  for (const redacao of pendentes) {
    try {
      await fetch('/api/redacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(redacao),
      });
      await db.delete('redacoes_pendentes', redacao.id);
    } catch (err) {
      console.warn('[RedaON SW] Falha ao sincronizar redação:', redacao.id);
    }
  }
}

// ── PUSH NOTIFICATIONS ────────────────────────────────────
self.addEventListener('push', event => {
  const data = event.data?.json() ?? {};
  const titulo = data.titulo || 'RedaON';
  const corpo  = data.corpo  || 'Você tem uma novidade na RedaON!';
  const icone  = data.icone  || '/icons/icon-192.png';
  const url    = data.url    || '/inicio.html';

  event.waitUntil(
    self.registration.showNotification(titulo, {
      body: corpo,
      icon: icone,
      badge: '/icons/icon-72.png',
      vibrate: [200, 100, 200],
      data: { url },
      actions: [
        { action: 'abrir',  title: '📖 Abrir',  icon: '/icons/icon-96.png' },
        { action: 'fechar', title: '✕ Fechar' },
      ],
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'fechar') return;
  const url = event.notification.data?.url || '/inicio.html';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

// ── INDEXEDDB HELPER ─────────────────────────────────────
function abrirIndexedDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('redaon-offline', 1);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('redacoes_pendentes')) {
        db.createObjectStore('redacoes_pendentes', { keyPath: 'id' });
      }
    };
    req.onsuccess = e => resolve(e.target.result);
    req.onerror   = e => reject(e.target.error);
  });
}

console.log('[RedaON SW] Service Worker carregado — versão', CACHE_NAME);
