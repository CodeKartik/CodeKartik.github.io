'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/AssetManifest.json": "9049c4d73f37133539f9c1a2f1fa71cc",
"assets/assets/font/Poppins-Bold.ttf": "a3e0b5f427803a187c1b62c5919196aa",
"assets/assets/font/Poppins-Regular.ttf": "8b6af8e5e8324edfd77af8b3b35d7f9c",
"assets/assets/font/Poppins.ttf": "544fa4f2678a8285eb88b8dfe503c90c",
"assets/assets/font/SF_Pro.ttf": "d09549c1ab4a5947a007561521e45da3",
"assets/assets/Icon/arrow.png": "22f0288f83f8feed3406f7640eaa179a",
"assets/assets/Icon/call.png": "5b440c14d989000af2276308359709c1",
"assets/assets/Icon/direction.png": "482cead35f52ed3ab819e5454a35bfac",
"assets/assets/Icon/github.png": "b37b05a713d8eebcbb475119e587859b",
"assets/assets/Icon/ideas.png": "060fa0ea89fc7558b1e9a18a4af02e25",
"assets/assets/Icon/instagram.png": "0634a5babf36db50e415356b348e3f30",
"assets/assets/Icon/linktree.png": "408c6fd27fff32d19d1c9b946ce8e9bb",
"assets/assets/Icon/paper-plane.png": "7c97afc4b59f5a3bdc07b0960e5a33a3",
"assets/assets/images/apple.png": "3da1bc4a94271fa3852f731dc28c54a4",
"assets/assets/images/deskqr.png": "fc92f691765f2b1d5041dab6ad682e38",
"assets/assets/images/enkp.png": "37a29a37e94d56e676d6f9868c46c135",
"assets/assets/images/git.png": "814b2696889cfcd3bcfe4624ba57569d",
"assets/assets/images/me.jpeg": "5a1b92fdcb2262528d2b2028eebe38bc",
"assets/assets/images/Mobapple.png": "821815b1c7be8fa0755003ac5f33c140",
"assets/assets/images/Mobenkp.png": "de23dc995ce034f548d7cd54691c4c02",
"assets/assets/images/Mobgit.png": "8562bfe7936e6bc0eb85a1a2ae90b7b3",
"assets/assets/images/MobYoga.png": "6b12008c90dcad9669120e94b785befd",
"assets/assets/images/okqr.png": "669af1e2dfaa71722f7bac9be618ed92",
"assets/assets/images/okqr1.png": "3b885adeb2d96739800387b458c29656",
"assets/assets/images/pfp.png": "c1ee197b75840293e3d4078c176d2c55",
"assets/assets/images/Resume.pdf": "c251eb21a27e3a092849baad350e6366",
"assets/assets/images/yoga.png": "701703fd36f448143229ae3db7dac0c8",
"assets/FontManifest.json": "724862e4030ec5bd04c9242e7cedd85d",
"assets/fonts/MaterialIcons-Regular.otf": "4e6447691c9509f7acdbf8a931a85ca1",
"assets/NOTICES": "2d7d40f814a996496872b5e9e856acc5",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"favicon.ico": "9edfd860ae09e63d3e8a7923e79a92fe",
"icons/Icon-192.png": "c088b3888f95af77a28c1e4e848e7449",
"icons/Icon-512.png": "be463e21557c37c176aabea3102936b3",
"index.html": "b0917416869fc62f39fc1948a12f2c65",
"/": "b0917416869fc62f39fc1948a12f2c65",
"main.dart.js": "640d53dc35d1ff6ef93a92ea03ef83a4",
"manifest.json": "05dc6f5b87600192aa1fad6c55decb6c",
"version.json": "426313f2f3133c2f20415344c4a22df3"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
