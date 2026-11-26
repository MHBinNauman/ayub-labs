/**
 * The WhatsApp button's one soft "ping" ring: played once per session, 3s
 * after the first page load, never looped. A plain-string head script marks
 * that load with <html data-wa-ping>; globals.css (.wa-ping) does the rest,
 * and plays nothing under reduced motion.
 */

export const WA_PING_KEY = "al_wa_ping_seen";

/**
 * For <head>. Sets data-wa-ping only when this session has not had the ping
 * yet. With sessionStorage blocked it never pings, rather than on every load.
 */
export const waPingHeadScript = `(function(){
try{if(!sessionStorage.getItem("${WA_PING_KEY}")){
sessionStorage.setItem("${WA_PING_KEY}","1");
document.documentElement.setAttribute("data-wa-ping","")}}catch(e){}
})()`;
