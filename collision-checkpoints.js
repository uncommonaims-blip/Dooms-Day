/* Versioned collision-map checkpoints, stored separately from active maps in IndexedDB. */
(function(){
'use strict';
const PREFIX='dooms-living-cavern-collisions-',DB='dooms-collision-checkpoints-v1',STORE='snapshots';
let dbPromise=null,chain=Promise.resolve(),lastError='';
function db(){if(dbPromise)return dbPromise;dbPromise=new Promise((resolve,reject)=>{const req=indexedDB.open(DB,1);req.onupgradeneeded=()=>{const store=req.result.createObjectStore(STORE,{keyPath:'id',autoIncrement:true});store.createIndex('byLevelTime',['level','createdAt'])};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)}).catch(e=>{dbPromise=null;throw e});return dbPromise}
function levelFor(key){if(key==='dooms-living-cavern-collisions-v1')return 1;if(key==='dooms-living-cavern-collisions-cave2-blank-v1')return 2;return null}
function validate(raw){const o=JSON.parse(raw);if(!o||!Array.isArray(o.boundaries)||!Number.isFinite(o.width)||!Number.isFinite(o.height)||o.width<=0||o.height<=0)throw Error('Invalid map snapshot');let nodes=0;for(const b of o.boundaries){if(!Array.isArray(b.points))throw Error('Invalid nodes');nodes+=b.points.length;if(!b.points.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)))throw Error('Invalid coordinates')}return {nodes,boundaries:o.boundaries.length,width:o.width,height:o.height}}
function enqueue(key,raw,reason){const level=levelFor(key);if(!level||!raw)return Promise.resolve();let meta;try{meta=validate(raw)}catch(e){return Promise.reject(e)}const work=async()=>{const database=await db();await new Promise((resolve,reject)=>{const tx=database.transaction(STORE,'readwrite');tx.objectStore(STORE).add({level,key,raw,reason,createdAt:Date.now(),...meta});tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error)});lastError=''};const result=chain.then(work);chain=result.catch(e=>{lastError=String(e);console.error('Collision checkpoint failed:',e)});return result}
async function list(){await chain;const database=await db();return new Promise((resolve,reject)=>{const req=database.transaction(STORE).objectStore(STORE).getAll();req.onsuccess=()=>resolve(req.result.sort((a,b)=>b.createdAt-a.createdAt||b.id-a.id));req.onerror=()=>reject(req.error)})}
async function get(id){await chain;const database=await db();return new Promise((resolve,reject)=>{const req=database.transaction(STORE).objectStore(STORE).get(Number(id));req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
async function storage(){if(navigator.storage&&navigator.storage.persist)return navigator.storage.persist();return false}
window.DoomsCheckpoints={enqueue,list,get,validate,levelFor,storage,error:()=>lastError};
})();
