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
    this.ultAvailable = Boolean(player.ultOwned && !player.ultUsed);
    this.ultUsedHere = false;
    this.allies = {
      cat: Boolean(player.allies?.cat),
      pigeon: Boolean(player.allies?.pigeon),
      vacuum: Boolean(player.allies?.vacuum),
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
    this.intent = { kind: 'attack', short: `удар на ${this.def.damage}`, damage: this.def.damage, exact: false };
    if (this.enemyId === 'pasta' && !this.macOffered && this.enemyTurnCount >= 1) {
      this.intent = { kind: 'offer', short: 'предложить макароны', damage: 0, exact: true };
    }
  }

  getIntentText() {
    if (!this.intent) return '—';
    if (this.hasEye) {
      if (this.intent.kind === 'attack') return `Точный удар: ${this.def.damage}`;
      if (this.intent.kind === 'hide') return 'Спрячется: удар не пройдёт';
      if (this.intent.kind === 'inhale') return `Втянет: удар ${this.def.damage} + пропуск хода`;
      if (this.intent.kind === 'offer') return 'Предложит макароны';
    }
    if (this.intent.kind === 'attack') return 'Готовится ударить';
    if (this.intent.kind === 'hide') return 'Прячется под диван';
    if (this.intent.kind === 'inhale') return 'Всасывает воздух…';
    if (this.intent.kind === 'offer') return 'Что-то задумал';
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
    const roll = this.rng.d6();
    const crit = roll === 6;
    let damage = roll + this.stats.bonus;
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
    const before = this.enemyHp;
    this.enemyHp = Math.max(0, this.enemyHp - damage);
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
    if (this.outcome === 'kill') this.pushLog(`${this.def.name} падает. Победа!`, 'good');
    return { ok: true, kind: 'attack', hits: [hit] };
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

    const hadShield = this.shield;
    let damage = this.getEnemyDamage();
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

  canSpare() {
    if (this.enemyHp <= 0 || this.playerHp <= 0) return false;
    if (this.enemyHp > this.def.spareThreshold) return false;
    if (this.enemyId === 'vacuum') {
      return this.allies.cat || this.seeds >= 1;
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
