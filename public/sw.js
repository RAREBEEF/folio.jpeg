if(!self.define){let e,s={};const t=(t,a)=>(t=new URL(t+".js",a).href,s[t]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=t,e.onload=s,document.head.appendChild(e)}else e=t,importScripts(t),s()})).then((()=>{let e=s[t];if(!e)throw new Error(`Module ${t} didn’t register its module`);return e})));self.define=(a,c)=>{const i=e||("document"in self?document.currentScript.src:"")||location.href;if(s[i])return;let n={};const r=e=>t(e,i),d={module:{uri:i},exports:n,require:r};s[i]=Promise.all(a.map((e=>d[e]||r(e)))).then((e=>(c(...e),n)))}}define(["./workbox-07a7b4f2"],(function(e){"use strict";importScripts(),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/_next/app-build-manifest.json",revision:"c5176b27936fc7c1a07daed3d29a6b82"},{url:"/_next/static/OcJgUCvttsE2dsO5K2JTM/_buildManifest.js",revision:"2ec694eb52ae4f523f265a46bae4d768"},{url:"/_next/static/OcJgUCvttsE2dsO5K2JTM/_ssgManifest.js",revision:"b6652df95db52feb4daf4eca35380933"},{url:"/_next/static/chunks/140-854faf83f61828a2.js",revision:"OcJgUCvttsE2dsO5K2JTM"},{url:"/_next/static/chunks/23-0357ae4796ed29c7.js",revision:"OcJgUCvttsE2dsO5K2JTM"},{url:"/_next/static/chunks/4-388bc02acc8c3806.js",revision:"OcJgUCvttsE2dsO5K2JTM"},{url:"/_next/static/chunks/569-c061f55bd6038ae6.js",revision:"OcJgUCvttsE2dsO5K2JTM"},{url:"/_next/static/chunks/662-af03523d595dfbe7.js",revision:"OcJgUCvttsE2dsO5K2JTM"},{url:"/_next/static/chunks/993-8f1d22570227bc2b.js",revision:"OcJgUCvttsE2dsO5K2JTM"},{url:"/_next/static/chunks/app/%5BdisplayId%5D/%5BfolderName%5D/page-f4501067062fbe77.js",revision:"OcJgUCvttsE2dsO5K2JTM"},{url:"/_next/static/chunks/app/%5BdisplayId%5D/page-9b4a779e48374b84.js",revision:"OcJgUCvttsE2dsO5K2JTM"},{url:"/_next/static/chunks/app/_not-found/page-7f6f468828c7404f.js",revision:"OcJgUCvttsE2dsO5K2JTM"},{url:"/_next/static/chunks/app/edit/%5Bid%5D/page-6c53ef53fd932c4d.js",revision:"OcJgUCvttsE2dsO5K2JTM"},{url:"/_next/static/chunks/app/error-cc323c0859a851bc.js",revision:"OcJgUCvttsE2dsO5K2JTM"},{url:"/_next/static/chunks/app/image/%5Bid%5D/page-d262d7c2efc445ba.js",revision:"OcJgUCvttsE2dsO5K2JTM"},{url:"/_next/static/chunks/app/layout-9ab2818a999a911d.js",revision:"OcJgUCvttsE2dsO5K2JTM"},{url:"/_next/static/chunks/app/page-a1a8356aa6d30ebb.js",revision:"OcJgUCvttsE2dsO5K2JTM"},{url:"/_next/static/chunks/app/upload/page-00c3b0cb1bef99c9.js",revision:"OcJgUCvttsE2dsO5K2JTM"},{url:"/_next/static/chunks/bc9e92e6-d19e8d5b83572c15.js",revision:"OcJgUCvttsE2dsO5K2JTM"},{url:"/_next/static/chunks/db5416bc-c7e0cf720806b06c.js",revision:"OcJgUCvttsE2dsO5K2JTM"},{url:"/_next/static/chunks/dc112a36-4627e70196a7f48b.js",revision:"OcJgUCvttsE2dsO5K2JTM"},{url:"/_next/static/chunks/e37a0b60-b74be3d42787b18d.js",revision:"OcJgUCvttsE2dsO5K2JTM"},{url:"/_next/static/chunks/f4e5f4e1-c5b656875a941439.js",revision:"OcJgUCvttsE2dsO5K2JTM"},{url:"/_next/static/chunks/fd9d1056-22522fa00b21828a.js",revision:"OcJgUCvttsE2dsO5K2JTM"},{url:"/_next/static/chunks/framework-f66176bb897dc684.js",revision:"OcJgUCvttsE2dsO5K2JTM"},{url:"/_next/static/chunks/main-7d6d7382da6272e0.js",revision:"OcJgUCvttsE2dsO5K2JTM"},{url:"/_next/static/chunks/main-app-8796b9af140ba2aa.js",revision:"OcJgUCvttsE2dsO5K2JTM"},{url:"/_next/static/chunks/pages/_app-6a626577ffa902a4.js",revision:"OcJgUCvttsE2dsO5K2JTM"},{url:"/_next/static/chunks/pages/_error-1be831200e60c5c0.js",revision:"OcJgUCvttsE2dsO5K2JTM"},{url:"/_next/static/chunks/polyfills-78c92fac7aa8fdd8.js",revision:"79330112775102f91e1010318bae2bd3"},{url:"/_next/static/chunks/webpack-691660acc16726d2.js",revision:"OcJgUCvttsE2dsO5K2JTM"},{url:"/_next/static/css/433b96617f7c79ea.css",revision:"433b96617f7c79ea"},{url:"/_next/static/media/05a31a2ca4975f99-s.woff2",revision:"f1b44860c66554b91f3b1c81556f73ca"},{url:"/_next/static/media/513657b02c5c193f-s.woff2",revision:"c4eb7f37bc4206c901ab08601f21f0f2"},{url:"/_next/static/media/51ed15f9841b9f9d-s.woff2",revision:"bb9d99fb9bbc695be80777ca2c1c2bee"},{url:"/_next/static/media/c9a5bc6a7c948fb0-s.p.woff2",revision:"74c3556b9dad12fb76f84af53ba69410"},{url:"/_next/static/media/d6b16ce4a6175f26-s.woff2",revision:"dd930bafc6297347be3213f22cc53d3e"},{url:"/_next/static/media/ec159349637c90ad-s.woff2",revision:"0e89df9522084290e01e4127495fae99"},{url:"/_next/static/media/favicon.3714fa75.ico",revision:"66d1c37ba4d0f710b17db202a1f13327"},{url:"/_next/static/media/fd4db3eb5472fc27-s.woff2",revision:"71f3fcaf22131c3368d9ec28ef839831"},{url:"/_next/static/media/gemini-logo.2510b7f5.png",revision:"f244a29c86c192aded5ab4af6649dfbf"},{url:"/_next/static/media/logo.cd3c72f7.png",revision:"7e827da60a41b09c437744de6882dc4f"},{url:"/_next/static/media/user-solid.caea4aa6.png",revision:"784c9f68db4858fbb4d453086da185c4"},{url:"/firebase-messaging-sw.js",revision:"c35c844e12da3e22dc5abd2779d8fd88"},{url:"/images/icon-192x192.png",revision:"b951814af1fd3cfdf04e85ce069e973c"},{url:"/images/icon-256x256.png",revision:"6be3ebc5e7765bb223452156de06ad53"},{url:"/images/icon-384x384.png",revision:"26c432562eaf00d6b579fa21a220790d"},{url:"/images/icon-512x512.png",revision:"0cd596ac79296b33422710d40fd19697"},{url:"/manifest.json",revision:"3616a49592ab08a6d93d40536cde4ebe"}],{ignoreURLParametersMatching:[]}),e.cleanupOutdatedCaches(),e.registerRoute("/",new e.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:async({request:e,response:s,event:t,state:a})=>s&&"opaqueredirect"===s.type?new Response(s.body,{status:200,statusText:"OK",headers:s.headers}):s}]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,new e.CacheFirst({cacheName:"google-fonts-webfonts",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:31536e3})]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,new e.StaleWhileRevalidate({cacheName:"google-fonts-stylesheets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,new e.StaleWhileRevalidate({cacheName:"static-font-assets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,new e.StaleWhileRevalidate({cacheName:"static-image-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/image\?url=.+$/i,new e.StaleWhileRevalidate({cacheName:"next-image",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp3|wav|ogg)$/i,new e.CacheFirst({cacheName:"static-audio-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp4)$/i,new e.CacheFirst({cacheName:"static-video-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:js)$/i,new e.StaleWhileRevalidate({cacheName:"static-js-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:css|less)$/i,new e.StaleWhileRevalidate({cacheName:"static-style-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/data\/.+\/.+\.json$/i,new e.StaleWhileRevalidate({cacheName:"next-data",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:json|xml|csv)$/i,new e.NetworkFirst({cacheName:"static-data-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;const s=e.pathname;return!s.startsWith("/api/auth/")&&!!s.startsWith("/api/")}),new e.NetworkFirst({cacheName:"apis",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:16,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;return!e.pathname.startsWith("/api/")}),new e.NetworkFirst({cacheName:"others",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>!(self.origin===e.origin)),new e.NetworkFirst({cacheName:"cross-origin",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:3600})]}),"GET")}));
