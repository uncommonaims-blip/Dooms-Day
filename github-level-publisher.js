/* Optional development-only GitHub publishing. Never bundle credentials in source. */
(function(){
'use strict';
const OWNER='uncommonaims-blip',REPO='Dooms-Day',TOKEN_KEY='dooms-github-publisher-token-v1',ENABLED_KEY='dooms-github-publisher-enabled-v1';
const PATHS={1:'assets/levels/cave-1-collisions.json',2:'assets/levels/cave-2-collisions.json'};
const timers=new Map(),pending=new Map(),inflight=new Map(),lastPublished=new Map();
let statusCallback=()=>{};
function token(){return localStorage.getItem(TOKEN_KEY)||''}
function enabled(){return localStorage.getItem(ENABLED_KEY)==='true'&&!!token()}
function setStatus(message){statusCallback(message);console.info('[Level publisher]',message)}
function b64utf8(s){const bytes=new TextEncoder().encode(s);let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(binary)}
async function api(path,method,body){const response=await fetch('https://api.github.com/repos/'+OWNER+'/'+REPO+'/contents/'+path,{method,headers:{'Accept':'application/vnd.github+json','Authorization':'Bearer '+token(),'X-GitHub-Api-Version':'2022-11-28',...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,cache:'no-store'});if(response.status===404&&method==='GET')return null;const result=await response.json().catch(()=>({}));if(!response.ok)throw Error('GitHub '+response.status+': '+(result.message||'Request failed'));return result}
function validate(raw){const o=JSON.parse(raw);if(!o||!Array.isArray(o.boundaries)||!Number.isFinite(o.width)||!Number.isFinite(o.height)||o.width<=0||o.height<=0)throw Error('Invalid collision map');for(const b of o.boundaries){if(!Array.isArray(b.points)||!b.points.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)))throw Error('Invalid collision points')}return o}
async function publish(level,raw){if(!enabled())return;validate(raw);const path=PATHS[level];if(!path)return;const existing=await api(path,'GET');if(!enabled())return;const body={message:'Auto-save Cave '+level+' collision geometry',content:b64utf8(raw),branch:'main'};if(existing?.sha)body.sha=existing.sha;await api(path,'PUT',body);lastPublished.set(level,raw);setStatus('Cave '+level+' committed to GitHub at '+new Date().toLocaleTimeString())}
function flush(level){if(inflight.has(level))return inflight.get(level);const raw=pending.get(level);if(!raw||!enabled()||raw===lastPublished.get(level))return Promise.resolve();pending.delete(level);const task=publish(level,raw).catch(e=>{pending.set(level,raw);setStatus('GitHub save failed: '+e.message)}).finally(()=>{inflight.delete(level);if(pending.has(level)&&enabled())schedule(level,pending.get(level))});inflight.set(level,task);return task}
function schedule(level,raw){if(!PATHS[level]||!enabled())return;try{validate(raw)}catch(e){setStatus('Not publishing invalid map: '+e.message);return}pending.set(level,raw);clearTimeout(timers.get(level));timers.set(level,setTimeout(()=>flush(level),30000));setStatus('Cave '+level+' queued for GitHub save (30 seconds after last edit)')}
function configure(newToken){const t=newToken.trim();if(t&&!/^(github_pat_|ghp_|ghu_)/.test(t))throw Error('Use a GitHub personal access token');if(t){localStorage.setItem(TOKEN_KEY,t);localStorage.setItem(ENABLED_KEY,'true')}else{localStorage.removeItem(TOKEN_KEY);localStorage.removeItem(ENABLED_KEY)}setStatus(t?'Automatic GitHub publishing enabled':'Automatic GitHub publishing disabled')}
function disable(){localStorage.setItem(ENABLED_KEY,'false');for(const timer of timers.values())clearTimeout(timer);pending.clear();setStatus('Automatic GitHub publishing paused')}
function enable(){if(!token())throw Error('Configure a token first');localStorage.setItem(ENABLED_KEY,'true');setStatus('Automatic GitHub publishing enabled')}
function init(callback){statusCallback=callback||statusCallback}
window.DoomsGitHubPublisher={schedule,flush,configure,disable,enable,enabled,hasToken:()=>!!token(),init};
})();
