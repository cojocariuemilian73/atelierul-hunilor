
(() => {
  const page = document.getElementById('page-acasa');
  const shell = page.querySelector('.page-shell');
  const column = shell.querySelector('.main-col');
  const footer = page.querySelector('.site-final-footer');
  const cover = document.getElementById('acasa');
  const origin = document.getElementById('sec-origini');
  // nota de sub „Originile hunilor” a fost scoasă (24.11.2026); rămâne doar creditul reliefului, în subsol
  const endCredit = document.createElement('p');
  endCredit.className = 'journey-caption';
  endCredit.innerHTML = 'Relief: <a href="https://commons.wikimedia.org/wiki/File:Europe_relief_laea_location_map.jpg">Alexrk2, Wikimedia Commons</a> · <a href="https://creativecommons.org/licenses/by-sa/3.0/">CC BY-SA 3.0</a>.';
  footer.prepend(endCredit);
  shell.before(document.getElementById('huni-journey-template').content.cloneNode(true));
  const layer = document.getElementById('huni-journey');
  const atlasMap = document.querySelector('image.base-map[href]');
  if(atlasMap) layer.style.setProperty('--journey-map', 'url("' + atlasMap.getAttribute('href') + '")');
  const drawing = layer.querySelector('svg');
  const routes = layer.querySelectorAll('path');
  const clip = layer.querySelector('clipPath rect');
  const pointer = layer.querySelector('.journey-position');
  const stops = layer.querySelector('.journey-stops');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const stages = [
    { selector:'#sec-origini', side:1, year:'c. 370', name:'Spre vest de Don', inset:118 },
    { selector:'#sec-cronologie', side:1, year:'376', name:'Dunărea', inset:140 },
    { selector:'#sec-migratie', side:1, year:'Anii 420–430', name:'Câmpia Panonică', inset:130 },
    { selector:'#sec-atlas', side:1, year:'451', name:'Galia', inset:124 },
    { selector:'#sec-personalitati', side:1, year:'452', name:'Italia', inset:118 },
    { selector:'#img-apahida', side:1, name:'Urme ale epocii', inset:85 },
    { selector:'#sec-glosar', side:1, inset:68 },
    { selector:'#biblio', side:1, name:'Izvoare și mărturii', inset:100 }
  ];
  let geometry = null;
  let pending = false;
  let dirty = true;

  function fromSvg(tag, attrs, text){
    const item = document.createElementNS('http://www.w3.org/2000/svg',tag);
    for(const [name,value] of Object.entries(attrs)) item.setAttribute(name,value);
    if(text) item.textContent = text;
    return item;
  }

  function rebuild(){
    const pageBox = page.getBoundingClientRect();
    const columnBox = column.getBoundingClientRect();
    if(!columnBox.width) { geometry = null; return; }
    const shellBox = shell.getBoundingClientRect();
    const footerBox = footer.getBoundingClientRect();
    const top = Math.max(shellBox.top,cover.getBoundingClientRect().bottom);
    const height = Math.ceil(footerBox.bottom-top);
    const width = page.clientWidth;
    if(height<=0 || width<=0) return;
    layer.style.setProperty('--journey-top',(top-pageBox.top)+'px');
    layer.style.setProperty('--journey-height',height+'px');
    drawing.setAttribute('viewBox','0 0 '+width+' '+height);
    const columnLeft = columnBox.left-pageBox.left;
    const left = Math.max(11,Math.min(columnLeft-16,columnLeft*.54));
    const right = width-left;
    const span = right-left;
    const limit = width>1240 ? 32 : 6;
    const nodes = stages.map(stage => {
      const box = document.querySelector(stage.selector).getBoundingClientRect();
      return {...stage,x:stage.side<0?left:right,y:box.top-top+Math.min(stage.inset,box.height*.6)};
    });
    const points = [{x:right-limit,y:0}];
    for(const node of [...nodes,{x:left+limit,y:height-12}]){
      const prev = points.at(-1);
      const delta = node.y-prev.y;
      if(delta>530){
        const swings = Math.ceil(delta/430);
        for(let step=1;step<swings;step++){
          const t = step/swings;
          const cross = Math.abs(node.x-prev.x)>span*.5;
          const eased = t*t*(3-2*t);
          const x = cross ? prev.x+(node.x-prev.x)*eased :
            prev.x+Math.sin(t*Math.PI*3)*limit*.62;
          points.push({x,y:prev.y+delta*t});
        }
      }
      points.push(node);
    }
    const lead = points[0];
    let d = 'M '+lead.x+' '+lead.y;
    for(let i=1;i<points.length;i++){
      const prev=points[i-1], next=points[i];
      const old=points[i-2]||prev, future=points[i+1]||next;
      const dy=(next.y-prev.y)*.38;
      const entry=prev.x+(next.x-old.x)*.15;
      const leave=next.x-(future.x-prev.x)*.15;
      d+=' C '+entry+' '+(prev.y+dy)+' '+leave+' '+(next.y-dy)+' '+next.x+' '+next.y;
    }
    routes.forEach(path=>path.setAttribute('d',d));
    stops.replaceChildren();
    for(const node of nodes.filter(item=>item.name)){
      const stop=fromSvg('g',{class:'journey-stop',transform:'translate('+node.x+' '+node.y+')'});
      stop.append(fromSvg('circle',{r:8}),fromSvg('circle',{r:2.65,class:'journey-core'}));
      if(node.year) stop.append(fromSvg('text',{'text-anchor':'middle',y:-17,class:'journey-date'},node.year));
      stop.append(fromSvg('text',{'text-anchor':'middle',y:29},node.name));
      stops.append(stop);
      node.marker=stop;
    }
    geometry={height,nodes,length:routes[0].getTotalLength()};
  }

  function update(){
    pending=false;
    if(dirty){rebuild();dirty=false}
    if(!geometry || !page.getClientRects().length) return;
    const {height,nodes,length}=geometry;
    const offset=layer.getBoundingClientRect().top;
    const viewport = document.documentElement.clientHeight;
    const endApproach = Math.max(0,Math.min(1,2-(height+offset)/viewport));
    const drawLine = viewport*(.69+.31*endApproach);
    if(offset>=innerHeight || offset+height<=0) return;
    const y=Math.min(height,Math.max(0,drawLine-offset));
    clip.setAttribute('height',motion.matches?height:y+7);
    pointer.style.visibility=y<1||y>=height-12?'hidden':'visible';
    if(!motion.matches && y>0 && y<height-12){
      let lo=0,hi=length;
      for(let step=0;step<15;step++){
        const mid=(lo+hi)/2;
        if(routes[0].getPointAtLength(mid).y<y) lo=mid;else hi=mid;
      }
      const p=routes[0].getPointAtLength((lo+hi)/2);
      pointer.setAttribute('cx',p.x);
      pointer.setAttribute('cy',p.y);
      layer.style.setProperty('--journey-pan',(40-80*y/height)+'px');
    }
    for(const node of nodes) node.marker?.classList.toggle('is-past',motion.matches||node.y<=y);
  }
  function schedule(layout=false){
    if(layout) dirty=true;
    if(pending) return;
    pending=true;
    requestAnimationFrame(update);
  }
  const observer=new ResizeObserver(()=>schedule(true));
  observer.observe(page);
  observer.observe(shell);
  for(const stage of stages) observer.observe(document.querySelector(stage.selector));
  window.addEventListener('resize',()=>schedule(true));
  window.addEventListener('scroll',()=>schedule(),{passive:true});
  motion.addEventListener('change',()=>schedule());
  schedule(true);
})();
