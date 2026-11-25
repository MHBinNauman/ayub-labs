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

/** How long it stays solid. Matches the animation on .splash-line. */
export const SPLASH_HOLD_MS = 1700;
/** Matches the transition on .splash. Two seconds on screen in all. */
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
 * For <body>, right after the splash. Holds it long enough to read, then
 * fades it, however fast or slow the page is. Counted from the first frame,
 * not from when the script ran: on a slow phone the first paint can come much
 * later, and the splash would only flicker. Under reduced motion it goes as
 * soon as the page has loaded, without a fade.
 *
 * A tap or any key closes it early, so it never keeps anyone from calling. It
 * is the click that closes it, not the press: the splash is still on top then,
 * so the same tap cannot land on a button underneath. The listener is on the
 * splash itself because iOS sends no click from a plain element otherwise.
 */
export const splashBodyScript = `(function(){
var d=document.documentElement;
if(d.dataset.splash)return;
var over=false;
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
requestAnimationFrame(function(){setTimeout(dismiss,${SPLASH_HOLD_MS})});
document.querySelector(".splash").addEventListener("click",dismiss);
addEventListener("keydown",dismiss,{once:true});
if(reduced){
if(document.readyState==="complete")dismiss();
else addEventListener("load",dismiss,{once:true});
}
})()`;
