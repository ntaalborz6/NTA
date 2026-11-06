// سرویس‌ورکر: فقط فایل‌های خود برنامه را کش می‌کند؛ درخواست‌های API (گوگل) هرگز کش نمی‌شوند.
const CACHE = 'cooler-app-v2';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return;   // API و فونت: بدون دخالت
  // اول شبکه (برای گرفتن آخرین نسخه)، اگر آفلاین بود از کش
  e.respondWith(fetch(r).then(res => {
    const copy = res.clone(); caches.open(CACHE).then(c => c.put(r, copy)); return res;
  }).catch(() => caches.match(r).then(m => m || caches.match('./index.html'))));
});
