import { RNG, clamp } from '../core/util.js';
import { getStats } from './state.js';
import { getEnemy } from '../data/enemies.js';
import { ITEMS } from '../data/items.js';

/**
 * Чистая модель боя: без DOM и canvas. Возвращает результаты действий,
 * сцена только показывает их. Это позволяет прогонять баланс в node.
 */
export class CombatModel {
  constructor({ enemyId, player, rng, seed }) {
    const def = getEnemy(enemyId);
    if (!def) throw new Error(`Неизвестный противник: ${enemyId}`);
    this.enemyId = enemyId;
    this.def = def;
    this.rng = rng || new RNG(seed || Date.now());
    this.classId = player.classId;
    this.stats = getStats(player);
    this.maxHp = this.stats.maxHp;
    this.playerHp = clamp(player.hp, 1, this.maxHp);
    this.enemyMaxHp = def.hp;
    this.enemyHp = def.hp;
    this.seeds = player.seeds;
    this.inventory = { heal: 0, honey: 0, double: 0, ...(player.items || {}) };
    this.hasEye = Boolean(player.hasEye);
    this.kindness = player.kindness || 0;
    this.ultAvailable = Boolean(player.ultOwned && !player.ultUsed);
    this.ultUsedHere = false;
    this.allies = {
      cat: Boolean(player.allies?.cat),
      pigeon: Boolean(player.allies?.pigeon),
      vacuum: Boolean(player.allies?.vacuum),
      boiler: Boolean(player.allies?.boiler),
      shadow: Boolean(player.allies?.shadow),
    };
    this.upgrades = { ...(player.upgrades || {}) };

    this.skillUsesMax = this.stats.skillUses;
    this.skillUsesLeft = this.skillUsesMax;
    this.shield = false;
    this.backstab = false;
    this.doublePending = false;
    this.doubleUsed = false;
    this.itemUsedThisTurn = false;
    this.skipTurns = 0;
    this.skipReason = '';
    this.inhaled = false;
    this.enemyTurnCount = 0;
    this.playerTurnCount = 0;
    this.lastRoll = null;
    this.outcome = null;
    this.macOffered = false;
    this.macChoice = null;
    this.damageDealt = 0;
    this.pigeonDamage = 0;
    this.snapshot = null;
    this.log = [];
    this.spareUsedSeed = false;
    this.itemsUsed = 0;
    this.intent = null;
    this.pendingPastaOffer = false;
    this.turnsTaken = 0;
    this.enemyArmor = 0;
    this.rollPenalty = 0;
    this.charmPending = 0;
    this.charmUsed = false;
    this.shunyaPhase = false;
    this.enraged = false;
    this.stolenItems = 0;
  }

  pushLog(text, tone = 'normal') {
    this.log.push({ text, tone });
    if (this.log.length > 40) this.log.shift();
  }

  start() {
    this.pushLog(`Бой начался: ${this.def.name}.`, 'system');
    if (this.allies.pigeon) {
      this.pigeonDamage = 3;
      this.enemyHp = Math.max(0, this.enemyHp - 3);
      this.pushLog('Гоша-Голубь спикировал с подоконника: −3 HP врагу.', 'ally');
      if (this.enemyHp <= 0) {
        this.outcome = 'kill';
        this.pushLog('Противник не выдержал голубиной атаки.', 'good');
        return;
      }
    }
    if (this.allies.boiler && this.playerHp < this.maxHp) {
      const before = this.playerHp;
      this.playerHp = Math.min(this.maxHp, this.playerHp + 3);
      const healed = this.playerHp - before;
      if (healed > 0) this.pushLog(`Котёл подкинул тепла: +${healed} HP.`, 'ally');
    }
    this.computeIntent();
    this.pushLog(`Намерение врага: ${this.intent.short}.`, 'intent');
    this.beginPlayerTurn();
  }

  computeIntent() {
    const nextTurn = this.enemyTurnCount + 1;
    if (this.enemyId === 'cat' && nextTurn % 3 === 0) {
      this.intent = { kind: 'hide', short: 'спрятаться под диван', damage: 0, exact: true };
      return;
    }
    if (this.enemyId === 'vacuum' && this.lastRoll !== null && this.lastRoll <= 2) {
      this.intent = {
        kind: 'inhale',
        short: 'втянуть Чики шлангом',
        damage: this.def.damage,
        exact: this.hasEye,
      };
      return;
    }
    if (this.enemyId === 'keys' && nextTurn % 3 === 0) {
      this.intent = { kind: 'armor', short: 'запереться на три замка', damage: 0, exact: true };
      return;
    }
    if (this.enemyId === 'boiler' && nextTurn % 3 === 0) {
      this.intent = { kind: 'burst', short: `сбросить пар: ${this.def.damage + 3} урона`, damage: this.def.damage + 3, exact: true };
      return;
    }
    if (this.enemyId === 'moth' && nextTurn % 3 === 0) {
      this.intent = { kind: 'steal', short: 'съесть предмет из сумки', damage: 0, exact: true };
      return;
    }
    if (this.enemyId === 'raven' && nextTurn % 4 === 0) {
      this.intent = { kind: 'stealSeed', short: 'украсть семя', damage: 0, exact: true };
      return;
    }
    this.intent = { kind: 'attack', short: `удар на ${this.def.damage}`, damage: this.def.damage, exact: false };
    if (this.enemyId === 'pasta' && !this.macOffered && this.enemyTurnCount >= 1) {
      this.intent = { kind: 'offer', short: 'предложить макароны', damage: 0, exact: true };
    }
    if (this.enemyId === 'shunya' && this.shunyaPhase) {
      this.intent.short = `удар на ${this.def.damage + (this.enraged ? 2 : 0)}`;
    }
  }

  getIntentText() {
    if (!this.intent) return '—';
    if (this.hasEye) {
      if (this.intent.kind === 'attack') return `Точный удар: ${this.def.damage}`;
      if (this.intent.kind === 'hide') return 'Спрячется: удар не пройдёт';
      if (this.intent.kind === 'inhale') return `Втянет: удар ${this.def.damage} + пропуск хода`;
      if (this.intent.kind === 'offer') return 'Предложит макароны';
      if (this.intent.kind === 'armor') return 'Запрётся: броня +3';
      if (this.intent.kind === 'burst') return `Сбросит пар: ${this.def.damage + 3}`;
      if (this.intent.kind === 'steal') return 'Съест предмет из сумки';
      if (this.intent.kind === 'stealSeed') return 'Украдёт одно семя';
    }
    if (this.intent.kind === 'attack') return 'Готовится ударить';
    if (this.intent.kind === 'hide') return 'Прячется под диван';
    if (this.intent.kind === 'inhale') return 'Всасывает воздух…';
    if (this.intent.kind === 'offer') return 'Что-то задумал';
    if (this.intent.kind === 'armor') return 'Щёлкает замками';
    if (this.intent.kind === 'burst') return 'Набирает давление';
    if (this.intent.kind === 'steal') return 'Принюхивается к сумке';
    if (this.intent.kind === 'stealSeed') return 'Косится на семена';
    return '—';
  }

  beginPlayerTurn() {
    this.playerTurnCount += 1;
    this.itemUsedThisTurn = false;
    if (this.skipTurns > 0) {
      this.skipTurns -= 1;
      this.pushLog(this.skipReason || 'Чики не может действовать и пропускает ход.', 'bad');
      this.skipReason = '';
      return { skipped: true };
    }
    return { skipped: false, exhausted: this.skillUsesLeft <= 0 };
  }

  takeSnapshot() {
    return {
      playerHp: this.playerHp,
      enemyHp: this.enemyHp,
      shield: this.shield,
      backstab: this.backstab,
      doublePending: this.doublePending,
      doubleUsed: this.doubleUsed,
      skillUsesLeft: this.skillUsesLeft,
      enemyTurnCount: this.enemyTurnCount,
      playerTurnCount: this.playerTurnCount,
      skipTurns: this.skipTurns,
      inhale: this.inhaled,
      rng: this.rng.getState(),
      inventory: { ...this.inventory },
      seeds: this.seeds,
      logLength: this.log.length,
      macOffered: this.macOffered,
      pendingPastaOffer: this.pendingPastaOffer,
      intent: this.intent ? { ...this.intent } : null,
      itemUsedThisTurn: this.itemUsedThisTurn,
      spareUsedSeed: this.spareUsedSeed,
      outcome: this.outcome,
      turnsTaken: this.turnsTaken,
      damageDealt: this.damageDealt,
      enemyArmor: this.enemyArmor,
      rollPenalty: this.rollPenalty,
      charmPending: this.charmPending,
      charmUsed: this.charmUsed,
      shunyaPhase: this.shunyaPhase,
      enraged: this.enraged,
      stolenItems: this.stolenItems,
    };
  }

  restoreSnapshot() {
    const s = this.snapshot;
    if (!s) return false;
    this.playerHp = s.playerHp;
    this.enemyHp = s.enemyHp;
    this.shield = s.shield;
    this.backstab = s.backstab;
    this.doublePending = s.doublePending;
    this.doubleUsed = s.doubleUsed;
    this.skillUsesLeft = s.skillUsesLeft;
    this.enemyTurnCount = s.enemyTurnCount;
    this.playerTurnCount = s.playerTurnCount;
    this.skipTurns = s.skipTurns;
    this.inhaled = s.inhale;
    this.rng.setState(s.rng);
    this.inventory = { ...s.inventory };
    this.seeds = s.seeds;
    this.log.length = s.logLength;
    this.macOffered = s.macOffered;
    this.pendingPastaOffer = s.pendingPastaOffer;
    this.intent = s.intent ? { ...s.intent } : null;
    this.itemUsedThisTurn = s.itemUsedThisTurn;
    this.spareUsedSeed = s.spareUsedSeed;
    this.outcome = s.outcome;
    this.turnsTaken = s.turnsTaken;
    this.damageDealt = s.damageDealt;
    this.enemyArmor = s.enemyArmor ?? 0;
    this.rollPenalty = s.rollPenalty ?? 0;
    this.charmPending = s.charmPending ?? 0;
    this.charmUsed = Boolean(s.charmUsed);
    this.shunyaPhase = Boolean(s.shunyaPhase);
    this.enraged = Boolean(s.enraged);
    this.stolenItems = s.stolenItems ?? 0;
    return true;
  }

  prepareAction() {
    if (this.outcome === 'defeat') return;
    this.snapshot = this.takeSnapshot();
  }

  canUseUlt() {
    return this.ultAvailable && !this.ultUsedHere && Boolean(this.snapshot);
  }

  useUlt() {
    if (!this.ultAvailable || this.ultUsedHere) return { ok: false, message: 'Эхо ещё не готово.' };
    if (!this.restoreSnapshot()) return { ok: false, message: 'Пока нечего отменять.' };
    this.snapshot = null;
    this.ultAvailable = false;
    this.ultUsedHere = true;
    this.pushLog('Эхо Первой Семечки: ход отменён. Время послушалось Чики.', 'ult');
    return { ok: true };
  }

  computeHit(multiplier = 1) {
    const raw = this.rng.d6();
    const roll = Math.max(1, raw - this.rollPenalty);
    const crit = roll === 6;
    let damage = roll + this.stats.bonus;
    if (this.charmPending) {
      damage += this.charmPending;
      this.charmPending = 0;
    }
    if (this.allies.shadow && this.playerHp <= this.maxHp / 2) damage += 1;
    if (crit) damage *= this.stats.critMult;
    let skillMult = multiplier;
    if (this.backstab) {
      skillMult *= 2;
      this.backstab = false;
    }
    damage *= skillMult;
    let doubled = false;
    if (this.doublePending) {
      damage *= 2;
      this.doublePending = false;
      doubled = true;
    }
    damage = Math.max(1, Math.round(damage));
    return { roll, crit, damage, doubled };
  }

  applyDamageToEnemy(damage) {
    let incoming = damage;
    if (this.enemyArmor > 0) {
      const absorbed = Math.min(this.enemyArmor, incoming);
      this.enemyArmor -= absorbed;
      incoming -= absorbed;
      if (absorbed > 0) this.pushLog(`Замки приняли ${absorbed} урона.`, 'defend');
    }
    if (incoming <= 0) {
      this.pushLog('Удар ушёл в замки: враг не пострадал.', 'defend');
      return 0;
    }
    const before = this.enemyHp;
    this.enemyHp = Math.max(0, this.enemyHp - incoming);
    const real = before - this.enemyHp;
    this.damageDealt += real;
    if (this.enemyHp <= 0 && !this.outcome) this.outcome = 'kill';
    return real;
  }

  attack() {
    if (this.outcome) return { ok: false };
    this.prepareAction();
    const hit = this.computeHit(1);
    this.lastRoll = hit.roll;
    this.applyDamageToEnemy(hit.damage);
    this.turnsTaken += 1;
    const text = hit.crit
      ? `КРИТ! Бросок ${hit.roll} → ${hit.damage} урона.`
      : `Бросок ${hit.roll} → ${hit.damage} урона.`;
    this.pushLog(text, hit.crit ? 'crit' : 'player');
    if (hit.doubled) this.pushLog('Двойное зерно сработало: урон удвоен.', 'buff');
    if (hit.crit && this.enemyId === 'shadow' && !this.outcome) {
      this.playerHp = Math.max(0, this.playerHp - 2);
      this.pushLog('Тень отвечает на крит: 2 урона в ответ.', 'enemy');
      if (this.playerHp <= 0) this.outcome = 'defeat';
    }
    if (this.enemyId === 'shunya') this.checkShunyaPhase();
    if (this.outcome === 'kill') this.pushLog(`${this.def.name} падает. Победа!`, 'good');
    return { ok: true, kind: 'attack', hits: [hit] };
  }

  checkShunyaPhase() {
    if (this.enemyId !== 'shunya' || this.outcome) return;
    if (!this.shunyaPhase && this.enemyHp <= this.enemyMaxHp * 0.6) {
      this.shunyaPhase = true;
      this.rollPenalty = 1;
      this.pushLog('Шуня поднимает крылья — свет вокруг гаснет. Каждый бросок слабее на 1.', 'bad');
    }
  }

  useSkill() {
    if (this.outcome) return { ok: false };
    if (this.skillUsesLeft <= 0) return { ok: false, message: 'Умение уже израсходовано.' };
    this.prepareAction();
    const skill = this.stats.skill;
    this.skillUsesLeft -= 1;
    this.pushLog(`Умение: ${skill.name}.`, 'skill');
    if (skill.kind === 'shield') {
      this.shield = true;
      this.pushLog('Крыло раскрылось щитом: следующий удар врага — не больше 1.', 'buff');
      return { ok: true, kind: 'shield', skill };
    }
    if (skill.kind === 'backstab') {
      this.backstab = true;
      this.pushLog('Чики растворился в тени. Следующий удар — двойной и не тратит ход.', 'buff');
      return { ok: true, kind: 'backstab_buff', skill };
    }
    if (skill.kind === 'volley') {
      const hits = [];
      for (let i = 0; i < 2; i += 1) {
        const hit = this.computeHit(1);
        this.lastRoll = hit.roll;
        this.applyDamageToEnemy(hit.damage);
        hits.push(hit);
        this.pushLog(
          hit.crit ? `Залп, бросок ${hit.roll}: КРИТ на ${hit.damage}!` : `Залп, бросок ${hit.roll}: ${hit.damage} урона.`,
          hit.crit ? 'crit' : 'player',
        );
        if (this.outcome) break;
      }
      this.turnsTaken += 1;
      if (this.outcome === 'kill') this.pushLog(`${this.def.name} падает. Победа!`, 'good');
      return { ok: true, kind: 'volley', hits, skill };
    }
    return { ok: false, message: 'Умение не сработало.' };
  }

  useItem(itemId) {
    if (this.outcome) return { ok: false, message: 'Бой уже окончен.' };
    if (!ITEMS[itemId]) return { ok: false, message: 'Нет такого предмета.' };
    this.prepareAction();
    if ((this.inventory[itemId] || 0) <= 0) return { ok: false, message: 'Предмет закончился.' };
    if (this.itemUsedThisTurn) return { ok: false, message: 'Один предмет за ход — этого достаточно.' };
    const item = ITEMS[itemId];
    if (itemId === 'double') {
      if (this.doubleUsed) return { ok: false, message: 'Двойное зерно уже применено в этом бою.' };
      this.doublePending = true;
      this.doubleUsed = true;
      this.inventory.double -= 1;
      this.itemUsedThisTurn = true;
      this.itemsUsed += 1;
      this.pushLog('Двойное зерно: первый удар боя будет удвоен.', 'buff');
      return { ok: true, kind: 'double', item };
    }
    if (item.use.type === 'charm') {
      if (this.charmUsed) return { ok: false, message: 'Талисман уже применён в этом бою.' };
      this.charmPending = item.use.amount;
      this.charmUsed = true;
      this.inventory[itemId] -= 1;
      this.itemUsedThisTurn = true;
      this.itemsUsed += 1;
      this.pushLog(`Талисман из перьев: следующий удар сильнее на ${item.use.amount}.`, 'buff');
      return { ok: true, kind: 'charm', item };
    }
    if (item.use.type === 'heal') {
      const before = this.playerHp;
      this.playerHp = Math.min(this.maxHp, this.playerHp + item.use.amount);
      this.inventory[itemId] -= 1;
      this.itemUsedThisTurn = true;
      this.itemsUsed += 1;
      const healed = this.playerHp - before;
      this.pushLog(`${item.name}: +${healed} HP.`, 'heal');
      return { ok: true, kind: 'heal', item, healed };
    }
    return { ok: false, message: 'Этот предмет нельзя применить.' };
  }

  getEnemyDamage() {
    let damage = this.def.damage;
    // Шуня в последней четверти боя бьёт сильнее.
    if (this.enemyId === 'shunya' && this.enemyHp <= this.enemyMaxHp * 0.25) {
      damage += 2;
      if (!this.enraged) {
        this.enraged = true;
        this.pushLog('— Хватит, — говорит Шуня. — Я слишком долго держала темноту.', 'bad');
      }
    }
    // Хозяин Макарон распаляется у плиты: последняя треть боя — самая горячая.
    if (this.enemyId === 'pasta' && this.enemyHp <= this.enemyMaxHp * 0.4) {
      damage += 2;
      if (!this.enraged) {
        this.enraged = true;
        this.pushLog('Плита взревела: Хозяин Макарон больше не сдерживается.', 'bad');
      }
    }
    if (this.shield) {
      damage = 1;
      this.shield = false;
    } else if (this.stats.absorb > 0) {
      damage = Math.max(1, damage - this.stats.absorb);
    }
    return damage;
  }

  enemyAct() {
    if (this.outcome) return { ok: false };
    this.enemyTurnCount += 1;
    const result = {
      ok: true,
      hidden: false,
      inhale: false,
      damage: 0,
      reflect: 0,
      killedPlayer: false,
      pastaOffer: false,
    };

    if (this.enemyId === 'cat' && this.enemyTurnCount % 3 === 0) {
      result.hidden = true;
      this.pushLog('Мурзила прячется под диван. Его удар не проходит.', 'defend');
      this.computeIntent();
      return result;
    }

    if (this.enemyId === 'keys' && this.enemyTurnCount % 3 === 0) {
      result.armor = 3;
      this.enemyArmor += 3;
      this.pushLog('Ключница щёлкает замками: броня +3.', 'defend');
      this.computeIntent();
      return result;
    }

    if (this.enemyId === 'moth' && this.enemyTurnCount % 3 === 0) {
      const stolen = this.stealRandomItem();
      result.stolen = stolen;
      if (stolen) {
        this.pushLog(`Моль съела предмет из сумки: ${stolen}.`, 'bad');
      } else {
        this.pushLog('Моль шарит по сумке, но там уже нечего есть.', 'defend');
      }
      this.computeIntent();
      return result;
    }

    if (this.enemyId === 'raven' && this.enemyTurnCount % 4 === 0) {
      if (this.seeds > 0) {
        this.seeds -= 1;
        this.stolenSeeds = (this.stolenSeeds || 0) + 1;
        result.stolenSeed = true;
        this.pushLog('Ворон сцапал одно семя и унёс в гнездо.', 'bad');
      } else {
        this.pushLog('Ворон ищет блестящее, но семян нет.', 'defend');
      }
      this.computeIntent();
      return result;
    }

    const hadShield = this.shield;
    let damage = this.getEnemyDamage();
    if (this.enemyId === 'boiler' && this.enemyTurnCount % 3 === 0) {
      damage += 3;
      result.burst = true;
    }
    const weakRoll = this.lastRoll !== null && this.lastRoll <= 2;
    const willInhale =
      this.enemyId === 'vacuum' && weakRoll && !hadShield && this.playerHp > 0 && !this.outcome;
    if (willInhale) damage = Math.min(damage, 2);
    result.damage = damage;
    this.playerHp = Math.max(0, this.playerHp - damage);
    this.pushLog(
      willInhale
        ? `${this.def.name} втягивает Чики шлангом: ${damage} урона.`
        : `${this.def.name} наносит ${damage} урона.`,
      'enemy',
    );

    if (this.stats.reflect > 0 && damage > 0) {
      this.applyDamageToEnemy(this.stats.reflect);
      result.reflect = this.stats.reflect;
      this.pushLog(`Обратный коготь: ${this.stats.reflect} урона врагу.`, 'skill');
    }

    if (willInhale && this.playerHp > 0 && !this.outcome) {
      result.inhale = true;
      this.skipTurns = 1;
      this.skipReason = 'Чики выбирается из шланга и пропускает ход.';
      this.inhaled = true;
      this.pushLog('Шланг втянул Чики: следующий ход пропущен.', 'bad');
    }

    if (this.playerHp <= 0) {
      result.killedPlayer = true;
      this.pushLog('Чики теряет последние силы…', 'bad');
      this.outcome = this.outcome || 'defeat';
    }

    if (this.enemyId === 'pasta' && !this.macOffered && this.enemyTurnCount >= 1 && this.playerHp > 0 && !this.outcome) {
      result.pastaOffer = true;
      this.pendingPastaOffer = true;
      this.pushLog('Хозяин Макарон поднимает крышку кастрюли. Пахнет макаронами.', 'intent');
    }

    this.computeIntent();
    return result;
  }

  acceptPasta() {
    if (!this.pendingPastaOffer) return { ok: false };
    this.pendingPastaOffer = false;
    this.macOffered = true;
    this.macChoice = 'accept';
    const before = this.playerHp;
    this.playerHp = Math.min(this.maxHp, this.playerHp + 5);
    this.skipTurns = 2;
    this.skipReason = 'Чики доедает макароны и пропускает ход.';
    this.pushLog(`Макароны: +${this.playerHp - before} HP, но два хода будут пропущены.`, 'heal');
    return { ok: true, healed: this.playerHp - before };
  }

  declinePasta() {
    if (!this.pendingPastaOffer) return { ok: false };
    this.pendingPastaOffer = false;
    this.macOffered = true;
    this.macChoice = 'decline';
    this.pushLog('Чики отказывается от макарон. Хозяин Макарон уважительно кивает.', 'system');
    return { ok: true };
  }

  stealRandomItem() {
    const pool = ['heal', 'honey', 'tonic', 'double', 'charm'].filter((id) => (this.inventory[id] || 0) > 0);
    if (!pool.length) return null;
    const pick = pool[Math.floor(this.rng.next() * pool.length)] || pool[0];
    this.inventory[pick] -= 1;
    this.stolenItems += 1;
    const names = { heal: 'Семечко-лечение', honey: 'Медовая капля', tonic: 'Настойка из коры', double: 'Двойное зерно', charm: 'Талисман из перьев' };
    return names[pick] || pick;
  }

  canSpare() {
    if (this.enemyHp <= 0 || this.playerHp <= 0) return false;
    if (this.enemyHp > this.def.spareThreshold) return false;
    if (this.enemyId === 'vacuum') {
      return this.allies.cat || this.seeds >= 1;
    }
    if (this.enemyId === 'shunya') {
      return this.kindness >= 3 || this.allies.shadow || this.allies.moth;
    }
    return true;
  }

  spare() {
    if (!this.canSpare()) return { ok: false, message: 'Противник ещё слишком силён для переговоров.' };
    if (this.enemyId === 'vacuum' && !this.allies.cat) {
      if (this.seeds < 1) return { ok: false, message: 'Нужно семя для подкупа.' };
      this.seeds -= 1;
      this.spareUsedSeed = true;
    }
    this.outcome = 'spare';
    this.pushLog(`${this.def.name} соглашается на мир. Бой окончен.`, 'good');
    return { ok: true };
  }

  enemyHpPercent() {
    return this.enemyHp / this.enemyMaxHp;
  }

  playerHpPercent() {
    return this.playerHp / this.maxHp;
  }
}

export function createCombatModel(state, enemyId, seed) {
  return new CombatModel({
    enemyId,
    player: state.player,
    rng: seed ? new RNG(seed) : new RNG((Date.now() ^ (Math.random() * 0xffffffff)) >>> 0),
    seed,
  });
}
