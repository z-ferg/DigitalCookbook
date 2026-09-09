import { useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Nav from '../components/Nav';
import { newIngredientId, useRecipes } from '../data/useRecipes';
import type { Course, Difficulty, Ingredient } from '../types';
import { COURSES, DIFFICULTIES } from '../types';

const UNIT_WORDS = new Set([
  'g', 'kg', 'oz', 'lb', 'cup', 'cups', 'tbsp', 'tsp', 'ml', 'l',
  'clove', 'cloves', 'can', 'bunch', 'pinch', 'slice', 'slices',
]);

function parsePastedLine(line: string): Ingredient {
  const trimmed = line.trim();
  const parts = trimmed.split(/\s+/);
  let qty = '';
  let unit = '';
  let name = trimmed;

  if (parts.length > 0 && /^[\d./]+$/.test(parts[0])) {
    qty = parts[0];
    let rest = parts.slice(1);
    if (rest.length > 0 && UNIT_WORDS.has(rest[0].toLowerCase().replace(/,$/, ''))) {
      unit = rest[0];
      rest = rest.slice(1);
    }
    name = rest.join(' ');
  }
  return { id: newIngredientId(), qty, unit, name };
}

export default function RecipeFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getRecipe, addRecipe, updateRecipe } = useRecipes();
  const editing = id ? getRecipe(id) : undefined;
  const isEdit = Boolean(id);

  const [title, setTitle] = useState(editing?.title ?? '');
  const [servings, setServings] = useState(editing?.servings ?? 4);
  const [difficulty, setDifficulty] = useState<Difficulty>(editing?.difficulty ?? 'Easy');
  const [course, setCourse] = useState<Course>(editing?.course ?? 'Dinner');
  const [source, setSource] = useState(editing?.source ?? '');
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    editing?.ingredients ?? [{ id: newIngredientId(), qty: '', unit: '', name: '' }],
  );
  const [steps, setSteps] = useState<string[]>(editing?.steps ?? ['']);
  const [notes, setNotes] = useState(editing?.notes ?? '');
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const pasteRef = useRef<HTMLTextAreaElement>(null);

  const cleanIngredients = useMemo(
    () => ingredients.filter((i) => i.qty || i.unit || i.name),
    [ingredients],
  );
  const cleanSteps = useMemo(() => steps.filter((s) => s.trim()), [steps]);

  const updateIngredient = (rowId: string, patch: Partial<Ingredient>) => {
    setIngredients((prev) => prev.map((i) => (i.id === rowId ? { ...i, ...patch } : i)));
  };
  const removeIngredient = (rowId: string) => {
    setIngredients((prev) => prev.filter((i) => i.id !== rowId));
  };
  const addIngredientRow = () => {
    setIngredients((prev) => [...prev, { id: newIngredientId(), qty: '', unit: '', name: '' }]);
  };

  const updateStep = (index: number, value: string) => {
    setSteps((prev) => prev.map((s, i) => (i === index ? value : s)));
  };
  const removeStep = (index: number) => {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  };
  const addStep = () => setSteps((prev) => [...prev, '']);

  const handlePasteSplit = () => {
    const text = pasteRef.current?.value ?? '';
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return;
    const parsed = lines.map(parsePastedLine);
    setIngredients((prev) => {
      const withoutBlank = prev.filter((i) => i.qty || i.unit || i.name);
      return [...withoutBlank, ...parsed];
    });
    if (pasteRef.current) pasteRef.current.value = '';
  };

  const buildInput = () => ({
    title: title.trim() || 'Untitled recipe',
    servings,
    difficulty,
    course,
    source: source.trim(),
    notes,
    ingredients: cleanIngredients,
    steps: cleanSteps,
  });

  const saveDraft = () => {
    if (isEdit && id) {
      updateRecipe(id, buildInput());
    } else {
      const created = addRecipe(buildInput());
      navigate(`/recipe/${created.id}/edit`, { replace: true });
      return;
    }
    setSavedMessage('Draft saved');
    setTimeout(() => setSavedMessage(null), 2000);
  };

  const saveRecipe = () => {
    if (isEdit && id) {
      updateRecipe(id, buildInput());
      navigate(`/recipe/${id}`);
    } else {
      const created = addRecipe(buildInput());
      navigate(`/recipe/${created.id}`);
    }
  };

  return (
    <div className="page">
      <Nav
        active="new"
        right={
          <>
            {savedMessage && (
              <span className="text-muted" style={{ fontSize: 12, alignSelf: 'center' }}>
                {savedMessage}
              </span>
            )}
            <button className="btn btn-secondary" onClick={saveDraft}>
              Save draft
            </button>
            <button className="btn btn-primary" onClick={saveRecipe}>
              {isEdit ? 'Save changes' : 'Save recipe'}
            </button>
          </>
        }
      />
      <div style={{ padding: '32px 40px 40px' }}>
        <input
          className="input"
          placeholder="Recipe title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            minHeight: 'auto',
            padding: '10px 20px',
            fontFamily: 'var(--font-heading)',
            fontSize: 34,
            lineHeight: 1.2,
            background: 'transparent',
            borderColor: 'transparent',
            marginBottom: 20,
          }}
        />
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 28,
            alignItems: 'flex-end',
            paddingBottom: 26,
            borderBottom: '1px solid var(--color-divider)',
          }}
        >
          <div className="field">
            <label>Servings</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                type="button"
                className="btn btn-secondary btn-icon"
                onClick={() => setServings((s) => Math.max(1, s - 1))}
              >
                −
              </button>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: 20, minWidth: 18, textAlign: 'center' }}>
                {servings}
              </span>
              <button
                type="button"
                className="btn btn-secondary btn-icon"
                onClick={() => setServings((s) => s + 1)}
              >
                +
              </button>
            </div>
          </div>
          <div className="field">
            <label>Difficulty</label>
            <div className="seg">
              {DIFFICULTIES.map((d) => (
                <label className="seg-opt" key={d}>
                  <input
                    type="radio"
                    name="difficulty"
                    checked={difficulty === d}
                    onChange={() => setDifficulty(d)}
                  />
                  {d}
                </label>
              ))}
            </div>
          </div>
          <div className="field">
            <label>Course</label>
            <select
              className="input"
              value={course}
              onChange={(e) => setCourse(e.target.value as Course)}
              style={{ minWidth: 140 }}
            >
              {COURSES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="field" style={{ flex: 1, minWidth: 240 }}>
            <label>Source / author</label>
            <input className="input" value={source} onChange={(e) => setSource(e.target.value)} />
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0,0.9fr) minmax(0,1.1fr)',
            gap: 44,
            paddingTop: 28,
          }}
        >
          <div>
            <h4 style={{ marginBottom: 14 }}>Ingredients</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div
                className="ing-row"
                style={{
                  fontSize: 10,
                  letterSpacing: '.09em',
                  textTransform: 'uppercase',
                  color: 'rgba(32,30,29,.5)',
                  paddingLeft: 14,
                }}
              >
                <span>Qty</span>
                <span>Unit</span>
                <span>Ingredient</span>
                <span />
              </div>
              {ingredients.map((row) => (
                <div className="ing-row" key={row.id}>
                  <input
                    className="input"
                    value={row.qty}
                    placeholder="1"
                    onChange={(e) => updateIngredient(row.id, { qty: e.target.value })}
                  />
                  <input
                    className="input"
                    value={row.unit}
                    placeholder="cup"
                    onChange={(e) => updateIngredient(row.id, { unit: e.target.value })}
                  />
                  <input
                    className="input"
                    value={row.name}
                    placeholder="Next ingredient…"
                    onChange={(e) => updateIngredient(row.id, { name: e.target.value })}
                  />
                  <button
                    type="button"
                    className="btn btn-ghost btn-icon"
                    style={{ color: 'rgba(32,30,29,.4)' }}
                    onClick={() => removeIngredient(row.id)}
                    aria-label="Remove ingredient"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button type="button" className="btn btn-ghost" style={{ marginTop: 12 }} onClick={addIngredientRow}>
              + Add ingredient
            </button>
            <div
              style={{
                marginTop: 26,
                padding: '16px 18px',
                borderRadius: 20,
                background: 'var(--color-accent-2-100)',
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: '.09em',
                  textTransform: 'uppercase',
                  color: 'var(--color-accent-2-800)',
                  marginBottom: 6,
                }}
              >
                Paste instead
              </div>
              <p style={{ margin: '0 0 10px', fontSize: 12.5, color: 'var(--color-accent-2-800)' }}>
                Drop a block of text here and we'll split it into rows.
              </p>
              <textarea
                ref={pasteRef}
                className="input"
                placeholder={'400g rigatoni\n6 tbsp unsalted butter\n500g cherry tomatoes'}
                style={{ minHeight: 64, borderRadius: 20, background: 'var(--color-bg)' }}
              />
              <button type="button" className="btn btn-secondary" style={{ marginTop: 8 }} onClick={handlePasteSplit}>
                Split into rows
              </button>
            </div>
          </div>
          <div>
            <h4 style={{ marginBottom: 14 }}>Instructions</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {steps.map((step, index) => (
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }} key={index}>
                  <span className="stepnum">{index + 1}</span>
                  <textarea
                    className="input"
                    style={{ minHeight: 64, borderRadius: 20 }}
                    value={step}
                    placeholder="Describe this step…"
                    onChange={(e) => updateStep(index, e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-ghost btn-icon"
                    style={{ color: 'rgba(32,30,29,.4)' }}
                    onClick={() => removeStep(index)}
                    aria-label="Remove step"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button type="button" className="btn btn-ghost" style={{ marginTop: 12 }} onClick={addStep}>
              + Add step
            </button>
            <div className="field" style={{ marginTop: 26 }}>
              <label>Notes</label>
              <textarea
                className="input"
                style={{ borderRadius: 20, minHeight: 74 }}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
