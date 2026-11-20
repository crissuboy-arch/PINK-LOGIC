import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const core = require(process.env.CORTES_CORE_PATH || '../packages/desktop/dist/cortesCore.js');

// 30 palavras, 1 por 0.5s, com uma pausa de 2s depois da 10.ª e uma frase a acabar na 20.ª.
function fakeWords() {
  const words = [];
  let t = 0;
  for (let i = 0; i < 30; i++) {
    if (i === 10) t += 2;
    const word = i === 19 ? `fim${i}.` : `p${i}`;
    words.push({ word, start: t, end: t + 0.4 });
    t += 0.5;
  }
  return words;
}

test('buildUnits parte por pausa e por fim de frase', () => {
  const units = core.buildUnits(fakeWords());
  assert.equal(units.length, 3);
  assert.deepEqual(units.map((u) => u.words.length), [10, 10, 10]);
  assert.equal(units[0].id, 0);
  assert.ok(units[1].start - units[0].end > 1.5);
});

test('buildUnits ignora palavras com tempos inválidos', () => {
  const units = core.buildUnits([
    { word: 'ok', start: 0, end: 0.3 },
    { word: 'mau', start: 5, end: 1 },
    { word: '', start: 1, end: 2 },
    { word: 'bom', start: 0.4, end: 0.8 },
  ]);
  assert.equal(units.length, 1);
  assert.equal(units[0].text, 'ok bom');
});

test('unitsForPrompt nunca expõe tempos absolutos', () => {
  const text = core.unitsForPrompt(core.buildUnits(fakeWords()));
  assert.match(text, /^\[000\] 4\.9s "/);
  assert.ok(!/12\.9|13\.0/.test(text));
});

const OPTS = { clips: 2, minSec: 4, maxSec: 12 };

test('resolveSelection converte ids em tempos reais das palavras', () => {
  const units = core.buildUnits(fakeWords());
  const { clips } = core.resolveSelection(
    { clips: [{ startUnit: 0, endUnit: 0, hook: '  Isto   muda tudo  ', score: 9, reason: 'forte' }] },
    units, OPTS);
  assert.equal(clips.length, 1);
  assert.equal(clips[0].start, units[0].start);
  assert.equal(clips[0].end, units[0].end);
  assert.equal(clips[0].hook, 'Isto muda tudo');
  assert.equal(clips[0].words.length, 10);
});

test('resolveSelection descarta ids inexistentes, sobreposições e durações fora do limite', () => {
  const units = core.buildUnits(fakeWords());
  const { clips, dropped } = core.resolveSelection({
    clips: [
      { startUnit: 0, endUnit: 99, hook: 'a', score: 8 },
      { startUnit: 1, endUnit: 1, hook: 'b', score: 7 },
      { startUnit: 1, endUnit: 2, hook: 'c', score: 6 },
      { startUnit: 2, endUnit: 2, hook: '', score: 5 },
    ],
  }, units, OPTS);
  assert.equal(clips.length, 1);
  assert.equal(clips[0].hook, 'b');
  assert.ok(dropped.some((d) => /fora do intervalo/.test(d)));
  assert.ok(dropped.some((d) => /sobrepõe|duração/.test(d)));
});

test('resolveSelection lança erro quando nada é válido', () => {
  const units = core.buildUnits(fakeWords());
  assert.throws(() => core.resolveSelection({ clips: [{ startUnit: 5, endUnit: 1, hook: 'x' }] }, units, OPTS), core.SelectionError);
  assert.throws(() => core.resolveSelection(null, units, OPTS), core.SelectionError);
  assert.throws(() => core.resolveSelection({ nope: 1 }, units, OPTS), core.SelectionError);
});

test('resolveSelection devolve cortes por ordem cronológica e numerados', () => {
  const units = core.buildUnits(fakeWords());
  const { clips } = core.resolveSelection({
    clips: [
      { startUnit: 2, endUnit: 2, hook: 'depois', score: 9 },
      { startUnit: 0, endUnit: 0, hook: 'antes', score: 5 },
    ],
  }, units, OPTS);
  assert.deepEqual(clips.map((c) => [c.index, c.hook]), [[1, 'antes'], [2, 'depois']]);
});

test('assTime formata h:mm:ss.cc e nunca negativo', () => {
  assert.equal(core.assTime(0), '0:00:00.00');
  assert.equal(core.assTime(61.5), '0:01:01.50');
  assert.equal(core.assTime(3600.25), '1:00:00.25');
  assert.equal(core.assTime(-3), '0:00:00.00');
});

test('assColor converte #RRGGBB para BGR do ASS e cai no rosa se inválida', () => {
  assert.equal(core.assColor('#FF2D8D'), '&H008D2DFF');
  assert.equal(core.assColor('lixo'), '&H008D2DFF');
});

test('wrapHook parte ganchos longos em duas linhas e deixa os curtos', () => {
  assert.equal(core.wrapHook('Curto assim'), 'Curto assim');
  const wrapped = core.wrapHook('Ninguém te conta isto sobre vender online');
  assert.match(wrapped, /\\N/);
  assert.equal(wrapped.replace('\\N', ' '), 'Ninguém te conta isto sobre vender online');
});

function sampleClip() {
  const units = core.buildUnits(fakeWords());
  return core.resolveSelection({ clips: [{ startUnit: 0, endUnit: 0, hook: 'Gancho {perigoso}', score: 9 }] }, units, OPTS).clips[0];
}

const ASS_OPTS = { width: 1080, height: 1920, style: 'destaque', accent: '#FF2D8D', hookSec: 3, wordsPerLine: 3 };

test('buildAss tem gancho no início, tempos relativos ao corte e escapa chavetas', () => {
  const ass = core.buildAss(sampleClip(), ASS_OPTS);
  assert.match(ass, /PlayResX: 1080/);
  assert.match(ass, /Dialogue: 2,0:00:00\.00,0:00:03\.00,Gancho/);
  assert.ok(ass.includes('Gancho (perigoso)'));
  assert.ok(!/\{perigoso\}/.test(ass));
  const legendas = ass.split('\n').filter((l) => l.startsWith('Dialogue: 1'));
  assert.ok(legendas.length >= 10);
  assert.match(legendas[0], /^Dialogue: 1,0:00:00\.00,/);
});

test('buildAss destaque marca uma palavra ativa por linha; limpo não usa cor por palavra', () => {
  const destaque = core.buildAss(sampleClip(), ASS_OPTS).split('\n').filter((l) => l.startsWith('Dialogue: 1'));
  assert.ok(destaque.every((l) => (l.match(/\\fscx118/g) || []).length === 1));
  const limpo = core.buildAss(sampleClip(), { ...ASS_OPTS, style: 'limpo' }).split('\n').filter((l) => l.startsWith('Dialogue: 1'));
  assert.ok(limpo.every((l) => !l.includes('\\fscx118')));
  assert.ok(limpo.length < destaque.length);
});

test('buildAss: nenhuma legenda começa depois do fim do corte', () => {
  const clip = sampleClip();
  const dur = clip.end - clip.start;
  const toSec = (t) => { const [h, m, s] = t.split(':'); return +h * 3600 + +m * 60 + +s; };
  for (const l of core.buildAss(clip, ASS_OPTS).split('\n').filter((x) => x.startsWith('Dialogue'))) {
    const [, start, end] = l.split(',');
    assert.ok(toSec(start) <= dur + 0.01 && toSec(end) <= dur + 0.01, l);
    assert.ok(toSec(end) >= toSec(start), l);
  }
});

test('buildAss: quebra de linha do gancho é \\N real e a linha automática está ligada', () => {
  const units = core.buildUnits(fakeWords());
  const clip = core.resolveSelection({ clips: [{ startUnit: 0, endUnit: 0, hook: 'Ninguém te conta isto sobre vender online', score: 9 }] }, units, OPTS).clips[0];
  const ass = core.buildAss(clip, ASS_OPTS);
  const hookLine = ass.split('\n').find((l) => l.includes(',Gancho,'));
  assert.ok(hookLine.includes('\\N'), 'deve conter \\N');
  assert.ok(!hookLine.includes('＼'), 'a barra do \\N não pode ser escapada');
  assert.match(ass, /WrapStyle: 0/);
});

test('ffmpegFilterPath escapa os caracteres especiais do filtro subtitles', () => {
  assert.equal(core.ffmpegFilterPath("C:\\a b\\it's[1],x.ass"), "C\\:/a b/it\\'s\\[1\\]\\,x.ass");
});

test('videoFilter recorta para 9:16 e queima a legenda', () => {
  const f = core.videoFilter('01-x.ass');
  assert.match(f, /crop=/);
  assert.match(f, /scale=1080:1920/);
  assert.match(f, /subtitles='01-x\.ass'/);
});

test('safeFileName remove acentos, símbolos e limita o tamanho', () => {
  assert.equal(core.safeFileName('Ninguém te conta ISTO!!!'), 'ninguem-te-conta-isto');
  assert.equal(core.safeFileName('???'), 'corte');
  assert.ok(core.safeFileName('a'.repeat(200)).length <= 40);
});
