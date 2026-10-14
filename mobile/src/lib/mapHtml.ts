import Constants from 'expo-constants'
import { LEAFLET_CSS, LEAFLET_JS, MAP_ICONS } from './mapAssets'

/**
 * Las teselas del mapa (53 MB) no van dentro de la app: se sirven desde el contenedor web
 * (docker compose up web → puerto 8090) del mismo ordenador que ejecuta Expo.
 * Para usar otro servidor: EXPO_PUBLIC_TILES_URL=https://… en mobile/.env
 */
export function tilesBase() {
  const env = process.env.EXPO_PUBLIC_TILES_URL
  if (env) return env.replace(/\/$/, '')
  const host = Constants.expoConfig?.hostUri?.split(':')[0] ?? 'localhost'
  return `http://${host}:8090`
}

/** Página del WebView: Leaflet con CRS simple, como GameMap.tsx de la web */
export function mapHtml() {
  return `<!doctype html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<style>${LEAFLET_CSS}</style>
<style>
html,body,#map{margin:0;height:100%;background:#0b0907;-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none}
#map{--pin:26px}
.leaflet-container{background:#0b0907;font-family:-apple-system,system-ui,sans-serif}
.leaflet-tile-container img.leaflet-tile{mix-blend-mode:plus-lighter}
.gm-icon{background:none;border:0}
.gm-pin{position:absolute;left:0;top:0;width:var(--pin);height:var(--pin);transform:translate(-50%,-50%);display:grid;place-items:center;border-radius:9999px;transition:transform .15s,opacity .15s}
.gm-img img{width:100%!important;height:100%!important;object-fit:contain;filter:drop-shadow(0 1px 2px rgba(0,0,0,.9)) drop-shadow(0 0 1px #000);pointer-events:none}
.gm-glyph{background:rgba(14,11,8,.9);border:1.5px solid var(--c);color:var(--c);box-shadow:0 1px 4px rgba(0,0,0,.8)}
.gm-glyph svg{width:60%;height:60%}
.gm-item{width:calc(var(--pin)*.8);height:calc(var(--pin)*.8)}
.gm-approx.gm-glyph{border-style:dashed}
#map[data-items="off"] .gm-item:not(.gm-sel){display:none}
.gm-found{opacity:.38;filter:grayscale(.7)}
.gm-found::after{content:"";position:absolute;right:-3px;bottom:-3px;width:45%;height:45%;border-radius:9999px;background:#8fbf7a url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><path d='M3 8.5l3 3 7-7' stroke='%230b0907' stroke-width='2.6' fill='none' stroke-linecap='round'/></svg>") center/80% no-repeat}
.gm-sel{transform:translate(-50%,-50%) scale(1.4);z-index:2}
.gm-sel::before{content:"";position:absolute;inset:-7px;border-radius:9999px;border:2px solid #fff;box-shadow:0 0 14px rgba(255,255,255,.6)}
#err{position:absolute;left:12px;right:12px;bottom:12px;z-index:999;display:none;padding:10px 12px;border-radius:12px;background:rgba(18,16,13,.95);border:1px solid rgba(230,197,111,.35);color:#d6cbb3;font:13px/1.35 -apple-system,system-ui}
</style></head><body><div id="map"></div><div id="err"></div>
<script>${LEAFLET_JS}</script>
<script>
(function(){
  var ICONS=${JSON.stringify(MAP_ICONS)};
  var RN=window.ReactNativeWebView;
  function send(o){RN&&RN.postMessage(JSON.stringify(o))}
  var map=L.map('map',{crs:L.CRS.Simple,zoomControl:false,attributionControl:false,zoomSnap:0.25,zoomDelta:0.5,maxBoundsViscosity:0.8,tap:false});
  var group=L.layerGroup().addTo(map), tiles=null, layer=null, meta=null, pins={}, cats={}, errors=0;
  map.on('click',function(){send({type:'select',id:null})});
  function zoomClass(){
    if(!meta) return;
    var depth=meta.maxZoom-map.getZoom(), el=document.getElementById('map');
    el.style.setProperty('--pin',Math.round(Math.max(17,Math.min(34,34-depth*4.5)))+'px');
    el.dataset.items=depth<=2.01?'on':'off';
  }
  map.on('zoomend',zoomClass);
  function ll(x,y){return map.unproject([x,y],meta.maxZoom)}
  function html(m){
    var c=cats[m.cat]||cats.task||{color:'#f4dc9a'};
    var cls=(m.f?' gm-found':'')+(m.s?' gm-sel':'')+(m.a?' gm-approx':'');
    if(c.img&&ICONS[c.img]) return '<div class="gm-pin gm-img'+cls+'"><img src="'+ICONS[c.img]+'"/></div>';
    return '<div class="gm-pin gm-glyph'+(m.cat.indexOf('item_')===0?' gm-item':'')+cls+'" style="--c:'+c.color+'"><svg viewBox="0 0 24 24" fill="currentColor">'+(c.glyph||'')+'</svg></div>';
  }
  function setLayer(l,m,base){
    if(layer===l&&tiles) return;
    layer=l; meta=m;
    if(tiles) tiles.remove();
    group.clearLayers(); pins={};
    var b=L.latLngBounds(map.unproject([0,m.height],m.maxZoom),map.unproject([m.width,0],m.maxZoom));
    errors=0; document.getElementById('err').style.display='none';
    tiles=L.tileLayer(base+'/tiles/'+l+'/{z}/{y}/{x}.webp',{maxNativeZoom:m.maxZoom,maxZoom:m.maxZoom+1.5,minZoom:0,noWrap:true,bounds:b,keepBuffer:3,
      errorTileUrl:'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='}).addTo(map);
    tiles.on('tileerror',function(){
      errors++;
      if(errors===6){var e=document.getElementById('err');e.textContent='No se pueden cargar las teselas del mapa desde '+base+'. Arranca el contenedor web en el ordenador (docker compose up -d web) y usa la misma red wifi.';e.style.display='block'}
    });
    tiles.on('tileload',function(){if(errors<6) document.getElementById('err').style.display='none'});
    map.setMinZoom(m.maxZoom-5); map.setMaxZoom(m.maxZoom+1.5);
    map.setMaxBounds(b.pad(0.2));
    map.fitBounds(b,{animate:false});
    map.setZoom(map.getZoom()+0.75,{animate:false});
    zoomClass();
  }
  function setMarkers(list){
    var keep={};
    for(var i=0;i<list.length;i++){
      var m=list[i]; keep[m.id]=1;
      var h=html(m), p=pins[m.id];
      if(!p){
        p=L.marker(ll(m.x,m.y),{icon:L.divIcon({html:h,className:'gm-icon',iconSize:[0,0]}),keyboard:false});
        (function(id){p.on('click',function(e){L.DomEvent.stopPropagation(e);send({type:'select',id:id})})})(m.id);
        p._k=h; pins[m.id]=p; group.addLayer(p);
      } else if(p._k!==h){ p.setIcon(L.divIcon({html:h,className:'gm-icon',iconSize:[0,0]})); p._k=h }
      p.setZIndexOffset(m.s?1000:m.cat.indexOf('item_')===0?0:100);
    }
    for(var id in pins) if(!keep[id]){group.removeLayer(pins[id]);delete pins[id]}
  }
  window.api={
    render:function(s){cats=s.cats||cats; setLayer(s.layer,s.meta,s.base); setMarkers(s.markers)},
    focus:function(x,y){ if(!meta) return; map.flyTo(ll(x,y),Math.max(map.getZoom(),meta.maxZoom-1),{duration:0.7}) },
    zoom:function(d){ map.setZoom(map.getZoom()+d) },
    fit:function(){ if(!meta) return; map.fitBounds(L.latLngBounds(map.unproject([0,meta.height],meta.maxZoom),map.unproject([meta.width,0],meta.maxZoom))) }
  };
  send({type:'ready'});
})();
</script></body></html>`
}
