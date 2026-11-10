import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useStore } from '../store/useStore'
import { TEMPLATES } from '../data/templates'
import { Icon } from '../components/Icon'
import { ClampText } from '../components/ClampText'
import { Sheet } from '../components/Sheet'
import { EmptyState } from '../components/EmptyState'
import { PageHeader } from '../components/PageHeader'
import { SharePlanButton } from '../components/SharePlanButton'
import { toast } from '../lib/toast'

export function Plans() {
  const nav = useNavigate()
  const plans = useStore((s) => s.plans)
  const addFromTemplate = useStore((s) => s.addPlanFromTemplate)
  const createEmpty = useStore((s) => s.createEmptyPlan)
  const duplicate = useStore((s) => s.duplicatePlan)
  const deletePlan = useStore((s) => s.deletePlan)
  const [templatesOpen, setTemplatesOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null)

  return (
    <div className="app">
      <PageHeader title="Plans" />

      <div className="row" style={{ gap: 10, marginBottom: 4 }}>
        <button
          className="btn btn-primary grow"
          onClick={() => {
            const p = createEmpty()
            nav(`/plans/${p.id}`)
          }}
        >
          <Icon name="plus" size={18} /> New plan
        </button>
        <button className="btn grow" onClick={() => setTemplatesOpen(true)}>
          <Icon name="clipboard" size={18} /> Templates
        </button>
      </div>

      <div className="section-head">
        <h2>Your plans</h2>
      </div>

      {plans.length === 0 ? (
        <EmptyState
          glyph="plan"
          title="No plans yet"
          body="Start from a proven template (Full Body, Upper/Lower, or Push/Pull/Legs) or build your own."
        >
          <button className="btn btn-primary" onClick={() => setTemplatesOpen(true)}>
            Browse templates
          </button>
        </EmptyState>
      ) : (
        plans.map((p) => (
          <div className="card plan-card" key={p.id}>
            <button className="plan-card-head" onClick={() => nav(`/plans/${p.id}`)}>
              <div className="grow">
                <div className="plan-card-title">{p.name}</div>
                <div className="plan-card-meta">
                  {p.days.length} day{p.days.length === 1 ? '' : 's'} · {p.daysPerWeek}×/week ·{' '}
                  {p.days.reduce((t, d) => t + d.exercises.length, 0)} exercises
                </div>
              </div>
              <Icon name="chevron" size={16} className="group-row-chev" />
            </button>
            {p.description && <ClampText text={p.description} className="hint" lines={3} />}
            <div className="plan-card-foot">
              <SharePlanButton plan={p} className="btn btn-ghost btn-sm" label="Share" />
              <div className="row" style={{ gap: 6 }}>
                <button
                  className="icon-btn icon-btn-sm"
                  onClick={() => {
                    duplicate(p.id)
                    toast('Plan duplicated', 'success')
                  }}
                  aria-label="Duplicate plan"
                >
                  <Icon name="copy" size={15} />
                </button>
                <button
                  className="icon-btn icon-btn-sm"
                  onClick={() => setConfirmDelete({ id: p.id, name: p.name })}
                  aria-label="Delete plan"
                >
                  <Icon name="trash" size={15} />
                </button>
              </div>
            </div>
          </div>
        ))
      )}

      <Sheet
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Delete this plan?"
      >
        <p className="hint" style={{ marginTop: 0 }}>
          “{confirmDelete?.name}” will be removed from your plans. Your logged workout history and
          exercise notes are not affected.
        </p>
        <button
          className="btn btn-danger btn-block"
          onClick={() => {
            if (confirmDelete) {
              deletePlan(confirmDelete.id)
              toast('Plan deleted')
            }
            setConfirmDelete(null)
          }}
        >
          <Icon name="trash" size={16} /> Delete plan
        </button>
        <button
          className="btn btn-ghost btn-block"
          style={{ marginTop: 8 }}
          onClick={() => setConfirmDelete(null)}
        >
          Cancel
        </button>
      </Sheet>

      <Sheet
        open={templatesOpen}
        onClose={() => setTemplatesOpen(false)}
        title="Start from a template"
        detent="large"
      >
        <p className="hint" style={{ marginTop: 0 }}>
          Evidence-based splits inspired by Jeff Nippard's programming. Adding one copies it into
          your plans so you can customize freely.
        </p>
        {TEMPLATES.map((t) => (
          <div className="card" key={t.id}>
            <div style={{ fontWeight: 640, fontSize: 16 }}>{t.name}</div>
            <div className="faint" style={{ fontSize: 12, marginBottom: 6 }}>
              {t.daysPerWeek}×/week · {t.days.length} sessions
            </div>
            <p className="hint" style={{ marginTop: 0 }}>
              {t.description}
            </p>
            <button
              className="btn btn-primary btn-block btn-sm"
              onClick={() => {
                const p = addFromTemplate(t.id)
                setTemplatesOpen(false)
                if (p) nav(`/plans/${p.id}`)
              }}
            >
              <Icon name="plus" size={14} /> Add to my plans
            </button>
          </div>
        ))}
      </Sheet>
    </div>
  )
}
