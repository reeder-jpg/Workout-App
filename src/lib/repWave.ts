import type { Exercise, Plan, PrescribedSet } from '../types'
import { blockState } from './mesocycle'
import { KNEE_MUSCLES } from './knee'

/**
 * Weekly rep waves: upper-body rep targets rotate week to week through a block
 * — base (as written), heavier (fewer reps, more rest), pump (more reps, less
 * rest), repeating — and the last week of the block stays the deload.
 *
 * Why: with volume equated, periodized training gives a modestly larger
 * strength gain than repeating the same targets (meta-analyses: Williams 2017,
 * Moesgaard 2022), with no difference for hypertrophy. On a maintenance
 * upper body the main value is variety and joint comfort, which is reason
 * enough. Leg exercises are left alone: they progress by tempo, range and
 * reps under the knee rules, not by load.
 */
export type RepWave = 'base' | 'heavy' | 'pump'

const CYCLE: RepWave[] = ['base', 'heavy', 'pump']

export const WAVE_LABEL: Record<RepWave, string> = {
  base: 'Base week',
  heavy: 'Heavier week',
  pump: 'Pump week',
}

export const WAVE_SUMMARY: Record<RepWave, string> = {
  base: 'upper-body reps as written',
  heavy: 'upper body: fewer reps, a bit more rest — presses stay at 8+ reps',
  pump: 'upper body: more reps, a bit less rest',
}

/** The wave for a plan's current block week, or null (waves off, no block, or deload). */
export function waveFor(plan: Plan | undefined, now = Date.now()): RepWave | null {
  if (!plan?.repWaves) return null
  const b = blockState(plan, now)
  if (!b || b.isDeload || b.isOverdue) return null
  return CYCLE[(b.week - 1) % CYCLE.length]
}

/**
 * Which exercises the wave touches: upper-body lifts with a conventional rep
 * target. Leg and knee muscles, forearm work (logged in rolls), holds and
 * anything excluded from volume (stretches, tests, sled work) keep their
 * written targets.
 */
export function wavesApply(meta: Exercise | undefined): boolean {
  if (!meta) return false
  if (meta.excludeFromVolume) return false
  if (KNEE_MUSCLES.has(meta.primary)) return false
  if (meta.primary === 'Forearms') return false
  return true
}

/**
 * Pressing never drops below 8 reps on a heavier week: heavier pressing is
 * where the weaker shoulder starts to get favored.
 */
function isPress(meta: Exercise): boolean {
  return meta.category === 'Compound' && (meta.primary === 'Chest' || meta.primary === 'Shoulders')
}

function range(meta: Exercise, wave: Exclude<RepWave, 'base'>): [number, number] {
  if (wave === 'heavy') {
    if (isPress(meta)) return [8, 10]
    return meta.category === 'Compound' ? [6, 10] : [8, 12]
  }
  if (isPress(meta)) return [12, 20]
  return meta.category === 'Compound' ? [12, 15] : [15, 25]
}

/** Apply the week's wave to a prescribed scheme. Warm-ups and holds are untouched. */
export function applyWave(
  scheme: PrescribedSet[],
  meta: Exercise | undefined,
  wave: RepWave | null,
): PrescribedSet[] {
  if (!wave || wave === 'base' || !meta || !wavesApply(meta)) return scheme
  const [repMin, repMax] = range(meta, wave)
  return scheme.map((ps) => {
    if (ps.warmup || ps.isHold) return ps
    const restSec =
      wave === 'heavy' ? ps.restSec + 30 : Math.max(30, ps.restSec - 30)
    return { ...ps, repMin, repMax, restSec }
  })
}
