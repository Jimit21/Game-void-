const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

function resize(){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - 60;
}
resize();
window.addEventListener("resize", resize);

const TILE_W = 64;
const TILE_H = 32;
const GRID_W = 7;
const GRID_H = 7;

let selectedTower = "laser";
const grid = [];
const towers = [];
const enemies = [];

for(let y=0;y<GRID_H;y++){
  for(let x=0;x<GRID_W;x++){
    grid.push({x,y,occupied:false});
  }
}

function isoToScreen(x,y){
  return {
    sx:(x - y) * TILE_W/2 + canvas.width/2,
    sy:(x + y) * TILE_H/2 + 40
  };
}

function screenToIso(mx,my){
  mx -= canvas.width/2;
  my -= 40;
  const x = Math.floor((mx/(TILE_W/2) + my/(TILE_H/2))/2);
  const y = Math.floor((my/(TILE_H/2) - mx/(TILE_W/2))/2);
  return {x,y};
}

canvas.addEventListener("touchstart",e=>{
  const t = e.touches[0];
  const pos = screenToIso(t.clientX,t.clientY);
  placeTower(pos.x,pos.y);
});

function selectTower(type){
  selectedTower = type;
}

function placeTower(x,y){
  const tile = grid.find(t=>t.x===x && t.y===y);
  if(!tile || tile.occupied) return;
  tile.occupied = true;
  towers.push({x,y,type:selectedTower,cooldown:0});
}

function spawnEnemy(){
  enemies.push({
    x:-1,
    y:3,
    hp:30,
    speed:0.01
  });
}
setInterval(spawnEnemy,2000);

function update(){
  towers.forEach(t=>{
    if(t.cooldown>0) t.cooldown--;
    enemies.forEach(e=>{
      const dx=e.x-t.x, dy=e.y-t.y;
      if(Math.abs(dx)+Math.abs(dy)<2 && t.cooldown===0){
        e.hp -= t.type==="laser"?5:10;
        t.cooldown = 30;
      }
    });
  });

  enemies.forEach(e=>e.x+=e.speed);

  for(let i=enemies.length-1;i>=0;i--){
    if(enemies[i].hp<=0 || enemies[i].x>GRID_W){
      enemies.splice(i,1);
    }
  }
}

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  grid.forEach(t=>{
    const p=isoToScreen(t.x,t.y);
    ctx.strokeStyle="#333";
    ctx.beginPath();
    ctx.moveTo(p.sx,p.sy);
    ctx.lineTo(p.sx+TILE_W/2,p.sy+TILE_H/2);
    ctx.lineTo(p.sx,p.sy+TILE_H);
    ctx.lineTo(p.sx-TILE_W/2,p.sy+TILE_H/2);
    ctx.closePath();
    ctx.stroke();
  });

  towers.forEach(t=>{
    const p=isoToScreen(t.x,t.y);
    ctx.fillStyle=t.type==="laser"?"#00f0ff":"#ff9933";
    ctx.beginPath();
    ctx.arc(p.sx,p.sy+TILE_H/2,6,0,Math.PI*2);
    ctx.fill();
  });

  enemies.forEach(e=>{
    const p=isoToScreen(e.x,e.y);
    ctx.fillStyle="#ff3333";
    ctx.beginPath();
    ctx.arc(p.sx,p.sy+TILE_H/2,6,0,Math.PI*2);
    ctx.fill();
  });
}

function loop(){
  update();
  draw();
  requestAnimationFrame(loop);
}
loop();
