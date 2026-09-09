import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Nav from '../components/Nav';
import { useRecipes } from '../data/useRecipes';
import { scaleQty } from '../utils/scaleQty';

export default function RecipeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getRecipe, logCooked } = useRecipes();
  const recipe = id ? getRecipe(id) : undefined;

  const [servings, setServings] = useState(recipe?.servings ?? 1);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [cookMode, setCookMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [listMessage, setListMessage] = useState<string | null>(null);

  if (!recipe) {
    return (
      <div className="page">
        <Nav backTo={{ to: '/library', label: '← Library' }} />
        <div style={{ padding: 40 }}>
          <p>Recipe not found.</p>
          <Link to="/library" className="btn btn-secondary">
            Back to library
          </Link>
        </div>
      </div>
    );
  }

  const factor = servings / recipe.servings;

  const toggleChecked = (ingId: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(ingId)) next.delete(ingId);
      else next.add(ingId);
      return next;
    });
  };

  const startCookMode = () => {
    setCookMode(true);
    setCurrentStep(0);
  };

  const finishStep = () => {
    if (currentStep >= recipe.steps.length - 1) {
      logCooked(recipe.id);
      setCookMode(false);
      setCurrentStep(0);
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  const addToShoppingList = () => {
    setListMessage('Added to shopping list');
    setTimeout(() => setListMessage(null), 2000);
  };

  return (
    <div className="page">
      <Nav
        backTo={{ to: '/library', label: '← Library' }}
        right={
          <>
            <button className="btn btn-secondary" onClick={() => navigate(`/recipe/${recipe.id}/edit`)}>
              Edit
            </button>
            <button className="btn btn-primary" onClick={startCookMode} disabled={cookMode}>
              {cookMode ? 'Cooking…' : 'Cook mode'}
            </button>
          </>
        }
      />
      <div style={{ padding: '34px 40px 44px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 20, marginBottom: 8 }}>
          <h1 style={{ margin: 0, maxWidth: 620 }}>{recipe.title}</h1>
          <div style={{ display: 'flex', gap: 6, paddingBottom: 8 }}>
            <span className="tag tag-accent">{recipe.difficulty}</span>
            <span className="tag tag-accent-2">{recipe.course}</span>
          </div>
        </div>
        <p className="text-muted" style={{ fontSize: 13.5, marginBottom: 30 }}>
          {recipe.source ? `From ${recipe.source} · ` : ''}
          {recipe.timesCooked === 0 ? 'not cooked yet' : `cooked ${recipe.timesCooked} times`}
          {recipe.lastMade ? ` · last made ${recipe.lastMade}` : ''}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '300px minmax(0,1fr)', gap: 48 }}>
          <aside>
            <div style={{ padding: 22, borderRadius: 26, background: 'var(--color-surface)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h4 style={{ margin: 0 }}>Ingredients</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    className="btn btn-secondary btn-icon"
                    style={{ width: 28, height: 28 }}
                    onClick={() => setServings((s) => Math.max(1, s - 1))}
                  >
                    −
                  </button>
                  <span style={{ fontSize: 13 }}>{servings}</span>
                  <button
                    className="btn btn-secondary btn-icon"
                    style={{ width: 28, height: 28 }}
                    onClick={() => setServings((s) => s + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11, fontSize: 14 }}>
                {recipe.ingredients.map((ing) => (
                  <label className="radio" key={ing.id}>
                    <input type="checkbox" checked={checked.has(ing.id)} onChange={() => toggleChecked(ing.id)} />
                    <span className="dot" />
                    <span
                      style={{
                        textDecoration: checked.has(ing.id) ? 'line-through' : 'none',
                        opacity: checked.has(ing.id) ? 0.55 : 1,
                      }}
                    >
                      {ing.qty && (
                        <strong style={{ fontWeight: 600 }}>
                          {scaleQty(ing.qty, factor)} {ing.unit}{' '}
                        </strong>
                      )}
                      {ing.name}
                    </span>
                  </label>
                ))}
              </div>
              <button className="btn btn-secondary btn-block" onClick={addToShoppingList}>
                {listMessage ?? 'Add to shopping list'}
              </button>
            </div>
            {recipe.notes && (
              <div
                style={{
                  marginTop: 18,
                  padding: '18px 20px',
                  borderRadius: 26,
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
                  Notes
                </div>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--color-accent-2-900)' }}>{recipe.notes}</p>
              </div>
            )}
          </aside>
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {recipe.steps.map((step, index) => {
                if (!cookMode) {
                  return (
                    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }} key={index}>
                      <span className="stepnum" style={{ background: 'var(--color-neutral-300)', color: 'var(--color-neutral-800)' }}>
                        {index + 1}
                      </span>
                      <p style={{ margin: 0, fontSize: 16, paddingTop: 5 }}>{step}</p>
                    </div>
                  );
                }
                const isPast = index < currentStep;
                const isCurrent = index === currentStep;
                if (isCurrent) {
                  return (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        gap: 16,
                        alignItems: 'flex-start',
                        padding: '18px 20px',
                        margin: '-4px -20px',
                        borderRadius: 26,
                        background: 'var(--color-surface)',
                      }}
                    >
                      <span className="stepnum" style={{ width: 40, height: 40, fontSize: 17 }}>
                        {index + 1}
                      </span>
                      <div>
                        <p style={{ margin: 0, fontSize: 19, lineHeight: 1.45 }}>{step}</p>
                        <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={finishStep}>
                          {index === recipe.steps.length - 1 ? 'Done — finish cooking' : 'Done — next step'}
                        </button>
                      </div>
                    </div>
                  );
                }
                return (
                  <div
                    key={index}
                    style={{ display: 'flex', gap: 16, alignItems: 'flex-start', opacity: isPast ? 0.5 : 0.75 }}
                  >
                    <span className="stepnum" style={{ background: 'var(--color-neutral-300)', color: 'var(--color-neutral-800)' }}>
                      {index + 1}
                    </span>
                    <p style={{ margin: 0, fontSize: 16, paddingTop: 5 }}>{step}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
