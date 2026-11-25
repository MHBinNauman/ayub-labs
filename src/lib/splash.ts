/**
 * The once-per-session splash screen: its timings and the two inline scripts
 * that drive it. The scripts are plain strings because they must run before
 * React has loaded.
 *
 * State lives on <html data-splash>, which globals.css styles:
 *   (absent)  showing
 *   "skip"    already seen this session: never shown
 *   "out"     fading away
 *   "done"    finished; SplashGate removes it from the DOM
 */

export const SPLASH_KEY = "al_splash_seen";
/** Fired on window when the state becomes "done". */
export const SPLASH_EVENT = "al-splash-done";

/** Shown at least this long, so it never flickers. */
export const SPLASH_MIN_MS = 500;
/** Never shown longer than this, however slow the page. Matches .splash-line. */
export const SPLASH_MAX_MS = 1200;
/** Matches the transition on .splash. */
export const SPLASH_FADE_MS = 300;

/**
 * For <head>, before first paint. Also skips when sessionStorage is blocked:
 * otherwise the splash would come back on every page load.
 */
export const splashHeadScript = `(function(){
var d=document.documentElement;
try{if(sessionStorage.getItem("${SPLASH_KEY}"))d.dataset.splash="skip"}
catch(e){d.dataset.splash="skip"}
})()`;

/**
 * For <body>, right after the splash. Dismisses on window load or after the
 * maximum, whichever is first, but not before the minimum. Both are counted
 * from the first frame, not from when the script ran: on a slow phone the
 * first paint can come much later, and the splash would only flicker. Under
 * reduced motion there is no minimum and no fade.
 */
export const splashBodyScript = `(function(){
var d=document.documentElement;
if(d.dataset.splash)return;
var start,loaded=false,over=false;
var reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
function done(){d.dataset.splash="done";dispatchEvent(new Event("${SPLASH_EVENT}"))}
function dismiss(){
if(over)return;
over=true;
try{sessionStorage.setItem("${SPLASH_KEY}","1")}catch(e){}
if(reduced){done();return}
d.dataset.splash="out";
setTimeout(done,${SPLASH_FADE_MS});
}
function settle(){
if(reduced){if(loaded)dismiss();return}
if(loaded&&start!==undefined)setTimeout(dismiss,Math.max(0,${SPLASH_MIN_MS}-(performance.now()-start)));
}
function onload(){loaded=true;settle()}
requestAnimationFrame(function(){
start=performance.now();
setTimeout(dismiss,${SPLASH_MAX_MS});
settle();
});
if(document.readyState==="complete")onload();
else addEventListener("load",onload,{once:true});
})()`;
