

const rgb = (r, g, b, a)=>`rgba(${r||0},${g||0},${b||0},${a||1}`
const pi = Math.PI;
const tau = pi*2;
const sin = Math.sin;
const cos = Math.cos;
const abs = Math.abs;
const rnd = a =>Math.random()*a;
const lerp = (start, stop, amt) =>amt*(stop-start)+start;
const clamp = (val, min, max) =>Math.min(Math.max(val, min), max);
const map = (n, s1, e1, s2, e2, b)=>{
  const newval = (n-s1)/(e1-s1)*(e2-s2)+s2;
  if (!b) return newval;
  if (s2 < e2) return this.constrain(newval, s2, e2);
  return this.constrain(newval, e2, s2);
};

function Particle(x,y, angle=rnd(tau),speed=rnd(3)+3){
   this.x=x;this.y=y;this.l=0;this.angle=angle;this.speed=speed;
   this.update=()=>{
     this.l++;
     this.x+=sin(this.angle)*this.speed*this.l;
     this.y+=cos(this.angle)*this.speed*this.l;
   };
}





(function(ctx,w,h){
  let myFont = new FontFace(
    "VT323",
    "url(https://fonts.gstatic.com/s/vt323/v12/pxiKyp0ihIEF2isfFJU.woff2)"
  );

  myFont.load().then((font) => {
    document.fonts.add(font);
  });
  
  let hiscore = localStorage.cyberwurmHiScore||0;
  ctx.canvas.width=w;
  ctx.canvas.height=h;
  document.body.appendChild(ctx.canvas);
  const fillCol=(r,g,b,a)=>ctx.fillStyle=rgb(r,g,b,a)
  const strokeCol=(r,g,b,a)=>ctx.strokeStyle=rgb(r,g,b,a)
  const fillHsl=(h,s,l)=>ctx.fillStyle=`hsl(${h||0},${clamp(s??100,0,100)}%,${l||50}%)`


  let wurm = resetWurm();
  const particles =[];
  let lastT = 0;
  let delay = 200;
  //Keyboard events
  const keyDown=[];
  let keyPressed={}
  document.body.addEventListener('keydown',e=>{keyDown[e.key]=1,keyPressed[e.key]=1});
  document.body.addEventListener('keyup',e=>{keyDown[e.key]=0});
  //CAnvas fullscreen on click
  ctx.canvas.addEventListener('click',e=>{e.target.requestFullscreen();});  

  (function update(t){
    //Handle timeing
    if(t-lastT>=delay-clamp(wurm.len*3,0,100)){
        lastT=t;
        if(!wurm.gameover)updateSnake();
        if(wurm.gameover && keyPressed[' '])wurm=resetWurm();
        keyPressed={};
    }
    //Render game
    drawGame(t);

    //Handle particles
    particles.forEach((p,i)=>{
      ctx.fillStyle=rgb(255/p.l*4,255/p.l*2,255/p.l/2);
      ctx.fillRect(p.x-4,p.y-4,8-p.l/5,8-p.l/5);
      if(p.l>50||p.x<0||p.y<0||p.x>w||p.y>h){
        particles.splice(i,1);
      }
      else{
        p.update();
      }
    });
    requestAnimationFrame(update);
  })();

  function resetWurm(){
    return {arena: Array(1024).fill(1),arenaWidth:32,arenaHeight:32,body:[],len:5,head:430,dir:[1,0],apple:500,appleLife:Date.now(),points:0,gameover:false,ofx:0,ofy:50,tz:16,lastApple:null,frame:0};
  }

  function drawGame(t){
      wurm.frame++;
      //Clear canvas
      fillCol(0,0,0);
      ctx.fillRect(0,0,w,h);
      const rawBonus = 10-(Date.now()-wurm.appleLife)/1000;
      const bonus = wurm.gameover?-10:clamp(rawBonus,-10,10);
      if(rawBonus<-10){
          wurm.gameover=true;
      }
      //Print score and hiscore
      fillCol(255,255,255);
      ctx.textAlign='left';
      ctx.font='bold 1cm VT323,arial';
      ctx.fillText(`SCORE ${wurm.points>>0}      HISCORE ${hiscore}`,2,30);
      //Render bonus and gauge
      if(!wurm.gameover){
          fillCol(255,255,255);
          ctx.fillRect(0,34,512,15);
          fillCol();
          ctx.fillRect(1,35,510,13);
          if(bonus>0){
              fillCol(0,100,0);
              ctx.fillRect(1,35,map(bonus,0,10,0,510),13);
          }
          else{
              fillCol(200,(1+sin(t/100))*100,0);
              ctx.fillRect(1,35,map(bonus,0,-10,0,510),13);
          }
          fillCol(255,255,255);
          ctx.font='.4cm VT323,arail';
          ctx.fillText(`Bonus: ${bonus.toFixed(2)}    Speed: ${(wurm.len*5)}`, 6, 45);
      }
      //Render playfield (arena)
      wurm.arena.forEach((p,i)=>{
        if(p||wurm.gameover){
          let x=(i%32);
          let y=(i>>5);
          if(bonus<0){
            //Hurry up inferno pattern
            //Bonus is also below zero on gameover
            const r=i/2+sin(x/3)*cos(y/6+t/333+sin(x/6-t/999))*255;
            fillCol(r,r*.7);
          }
          else{
            //Rainbow pattern
            fillHsl(i/3+(sin(x/16)*cos(y/9+t/666-cos(x/9+t/999))*9)*5,40);
            //fillHsl(i/3+(sin(x/16)*cos(y/9+t/666-cos(x/9+t/999))*9)*5,clamp((wurm.len-4)*4,0,100),50);
            //fillCol(o=99*sin(y/5-cos(x/5)+t/200),-o); 
            //fillCol(o=sin((Math.hypot(x-16,y-14)/10+t/1000)*5)*99,o,-o)
            //fillCol(o=560*sin(cos(t/1000-x/9)-t/1000-y/9+sin(x/(6.+cos(t*.001)+sin(x/9+y/9)))),o,o)
            //fillCol(o=100*(cos(t/2000-x/4)+sin(t/1000+x/9+sin(y/(4+sin(t/4000)-sin(x/y))))),o*sin(y-t/500+sin(x+t/1000)),-o);
            //fillCol(o=99*(sin(x*y+y/2*y/9*(sin(t/9000)))/222**cos(y/9*sin(t/1000)+x/11*cos(t/1000))),o/9)
            //fillCol(o=99*(sin((x*y+x*y)/1024)+cos(y+t/999)+sin(t/666+x+sin(y+t/999))),o/2,-o)
            
          }
          ctx.fillRect(wurm.ofx+(i%32)*wurm.tz,wurm.ofy+(i>>5)*wurm.tz,wurm.tz-1,wurm.tz-1);
        }
        else{
            ctx.lineDashOffset=(t/400)%8;
            ctx.setLineDash([4,4]);

          strokeCol(255,255);
          ctx.strokeRect(wurm.ofx+(i%32)*wurm.tz,wurm.ofy+(i>>5)*wurm.tz,wurm.tz-1,wurm.tz-1);
      ctx.setLineDash([]);

        }
      });

      //Draw snake body
      wurm.body.forEach((bodypart,i)=>{
          const x=bodypart%32,y=bodypart>>5;
        fillCol(0,0,map(i,0,wurm.body.length,155,55))
        ctx.fillRect(wurm.ofx+x*wurm.tz+1,wurm.ofy+y*wurm.tz+1,wurm.tz-3,wurm.tz-3)
        //fillCol(255,255,255);
        //ctx.fillText(bodypart,x*16,y*16+wurm.ofy);
      });

      //Draw apple
      if(!wurm.gameover){
          fillCol(255,0,0)
          ctx.fillRect(wurm.ofx+(wurm.apple%32)*wurm.tz+1,wurm.ofy+(wurm.apple>>5)*wurm.tz+1,wurm.tz-3,wurm.tz-3);
      }

      //Draw snake head
      fillCol(0,0,45)
      ctx.fillRect(wurm.ofx+(wurm.head%32)*wurm.tz+1,wurm.ofy+(wurm.head>>5)*wurm.tz+1,wurm.tz-3,wurm.tz-3);
      
      if(wurm.gameover){
          ctx.textAlign='center'
          ctx.fillStyle ='#000';
          ctx.strokeStyle ='#000'
          ctx.font=`130px VT323,sans-serif`;
          ctx.fillText('GAME OVER', w/2+5,305)
          ctx.fillStyle ='#fff';
          ctx.fillText('GAME OVER', w/2, 300)
          ctx.strokeText('GAME OVER', w/2, 300)
          ctx.font=`48px VT323,sans-serif`;
          ctx.fillStyle ='#000';
          ctx.fillText('Press space to play again', w/2+3,353)
          ctx.fillStyle ='#fff';
          ctx.fillText('Press space to play again', w/2,350)
          ctx.strokeText('Press space to play again', w/2,350)
      }

  }

  function updateSnake(){
    //Handle direction keys (only one direction at a time)
         if((keyPressed.ArrowUp||keyPressed.w)&&!wurm.dir[1])wurm.dir=[0,-1];
    else if((keyPressed.ArrowRight||keyPressed.d)&&!wurm.dir[0])wurm.dir=[1,0];
    else if((keyPressed.ArrowDown||keyPressed.s)&&!wurm.dir[1])wurm.dir=[0,1];
    else if((keyPressed.ArrowLeft||keyPressed.a)&&!wurm.dir[0])wurm.dir=[-1,0];
    

    //Snake touches body, or fell into a hole in the arena game over
    if(wurm.body.indexOf(wurm.head)!==-1 || wurm.head!==wurm.lastApple && wurm.arena[wurm.head]===0){
        localStorage.cyberwurmHiScore = hiscore= Math.max(hiscore,wurm.points|0);
        return wurm.gameover=true;
    }


    if(!wurm.gameover){
        //Grow body by adding head
        wurm.body.push(wurm.head);
        //trim body to length of wurm
        while(wurm.body.length>wurm.len)wurm.body.shift();
        
        //calculate new position for snakehead
        let shx = wurm.head%32;
        let shy = wurm.head>>5;
        const sHead = ((shx+=wurm.dir[0])<0?31:shx%32)+32*((shy+=wurm.dir[1])<0?31:shy%32);
        
        //Snake is eating an apple
        if(sHead==wurm.apple){
            wurm.lastApple = wurm.apple;
            //Add points
            wurm.points+= clamp(10-(Date.now()-wurm.appleLife)/1000,-10,10);
            

            
            
            //Remove tile from arena
            wurm.arena[wurm.apple]=0;
            //Increase length of body
            wurm.len++;

            //Find new appel position 
            do{
                wurm.apple = rnd(wurm.arena.length)>>0;
            }while(
                //not inside snake body and not where arena is eaten
                wurm.body.indexOf(wurm.apple)===-1
                && 1!==wurm.arena[wurm.apple]
            );

            //Store when apple was created
            wurm.appleLife = Date.now();
            
            //Add some particles
            for(let i=0;i<50;i++)particles.push(new Particle((wurm.apple%32)*wurm.tz+wurm.ofx+rnd(wurm.tz),(wurm.apple>>5)*wurm.tz+wurm.ofy+rnd(wurm.tz),rnd(tau),rnd(1)+.5));
        }
        //Update head position
        wurm.head = sHead;

    }
}

})(document.createElement('canvas').getContext('2d'),512,562)