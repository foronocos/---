import { CLASSES, ENEMIES, STORY, SHOPS, getShopStock } from './data.js';

const SAVE_KEY = 'chiki-eclipse-save-v1';
const freshState = () => ({ screen:'title', classId:null, node:'first', chapter:0, hp:0, maxHp:0, seeds:0, inventory:{snack:0}, flags:{}, stats:{freedom:0,truth:0,trust:0}, notes:[], bestiary:[], log:[], battle:null, tab:'story', shop:'roach', shopRestock:0, upgrades:0, upgradeUses:0, skillUses:0, skillMax:1, ultimate:false, ultimateUsed:false, firstHit:false, pigeon:false, oracle:false, guardCharm:false, endings:[], savedAt:null });

export class Game {
  constructor(onChange){ this.s=freshState(); this.onChange=onChange; this.loadAvailable=false; this.checkSave(); }
  checkSave(){ try{this.loadAvailable=!!localStorage.getItem(SAVE_KEY);}catch{this.loadAvailable=false;} }
  emit(){ this.s.savedAt=new Date().toISOString(); try{if(this.s.classId){localStorage.setItem(SAVE_KEY,JSON.stringify(this.s));this.loadAvailable=true;}}catch{} this.onChange(this.s); }
  start(classId){ const c=CLASSES[classId]; if(!c)return; this.s=freshState(); this.s.classId=classId;this.s.hp=c.hp;this.s.maxHp=c.hp;this.s.screen='play';this.s.node='first';this.s.chapter=0;this.emit(); }
  load(){ try{const d=JSON.parse(localStorage.getItem(SAVE_KEY)); if(!d||!d.classId) return false; this.s={...freshState(),...d,flags:{...d.flags},stats:{...d.stats},inventory:{...d.inventory}};this.s.screen='play';this.s.tab='story';this.emit();return true;}catch{return false;} }
  reset(){try{localStorage.removeItem(SAVE_KEY)}catch{}this.s=freshState();this.loadAvailable=false;this.emit();}
  get player(){return CLASSES[this.s.classId]||null;}
  get story(){return STORY[['hall','pantry','kitchen','balcony'][this.s.chapter]];}
  get nodeData(){return this.story?.[this.s.node]||null;}
  addSeed(n){this.s.seeds=Math.max(0,this.s.seeds+n);}
  encounter(id,assistLevel=0){const e=ENEMIES[id];if(!e)return;this.s.bestiary=[...new Set([...this.s.bestiary,id])];this.s.battle={enemyId:id,hp:Math.max(1,e.maxHp-Math.floor(e.maxHp*Math.min(assistLevel*.2,.6))),maxHp:e.maxHp,assistLevel,turn:0,enemyTurns:0,log:[`${e.name} вступает в бой. ${e.epithet}.`],lastRoll:null,guard:false,shield:false,absorbed:false,dodgeUsed:false,pigeonUsed:false,offered:false,skipped:0,firstHit:this.s.firstHit,charmAvailable:this.s.guardCharm,forecast:this.roll(),returnTo:this.s.nodeData?.choices?.find(c=>c.enemy===id)?.returnTo||'first'};this.s.skillUses=0;this.s.screen='play';this.s.tab='story';this.emit();}
  action(index){ const choice=this.nodeData?.choices?.[index];if(!choice)return; const s=this.s;
    if(choice.effect==='battle'){this.addLog(choice.reply);this.encounter(choice.enemy);return;}
    if(choice.reply)this.addLog(choice.reply);
    if(choice.freedom)s.stats.freedom+=choice.freedom;if(choice.truth)s.stats.truth+=choice.truth;if(choice.trust)s.stats.trust+=choice.trust;
    if(choice.flag)s.flags[choice.flag]=true;
    if(choice.effect==='note'){if(choice.note&&!s.notes.includes(choice.note))s.notes.push(choice.note);}
    if(choice.effect==='peaceCat'){s.flags.catAlly=true;s.flags.catSpared=true;s.bestiary=[...new Set([...s.bestiary,'cat'])];this.addSeed(1);s.node='afterCat';}
    if(choice.effect==='peaceVacuum'){s.flags.vacuumPeace=true;s.flags.key=true;s.bestiary=[...new Set([...s.bestiary,'vacuum'])];this.addSeed(1);s.node='afterVacuum';}
    if(choice.effect==='peacePasta'){s.flags.pastaPeace=true;s.bestiary=[...new Set([...s.bestiary,'pasta'])];this.addSeed(1);s.node='afterPasta';}
    if(choice.effect==='cache'){if(!s.flags[`cache_${s.node}`]){s.flags[`cache_${s.node}`]=true;this.addSeed(choice.seed||1);s.flags.cacheMessage=choice.cache;}else s.flags.cacheMessage='Тайник уже пуст. Чики бережно убирает находку.';}
    if(choice.effect==='chapter'){this.enterChapter(choice.chapter);return;}
    if(choice.effect==='ending'){this.finish();return;}
    if(choice.next)s.node=choice.next;
    this.emit();
  }
  enterChapter(n){this.s.chapter=n;this.s.node=['first','pantryIntro','kitchenIntro','balcony'][n];this.s.shopRestock=n;this.s.shop=n>=2?'moth':'roach';if(n===3){this.s.flags.key=!!this.s.flags.key;}this.emit();}
  addLog(text){if(!text)return;this.s.log=[text,...this.s.log].slice(0,40);}
  chooseTab(tab){this.s.tab=tab;this.emit();}
  openShop(shop){if(shop==='moth'&&this.s.chapter<2)return;this.s.shop=shop;this.s.tab='shop';this.emit();}
  buy(itemId){const stock=getShopStock(this.s.shop,this.s.chapter);const item=stock.find(i=>i.id===itemId);if(!item||this.s.seeds<item.price)return;const s=this.s;this.addSeed(-item.price);
    if(item.type==='heal'){s.inventory.snack=(s.inventory.snack||0)+1;}
    if(item.type==='upgrade'){s.maxHp+=3;s.hp=Math.min(s.maxHp,s.hp+3);s.upgrades++;s.upgradeUses=Math.min(s.upgradeUses+1,3);s.skillMax=Math.min(3,s.skillMax+1);}
    if(item.type==='firstHit')s.firstHit=true;
    if(item.type==='pigeon'){s.pigeon=true;s.stats.trust++;}
    if(item.type==='oracle')s.oracle=true;
    if(item.type==='guardCharm')s.guardCharm=true;
    if(item.type==='ultimate')s.ultimate=true;
    this.addLog(`${SHOPS[s.shop].name}: «${item.name} — теперь твоё».`);this.emit();
  }
  upgrade(){if(this.s.seeds<2)return;this.addSeed(-2);this.s.upgrades++;this.s.upgradeUses=Math.min(3,this.s.upgradeUses+1);this.s.skillMax=Math.min(3,this.s.skillMax+1);this.s.maxHp+=3;this.s.hp=Math.min(this.s.maxHp,this.s.hp+3);this.addLog(`Улучшение «${this.player.branch}»: +3 к максимальному здоровью, ещё одно применение умения.`);this.emit();}
  useSnack(){if(!this.s.inventory.snack||this.s.hp>=this.s.maxHp||this.s.battle?.defeated)return;this.s.inventory.snack--;this.s.hp=Math.min(this.s.maxHp,this.s.hp+5);this.addLog('Крошка мёда вернула 5 здоровья.');if(this.s.battle){this.enemyTurn();return;}this.emit();}
  roll(){return Math.floor(Math.random()*6)+1;}
  attack(kind='normal'){
    const b=this.s.battle;if(!b)return;const p=this.player;let rolls=[this.roll()];if(kind==='skill'&&p.id==='mage')rolls.push(this.roll());if(kind==='skill'&&this.s.skillUses>=this.s.skillMax)return;
    this.s.skillUses+=kind==='skill'?1:0;let total=0,details=[];
    for(let i=0;i<rolls.length;i++){let r=rolls[i],damage=r+p.bonus;let crit=r===6;if(crit)damage+=3;if(crit&&this.s.upgrades>=1&&(p.id==='mage'||p.id==='shadow'))damage+=3;if(kind==='skill'&&p.id==='shadow')damage*=2;if(b.firstHit){damage*=2;b.firstHit=false;}damage=Math.max(1,damage);total+=damage;details.push(`${r}${crit?' · КРИТ':''} → ${damage}`);}
    b.hp=Math.max(0,b.hp-total);b.turn++;b.lastRoll=rolls[rolls.length-1];b.log.unshift(`${kind==='skill'?p.skill:'Атака'}: ${details.join(' / ')} урона. Всего ${total}.`);b.log=b.log.slice(0,10);
    if(b.hp<=0){this.victory();return;}
    if(b.enemyId==='cat'&&b.hp<=5){b.log.unshift('Мурзила больше не рычит. Можно закончить бой или предложить ему мир.');}
    this.enemyTurn();
  }
  useSkill(){const p=this.player,b=this.s.battle;if(!b||this.s.skillUses>=this.s.skillMax)return;
    if(p.id==='knight'){b.shield=true;b.log.unshift('Щит крыла поднят: следующий удар будет снижен до 1.');this.s.skillUses++;b.turn++;this.enemyTurn();return;}
    this.attack('skill');
  }
  guard(){const b=this.s.battle;if(!b)return;b.guard=true;b.turn++;b.log.unshift('Чики укрывается за крылом: следующий удар ослаблен.');this.enemyTurn();}
  pigeon(){const b=this.s.battle;if(!b||!this.s.pigeon||b.pigeonUsed)return;b.pigeonUsed=true;b.log.unshift('Голубь отвлёк противника: этот удар не пройдёт!');b.turn++;this.enemyTurn(true);}
  spareCat(){const b=this.s.battle;if(!b||b.enemyId!=='cat'||b.hp>5)return;this.s.flags.catAlly=true;this.s.flags.catSpared=true;this.s.bestiary=[...new Set([...this.s.bestiary,'cat'])];this.s.stats.trust++;this.s.stats.freedom++;this.addSeed(1);this.addLog('Чики опустил крыло. Мурзила стал союзником и показал короткий путь. +1 Семя Силы.');this.s.battle=null;this.s.node='afterCat';this.emit();}
  acceptPasta(){const b=this.s.battle;if(!b||b.enemyId!=='pasta'||b.offered)return;b.offered=true;this.s.hp=Math.min(this.s.maxHp,this.s.hp+5);b.skipped=2;b.log.unshift('Чики принимает макароны: +5 HP. Хозяин ждёт, пока ужин остынет: два пропуска его хода.');b.turn++;this.emit();}
  enemyTurn(skip=false){const s=this.s,b=s.battle;if(!b)return;if(b.hp<=0){this.victory();return;}const e=ENEMIES[b.enemyId];
    if(b.skipped>0){b.skipped--;b.log.unshift(`Хозяин Макарон ждёт, пока Чики доест. Пропущено ходов: ${b.skipped}.`);this.emit();return;}
    b.enemyTurns++;
    if(b.enemyId==='cat'&&b.enemyTurns%3===0){b.log.unshift('Мурзила юркнул под диван — его удар не проходит!');this.emit();return;}
    if(skip){this.emit();return;}
    let roll=b.forecast??this.roll(),damage=Math.max(1,e.damage-Math.floor((b.assistLevel||0)/2));
    if(roll===6)damage+=1;
    if(b.shield){damage=1;b.shield=false;}
    if(b.guard){damage=Math.max(0,damage-2);b.guard=false;}
    if(s.classId==='knight'&&s.upgrades>=1&&!b.absorbed&&damage>0){damage=0;b.absorbed=true;b.log.unshift('Поглощение удара: улучшенная стойка остановила атаку.');}
    if(b.charmAvailable){damage=0;b.charmAvailable=false;s.guardCharm=false;b.log.unshift('Талисман из пуха поглотил удар.');}
    if(b.enemyId==='vacuum'&&b.lastRoll!==null&&b.lastRoll<=2){damage+=1;b.log.unshift('Слабый удар втянул Чики ближе!');}
    if(b.enemyId==='pasta'&&roll===6)damage+=1;
    const before=s.hp;
    if(s.classId==='shadow'&&s.upgrades>=2&&!b.dodgeUsed){damage=0;b.dodgeUsed=true;b.log.unshift('Тихое уклонение: Чики исчез в полумраке.');}
    s.hp=Math.max(0,s.hp-damage);b.log.unshift(`${e.name}: бросок ${roll}, урон ${damage}.`);
    if(s.upgrades>=2&&s.classId!=='shadow'&&damage>0){b.hp=Math.max(0,b.hp-1);b.log.unshift('Возврат урона: атакующий получил 1 урон.');}
    if(b.hp<=0){this.victory();return;}
    if(s.hp===0&&s.ultimate&&!s.ultimateUsed){s.hp=Math.max(1,before);s.ultimateUsed=true;b.log.unshift('Эхо Первой Семечки отменило смертельный ход! Здоровье восстановлено.');}
    b.log=b.log.slice(0,10);
    if(b.hp<=0){this.victory();return;}
    if(s.hp<=0){b.log.unshift('Чики обессилел. Его можно поднять и попробовать снова.');b.defeated=true;this.emit();return;}
    b.forecast=this.roll();this.emit();
  }
  retry(){const b=this.s.battle;if(!b)return;const id=b.enemyId,assist=(b.assistLevel||0)+1;this.s.hp=this.s.maxHp;this.encounter(id,assist);this.s.battle.log.unshift(`Передышка восстановила здоровье. ${assist===1?'Противник начинает с меньшим запасом сил.':`Дом помогает Чики: помощь в бою усилена (ступень ${assist}).`}`);this.s.battle.log=this.s.battle.log.slice(0,10);this.emit();}
  victory(){const s=this.s,b=s.battle,e=ENEMIES[b.enemyId];if(!b)return;s.battle=null;s.hp=Math.max(1,s.hp);this.addSeed(3);s.flags[`defeated_${e.id}`]=true;this.addLog(`${e.name} повержен! +3 Семени Силы.`);if(e.id==='cat'){s.node='afterCat';s.flags.catAlly=false;}if(e.id==='vacuum'){s.node='afterVacuum';s.flags.key=true;this.addLog('Запасной ключ от балкона выпал из мешка.');}if(e.id==='pasta'){s.node='afterPasta';s.flags.feather=true;}this.emit();}
  finish(){const s=this.s;let ending;if(s.stats.freedom>=3&&(s.flags.catAlly||s.pigeon||s.stats.trust>=2))ending='friends';else if(s.stats.truth>=2&&s.stats.freedom>=1)ending='dawn';else ending='home';s.endings=[...new Set([...s.endings,ending])];s.flags.ending=ending;s.screen='ending';s.battle=null;this.emit();}
  continueAfterEnding(){this.s.screen='play';this.s.chapter=0;this.s.node='first';this.s.battle=null;this.emit();}
}
