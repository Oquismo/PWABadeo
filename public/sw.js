if (!self.define) {
  let e,
    s = {};
  const a = (a, n) => (
    (a = new URL(a + ".js", n).href),
    s[a] ||
      new Promise((s) => {
        if ("document" in self) {
          const e = document.createElement("script");
          (e.src = a), (e.onload = s), document.head.appendChild(e);
        } else (e = a), importScripts(a), s();
      }).then(() => {
        let e = s[a];
        if (!e) throw new Error(`Module ${a} didn’t register its module`);
        return e;
      })
  );
  self.define = (n, i) => {
    const c =
      e ||
      ("document" in self ? document.currentScript.src : "") ||
      location.href;
    if (s[c]) return;
    let t = {};
    const r = (e) => a(e, c),
      o = { module: { uri: c }, exports: t, require: r };
    s[c] = Promise.all(n.map((e) => o[e] || r(e))).then((e) => (i(...e), t));
  };
}
define(["./workbox-f1770938"], function (e) {
  "use strict";
  importScripts(),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        {
          url: "/231106670998.zip",
          revision: "9375e215f01da4e63bc8341438dd8991",
        },
        { url: "/Readme.html", revision: "4924e096926cc19fb7d6ad72c9f23d68" },
        {
          url: "/_next/static/chunks/15-c56d396c00762f2e.js",
          revision: "mkT8Yn-97C6FlAF_2aAX2",
        },
        {
          url: "/_next/static/chunks/157-447705cb833a5ce2.js",
          revision: "mkT8Yn-97C6FlAF_2aAX2",
        },
        {
          url: "/_next/static/chunks/18-215308f0056cb18c.js",
          revision: "mkT8Yn-97C6FlAF_2aAX2",
        },
        {
          url: "/_next/static/chunks/190-f7b19d1496837aae.js",
          revision: "mkT8Yn-97C6FlAF_2aAX2",
        },
        {
          url: "/_next/static/chunks/22-4cd13f14a6c1abb1.js",
          revision: "mkT8Yn-97C6FlAF_2aAX2",
        },
        {
          url: "/_next/static/chunks/231-285995b327847af4.js",
          revision: "mkT8Yn-97C6FlAF_2aAX2",
        },
        {
          url: "/_next/static/chunks/233-50a9ea5cc451aa0d.js",
          revision: "mkT8Yn-97C6FlAF_2aAX2",
        },
        {
          url: "/_next/static/chunks/291-93e28a6408b27b08.js",
          revision: "mkT8Yn-97C6FlAF_2aAX2",
        },
        {
          url: "/_next/static/chunks/326-6f9737e7a3ef9824.js",
          revision: "mkT8Yn-97C6FlAF_2aAX2",
        },
        {
          url: "/_next/static/chunks/349-34f9b030511e7574.js",
          revision: "mkT8Yn-97C6FlAF_2aAX2",
        },
        {
          url: "/_next/static/chunks/355-ba9793ed070d50fd.js",
          revision: "mkT8Yn-97C6FlAF_2aAX2",
        },
        {
          url: "/_next/static/chunks/37-e43c891b23bf307b.js",
          revision: "mkT8Yn-97C6FlAF_2aAX2",
        },
        {
          url: "/_next/static/chunks/418-63e05ddf80f57256.js",
          revision: "mkT8Yn-97C6FlAF_2aAX2",
        },
        {
          url: "/_next/static/chunks/453-44d0345736955a90.js",
          revision: "mkT8Yn-97C6FlAF_2aAX2",
        },
        {
          url: "/_next/static/chunks/639.a6352c132437f280.js",
          revision: "a6352c132437f280",
        },
        {
          url: "/_next/static/chunks/659-109582f36ad398b1.js",
          revision: "mkT8Yn-97C6FlAF_2aAX2",
        },
        {
          url: "/_next/static/chunks/688-a47b5ada4c028a50.js",
          revision: "mkT8Yn-97C6FlAF_2aAX2",
        },
        {
          url: "/_next/static/chunks/87-7496eda7f55f348b.js",
          revision: "mkT8Yn-97C6FlAF_2aAX2",
        },
        {
          url: "/_next/static/chunks/882-1437f79172334fb2.js",
          revision: "mkT8Yn-97C6FlAF_2aAX2",
        },
        {
          url: "/_next/static/chunks/89-38210c9639460667.js",
          revision: "mkT8Yn-97C6FlAF_2aAX2",
        },
        {
          url: "/_next/static/chunks/924.6603f1d0e39015e4.js",
          revision: "6603f1d0e39015e4",
        },
        {
          url: "/_next/static/chunks/983-9a7c94b5ca245d88.js",
          revision: "mkT8Yn-97C6FlAF_2aAX2",
        },
        {
          url: "/_next/static/chunks/app/_not-found/page-7052ac822df7928e.js",
          revision: "mkT8Yn-97C6FlAF_2aAX2",
        },
        {
          url: "/_next/static/chunks/app/admin/page-21c7aec69d8fb290.js",
          revision: "mkT8Yn-97C6FlAF_2aAX2",
        },
        {
          url: "/_next/static/chunks/app/ajustes/page-3fe069c5a3a4745d.js",
          revision: "mkT8Yn-97C6FlAF_2aAX2",
        },
        {
          url: "/_next/static/chunks/app/checklist/page-92df9ebdcfd67dd4.js",
          revision: "mkT8Yn-97C6FlAF_2aAX2",
        },
        {
          url: "/_next/static/chunks/app/informacion/page-ba7be1495fa61c65.js",
          revision: "mkT8Yn-97C6FlAF_2aAX2",
        },
        {
          url: "/_next/static/chunks/app/layout-0cfaf783a7be8e24.js",
          revision: "mkT8Yn-97C6FlAF_2aAX2",
        },
        {
          url: "/_next/static/chunks/app/login/page-ed71c9333e7e3849.js",
          revision: "mkT8Yn-97C6FlAF_2aAX2",
        },
        {
          url: "/_next/static/chunks/app/mapa/page-18673c6b8b021af5.js",
          revision: "mkT8Yn-97C6FlAF_2aAX2",
        },
        {
          url: "/_next/static/chunks/app/page-27fc10a7a0471ca3.js",
          revision: "mkT8Yn-97C6FlAF_2aAX2",
        },
        {
          url: "/_next/static/chunks/app/perfil/editar/page-73fd809c267368e1.js",
          revision: "mkT8Yn-97C6FlAF_2aAX2",
        },
        {
          url: "/_next/static/chunks/app/perfil/page-41858d5025c8496d.js",
          revision: "mkT8Yn-97C6FlAF_2aAX2",
        },
        {
          url: "/_next/static/chunks/app/proyectos/%5BprojectId%5D/page-ebad84b9dadc496a.js",
          revision: "mkT8Yn-97C6FlAF_2aAX2",
        },
        {
          url: "/_next/static/chunks/app/proyectos/page-d854a02a7027ce73.js",
          revision: "mkT8Yn-97C6FlAF_2aAX2",
        },
        {
          url: "/_next/static/chunks/app/registro/page-d00d1e8befac85a0.js",
          revision: "mkT8Yn-97C6FlAF_2aAX2",
        },
        {
          url: "/_next/static/chunks/app/servicios/page-9e53dd9660082c51.js",
          revision: "mkT8Yn-97C6FlAF_2aAX2",
        },
        {
          url: "/_next/static/chunks/app/telefonos/page-9b08e49a02b388d3.js",
          revision: "mkT8Yn-97C6FlAF_2aAX2",
        },
        {
          url: "/_next/static/chunks/d0deef33.48d820d4c497da28.js",
          revision: "48d820d4c497da28",
        },
        {
          url: "/_next/static/chunks/fd9d1056-a1c8b2deb8c02b00.js",
          revision: "mkT8Yn-97C6FlAF_2aAX2",
        },
        {
          url: "/_next/static/chunks/framework-00a8ba1a63cfdc9e.js",
          revision: "mkT8Yn-97C6FlAF_2aAX2",
        },
        {
          url: "/_next/static/chunks/main-app-2ec7934463052078.js",
          revision: "mkT8Yn-97C6FlAF_2aAX2",
        },
        {
          url: "/_next/static/chunks/main-b2e6d1b31d3909af.js",
          revision: "mkT8Yn-97C6FlAF_2aAX2",
        },
        {
          url: "/_next/static/chunks/pages/_app-037b5d058bd9a820.js",
          revision: "mkT8Yn-97C6FlAF_2aAX2",
        },
        {
          url: "/_next/static/chunks/pages/_error-6ae619510b1539d6.js",
          revision: "mkT8Yn-97C6FlAF_2aAX2",
        },
        {
          url: "/_next/static/chunks/polyfills-78c92fac7aa8fdd8.js",
          revision: "79330112775102f91e1010318bae2bd3",
        },
        {
          url: "/_next/static/chunks/webpack-e7feab87ec903284.js",
          revision: "mkT8Yn-97C6FlAF_2aAX2",
        },
        {
          url: "/_next/static/css/275ed64cc4367444.css",
          revision: "275ed64cc4367444",
        },
        {
          url: "/_next/static/css/527d6b2354cb9d1d.css",
          revision: "527d6b2354cb9d1d",
        },
        {
          url: "/_next/static/css/d3e383b9ef67ddcb.css",
          revision: "d3e383b9ef67ddcb",
        },
        {
          url: "/_next/static/media/26a46d62cd723877-s.woff2",
          revision: "befd9c0fdfa3d8a645d5f95717ed6420",
        },
        {
          url: "/_next/static/media/55c55f0601d81cf3-s.woff2",
          revision: "43828e14271c77b87e3ed582dbff9f74",
        },
        {
          url: "/_next/static/media/581909926a08bbc8-s.woff2",
          revision: "f0b86e7c24f455280b8df606b89af891",
        },
        {
          url: "/_next/static/media/8e9860b6e62d6359-s.woff2",
          revision: "01ba6c2a184b8cba08b0d57167664d75",
        },
        {
          url: "/_next/static/media/97e0cb1ae144a2a9-s.woff2",
          revision: "e360c61c5bd8d90639fd4503c829c2dc",
        },
        {
          url: "/_next/static/media/df0a9ae256c0569c-s.woff2",
          revision: "d54db44de5ccb18886ece2fda72bdfe0",
        },
        {
          url: "/_next/static/media/e4af272ccee01ff0-s.p.woff2",
          revision: "65850a373e258f1c897a2b3d75eb74de",
        },
        {
          url: "/_next/static/media/layers-2x.9859cd12.png",
          revision: "9859cd12",
        },
        {
          url: "/_next/static/media/layers.ef6db872.png",
          revision: "ef6db872",
        },
        {
          url: "/_next/static/media/marker-icon.d577052a.png",
          revision: "d577052a",
        },
        {
          url: "/_next/static/mkT8Yn-97C6FlAF_2aAX2/_buildManifest.js",
          revision: "a0ae24e7f29dd3809ab75b5dd91a79dc",
        },
        {
          url: "/_next/static/mkT8Yn-97C6FlAF_2aAX2/_ssgManifest.js",
          revision: "b6652df95db52feb4daf4eca35380933",
        },
        {
          url: "/com.myapp.pwa.zip",
          revision: "95a5be57bc3f0a7f41589162e8b071c5",
        },
        { url: "/file.svg", revision: "d09f95206c3fa0bb9bd9fefabfd0ea71" },
        { url: "/globe.svg", revision: "2aaafa6a49b6563925fe440891e32717" },
        {
          url: "/icons/about.txt",
          revision: "a5e229bbf9e5da9633cf6de148681fe9",
        },
        {
          url: "/icons/android-chrome-192x192.png",
          revision: "a206821b0b6678d98bf84669842afdc2",
        },
        {
          url: "/icons/android-chrome-512x512.png",
          revision: "7a47d19c0def285d584cfa847a3a8131",
        },
        {
          url: "/icons/apple-icon-180.png",
          revision: "0f319c1f6b6f4dec8cc17b6120be043f",
        },
        {
          url: "/icons/apple-touch-icon.png",
          revision: "7a9da462265c69220e0fd91bde9af3d9",
        },
        {
          url: "/icons/favicon-16x16.png",
          revision: "ec34518ef247be0d71074ea81261d53e",
        },
        {
          url: "/icons/favicon-32x32.png",
          revision: "a81a26a26527cdb59e75e90a97ea07f6",
        },
        {
          url: "/icons/favicon.ico",
          revision: "1806847958046bc9c9fc68c9f7aedfcb",
        },
        {
          url: "/icons/icon_512x512.png",
          revision: "7a47d19c0def285d584cfa847a3a8131",
        },
        {
          url: "/icons/icon_512x512.png.png",
          revision: "7a47d19c0def285d584cfa847a3a8131",
        },
        {
          url: "/icons/manifest-icon-192.maskable.png",
          revision: "336d41084f7a1dbe737ef37951f22c48",
        },
        {
          url: "/icons/manifest-icon-512.maskable.png",
          revision: "3fd8c86545f9d84ed7a23dcbe97503e7",
        },
        {
          url: "/icons/site.webmanifest",
          revision: "053100cb84a50d2ae7f5492f7dd7f25e",
        },
        { url: "/img/logo.png", revision: "387f3dd81dc86c16510a2a40e8d5cd2d" },
        { url: "/manifest.json", revision: "5af1680d2a8f73865026d0251c48afc3" },
        { url: "/next.svg", revision: "8e061864f388b47f33a1c3780831193e" },
        { url: "/vercel.svg", revision: "c0af2f507b369b085b35ef4bbe3bcf1e" },
        { url: "/window.svg", revision: "a2760511c65806022ad20adf74370ff3" },
      ],
      { ignoreURLParametersMatching: [/^utm_/, /^fbclid$/] }
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      "/",
      new e.NetworkFirst({
        cacheName: "start-url",
        plugins: [
          {
            cacheWillUpdate: async ({ response: e }) =>
              e && "opaqueredirect" === e.type
                ? new Response(e.body, {
                    status: 200,
                    statusText: "OK",
                    headers: e.headers,
                  })
                : e,
          },
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      new e.CacheFirst({
        cacheName: "google-fonts-webfonts",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      new e.StaleWhileRevalidate({
        cacheName: "google-fonts-stylesheets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-font-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-image-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 2592e3 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\/_next\/static.+\.js$/i,
      new e.CacheFirst({
        cacheName: "next-static-js-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\/_next\/image\?url=.+$/i,
      new e.StaleWhileRevalidate({
        cacheName: "next-image",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:mp3|wav|ogg)$/i,
      new e.CacheFirst({
        cacheName: "static-audio-assets",
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:mp4|webm)$/i,
      new e.CacheFirst({
        cacheName: "static-video-assets",
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:js)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-js-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 48, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:css|less)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-style-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\/_next\/data\/.+\/.+\.json$/i,
      new e.StaleWhileRevalidate({
        cacheName: "next-data",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:json|xml|csv)$/i,
      new e.NetworkFirst({
        cacheName: "static-data-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      ({ sameOrigin: e, url: { pathname: s } }) =>
        !(!e || s.startsWith("/api/auth/callback") || !s.startsWith("/api/")),
      new e.NetworkFirst({
        cacheName: "apis",
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      ({ request: e, url: { pathname: s }, sameOrigin: a }) =>
        "1" === e.headers.get("RSC") &&
        "1" === e.headers.get("Next-Router-Prefetch") &&
        a &&
        !s.startsWith("/api/"),
      new e.NetworkFirst({
        cacheName: "pages-rsc-prefetch",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      ({ request: e, url: { pathname: s }, sameOrigin: a }) =>
        "1" === e.headers.get("RSC") && a && !s.startsWith("/api/"),
      new e.NetworkFirst({
        cacheName: "pages-rsc",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      ({ url: { pathname: e }, sameOrigin: s }) => s && !e.startsWith("/api/"),
      new e.NetworkFirst({
        cacheName: "pages",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      ({ sameOrigin: e }) => !e,
      new e.NetworkFirst({
        cacheName: "cross-origin",
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 3600 }),
        ],
      }),
      "GET"
    );
});
