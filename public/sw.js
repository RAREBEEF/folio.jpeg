if(!self.define){let e,s={};const a=(a,i)=>(a=new URL(a+".js",i).href,s[a]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=a,e.onload=s,document.head.appendChild(e)}else e=a,importScripts(a),s()})).then((()=>{let e=s[a];if(!e)throw new Error(`Module ${a} didn’t register its module`);return e})));self.define=(i,n)=>{const t=e||("document"in self?document.currentScript.src:"")||location.href;if(s[t])return;let c={};const f=e=>a(e,t),r={module:{uri:t},exports:c,require:f};s[t]=Promise.all(i.map((e=>r[e]||f(e)))).then((e=>(n(...e),c)))}}define(["./workbox-07a7b4f2"],(function(e){"use strict";importScripts(),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/_next/app-build-manifest.json",revision:"a25e6000ec4f30fd3a56f6c3d14b5852"},{url:"/_next/static/3Tt113TwtSf0KGxgJdQF3/_buildManifest.js",revision:"2ec694eb52ae4f523f265a46bae4d768"},{url:"/_next/static/3Tt113TwtSf0KGxgJdQF3/_ssgManifest.js",revision:"b6652df95db52feb4daf4eca35380933"},{url:"/_next/static/chunks/140-450c93d4c339b087.js",revision:"3Tt113TwtSf0KGxgJdQF3"},{url:"/_next/static/chunks/197-fe2c3f0ff9eddb47.js",revision:"3Tt113TwtSf0KGxgJdQF3"},{url:"/_next/static/chunks/23-f680d2e252cd3fe8.js",revision:"3Tt113TwtSf0KGxgJdQF3"},{url:"/_next/static/chunks/357-5aef7b67f35b1e1f.js",revision:"3Tt113TwtSf0KGxgJdQF3"},{url:"/_next/static/chunks/368-33bd2e62adf16812.js",revision:"3Tt113TwtSf0KGxgJdQF3"},{url:"/_next/static/chunks/662-13d3da4012470cda.js",revision:"3Tt113TwtSf0KGxgJdQF3"},{url:"/_next/static/chunks/756-b6aa93bedc881580.js",revision:"3Tt113TwtSf0KGxgJdQF3"},{url:"/_next/static/chunks/app/%5BdisplayId%5D/%5BfolderName%5D/page-0740634dc7772dd7.js",revision:"3Tt113TwtSf0KGxgJdQF3"},{url:"/_next/static/chunks/app/%5BdisplayId%5D/page-d48b035c946a488e.js",revision:"3Tt113TwtSf0KGxgJdQF3"},{url:"/_next/static/chunks/app/_not-found/page-b5de16407f464c57.js",revision:"3Tt113TwtSf0KGxgJdQF3"},{url:"/_next/static/chunks/app/edit/%5Bid%5D/page-208cae09462917ff.js",revision:"3Tt113TwtSf0KGxgJdQF3"},{url:"/_next/static/chunks/app/error-2f53a2de82e4e7d9.js",revision:"3Tt113TwtSf0KGxgJdQF3"},{url:"/_next/static/chunks/app/image/%5Bid%5D/page-0719689084cbe704.js",revision:"3Tt113TwtSf0KGxgJdQF3"},{url:"/_next/static/chunks/app/layout-4a012e8f96d158bf.js",revision:"3Tt113TwtSf0KGxgJdQF3"},{url:"/_next/static/chunks/app/page-272d9b3a072e373d.js",revision:"3Tt113TwtSf0KGxgJdQF3"},{url:"/_next/static/chunks/app/search/page-31459afc501005af.js",revision:"3Tt113TwtSf0KGxgJdQF3"},{url:"/_next/static/chunks/app/upload/page-3801f844381e2dbe.js",revision:"3Tt113TwtSf0KGxgJdQF3"},{url:"/_next/static/chunks/bc9e92e6-165f3fba8d9a196b.js",revision:"3Tt113TwtSf0KGxgJdQF3"},{url:"/_next/static/chunks/db5416bc-c7e0cf720806b06c.js",revision:"3Tt113TwtSf0KGxgJdQF3"},{url:"/_next/static/chunks/dc112a36-4627e70196a7f48b.js",revision:"3Tt113TwtSf0KGxgJdQF3"},{url:"/_next/static/chunks/e37a0b60-b74be3d42787b18d.js",revision:"3Tt113TwtSf0KGxgJdQF3"},{url:"/_next/static/chunks/f4e5f4e1-0137dde8720e21ed.js",revision:"3Tt113TwtSf0KGxgJdQF3"},{url:"/_next/static/chunks/fd9d1056-f0974bc0e994f171.js",revision:"3Tt113TwtSf0KGxgJdQF3"},{url:"/_next/static/chunks/framework-f66176bb897dc684.js",revision:"3Tt113TwtSf0KGxgJdQF3"},{url:"/_next/static/chunks/main-app-8796b9af140ba2aa.js",revision:"3Tt113TwtSf0KGxgJdQF3"},{url:"/_next/static/chunks/main-d29a0a785cc97c15.js",revision:"3Tt113TwtSf0KGxgJdQF3"},{url:"/_next/static/chunks/pages/_app-6a626577ffa902a4.js",revision:"3Tt113TwtSf0KGxgJdQF3"},{url:"/_next/static/chunks/pages/_error-1be831200e60c5c0.js",revision:"3Tt113TwtSf0KGxgJdQF3"},{url:"/_next/static/chunks/polyfills-78c92fac7aa8fdd8.js",revision:"79330112775102f91e1010318bae2bd3"},{url:"/_next/static/chunks/webpack-691660acc16726d2.js",revision:"3Tt113TwtSf0KGxgJdQF3"},{url:"/_next/static/css/48bac8ff0e995333.css",revision:"48bac8ff0e995333"},{url:"/_next/static/media/05a31a2ca4975f99-s.woff2",revision:"f1b44860c66554b91f3b1c81556f73ca"},{url:"/_next/static/media/513657b02c5c193f-s.woff2",revision:"c4eb7f37bc4206c901ab08601f21f0f2"},{url:"/_next/static/media/51ed15f9841b9f9d-s.woff2",revision:"bb9d99fb9bbc695be80777ca2c1c2bee"},{url:"/_next/static/media/c9a5bc6a7c948fb0-s.p.woff2",revision:"74c3556b9dad12fb76f84af53ba69410"},{url:"/_next/static/media/d6b16ce4a6175f26-s.woff2",revision:"dd930bafc6297347be3213f22cc53d3e"},{url:"/_next/static/media/ec159349637c90ad-s.woff2",revision:"0e89df9522084290e01e4127495fae99"},{url:"/_next/static/media/favicon.7704ef0b.ico",revision:"857302f0dd885daa95f352ae385bbd55"},{url:"/_next/static/media/fd4db3eb5472fc27-s.woff2",revision:"71f3fcaf22131c3368d9ec28ef839831"},{url:"/_next/static/media/gemini-logo.2510b7f5.png",revision:"f244a29c86c192aded5ab4af6649dfbf"},{url:"/_next/static/media/logo-theme-no-bg.5e06479f.png",revision:"2d4c7536d3a6bcc525815069f12335ef"},{url:"/_next/static/media/logo.ff87b1f2.png",revision:"32d239767b2a8bd9d1723cf1b431a3f4"},{url:"/_next/static/media/user-solid.1b8f704b.png",revision:"a6c7b16e9ab41f9b1d751508f90b07de"},{url:"/firebase-messaging-sw.js",revision:"c35c844e12da3e22dc5abd2779d8fd88"},{url:"/images/apple-touch-icon-114x114.png",revision:"d2bf8e8d762033270490f4a5c1be835f"},{url:"/images/apple-touch-icon-120x120.png",revision:"e4d23b6ae8630b27852d4db4e6d750a8"},{url:"/images/apple-touch-icon-144x144.png",revision:"59c25f6b077b525eb4391bdfb38dbd47"},{url:"/images/apple-touch-icon-152x152.png",revision:"98a617a0557e5adb504df1f557d9e440"},{url:"/images/apple-touch-icon-57x57.png",revision:"b63baa5becfa3ed012644f1a4fa5ef05"},{url:"/images/apple-touch-icon-60x60.png",revision:"b973a6641aeff3093870733f47582bdc"},{url:"/images/apple-touch-icon-72x72.png",revision:"29b464ab7fc1f035c6f0741eaa28480f"},{url:"/images/apple-touch-icon-76x76.png",revision:"8f1e25ff5f8ba9a8d6784aa9eb1d80b4"},{url:"/images/favicon-128x128.png",revision:"d16da3435dcf420159eab36c3cf0c9f0"},{url:"/images/favicon-16x16.png",revision:"80c26bc5bf7102fd52b5f121a64ad225"},{url:"/images/favicon-196x196.png",revision:"1edc736fd2751cc646d0c0cbc5fb4171"},{url:"/images/favicon-32x32.png",revision:"adbc3ee2faaf37f556ca66b186c0573f"},{url:"/images/favicon-512x512.png",revision:"72c968d9e3a0787c98cdc402e44541ec"},{url:"/images/favicon-96x96.png",revision:"42c96fe8f469dc64fe50a52aaf2734bc"},{url:"/images/favicon.ico",revision:"857302f0dd885daa95f352ae385bbd55"},{url:"/images/mstile-144x144.png",revision:"59c25f6b077b525eb4391bdfb38dbd47"},{url:"/images/mstile-150x150.png",revision:"f0dd07a99cb1487a0b2b355c7fec9daf"},{url:"/images/mstile-310x150.png",revision:"4eb20d81e523bc7f675fe89199e61413"},{url:"/images/mstile-310x310.png",revision:"ed0e764ed38f2b9c6b6f5704ed32a950"},{url:"/images/mstile-70x70.png",revision:"d16da3435dcf420159eab36c3cf0c9f0"},{url:"/manifest.webManifest",revision:"963d1b1cc2912feeacb4783b5d54d324"},{url:"/splashscreens/ipad_splash.png",revision:"6d4ceb5df43edc156080c1f017b3dfda"},{url:"/splashscreens/ipadpro1_splash.png",revision:"f581d328cbc908bb7c09b4b2ec415223"},{url:"/splashscreens/ipadpro2_splash.png",revision:"e6d6c35ceda561424e713b21b55f2de8"},{url:"/splashscreens/ipadpro3_splash.png",revision:"598adec96c832a2546f37fa350b3793f"},{url:"/splashscreens/iphone5_splash.png",revision:"3d702e71f70e05bd3776a5605eedbdb4"},{url:"/splashscreens/iphone6_splash.png",revision:"dbcc38565883aa8ff280e086a236b67c"},{url:"/splashscreens/iphoneplus_splash.png",revision:"8c1fb7ac009b59df641a060bffa17206"},{url:"/splashscreens/iphonex_splash.png",revision:"db9e4e9eec709c667e988a93ea6cf844"},{url:"/splashscreens/iphonexr_splash.png",revision:"e80c4d2e3a6d6a7a7354baa9fc20061b"},{url:"/splashscreens/iphonexsmax_splash.png",revision:"020e3af3d80fe527968b67de83499694"}],{ignoreURLParametersMatching:[]}),e.cleanupOutdatedCaches(),e.registerRoute("/",new e.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:async({request:e,response:s,event:a,state:i})=>s&&"opaqueredirect"===s.type?new Response(s.body,{status:200,statusText:"OK",headers:s.headers}):s}]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,new e.CacheFirst({cacheName:"google-fonts-webfonts",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:31536e3})]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,new e.StaleWhileRevalidate({cacheName:"google-fonts-stylesheets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,new e.StaleWhileRevalidate({cacheName:"static-font-assets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,new e.StaleWhileRevalidate({cacheName:"static-image-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/image\?url=.+$/i,new e.StaleWhileRevalidate({cacheName:"next-image",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp3|wav|ogg)$/i,new e.CacheFirst({cacheName:"static-audio-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp4)$/i,new e.CacheFirst({cacheName:"static-video-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:js)$/i,new e.StaleWhileRevalidate({cacheName:"static-js-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:css|less)$/i,new e.StaleWhileRevalidate({cacheName:"static-style-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/data\/.+\/.+\.json$/i,new e.StaleWhileRevalidate({cacheName:"next-data",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:json|xml|csv)$/i,new e.NetworkFirst({cacheName:"static-data-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;const s=e.pathname;return!s.startsWith("/api/auth/")&&!!s.startsWith("/api/")}),new e.NetworkFirst({cacheName:"apis",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:16,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;return!e.pathname.startsWith("/api/")}),new e.NetworkFirst({cacheName:"others",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>!(self.origin===e.origin)),new e.NetworkFirst({cacheName:"cross-origin",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:3600})]}),"GET")}));
