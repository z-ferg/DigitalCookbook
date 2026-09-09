import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Nav from '../components/Nav';
import { useRecipes } from '../data/useRecipes';
import type { Course, Difficulty } from '../types';
import { COURSES } from '../types';

type Sort = 'recent' | 'az' | 'most-cooked';

export default function LibraryPage() {
  const { recipes } = useRecipes();
  const [query, setQuery] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty | 'Any'>('Any');
  const [course, setCourse] = useState<Course | null>(null);
  const [ingredientOnHand, setIngredientOnHand] = useState('');
  const [sort, setSort] = useState<Sort>('recent');

  const filtered = useMemo(() => {
    let list = recipes.filter((r) => {
      if (query && !r.title.toLowerCase().includes(query.toLowerCase())) return false;
      if (difficulty !== 'Any' && r.difficulty !== difficulty) return false;
      if (course && r.course !== course) return false;
      if (ingredientOnHand) {
        const needle = ingredientOnHand.toLowerCase();
        if (!r.ingredients.some((i) => i.name.toLowerCase().includes(needle))) return false;
      }
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sort === 'az') return a.title.localeCompare(b.title);
      if (sort === 'most-cooked') return b.timesCooked - a.timesCooked;
      return b.createdAt - a.createdAt;
    });
    return list;
  }, [recipes, query, difficulty, course, ingredientOnHand, sort]);

  const clearFilters = () => {
    setQuery('');
    setDifficulty('Any');
    setCourse(null);
    setIngredientOnHand('');
  };

  const hasFilters = query || difficulty !== 'Any' || course || ingredientOnHand;

  return (
    <div className="page">
      <Nav
        active="library"
        right={
          <Link className="btn btn-primary" to="/new">
            + New recipe
          </Link>
        }
      />
      <div style={{ display: 'grid', gridTemplateColumns: '236px minmax(0,1fr)' }}>
        <aside style={{ padding: '30px 24px', background: 'var(--color-surface)', minHeight: 640 }}>
          <div
            style={{
              fontSize: 10,
              letterSpacing: '.09em',
              textTransform: 'uppercase',
              color: 'rgba(32,30,29,.5)',
              marginBottom: 12,
            }}
          >
            Difficulty
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 26 }}>
            {(['Any', 'Easy', 'Medium', 'Hard'] as const).map((d) => (
              <label className="radio" key={d}>
                <input
                  type="radio"
                  name="difficulty-filter"
                  checked={difficulty === d}
                  onChange={() => setDifficulty(d)}
                />
                <span className="dot" />
                {d}
              </label>
            ))}
          </div>
          <div
            style={{
              fontSize: 10,
              letterSpacing: '.09em',
              textTransform: 'uppercase',
              color: 'rgba(32,30,29,.5)',
              marginBottom: 12,
            }}
          >
            Course
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 26 }}>
            {COURSES.map((c) => (
              <button
                key={c}
                type="button"
                className={`tag ${course === c ? 'tag-accent' : 'tag-neutral'}`}
                onClick={() => setCourse(course === c ? null : c)}
              >
                {c}
              </button>
            ))}
          </div>
          <div
            style={{
              fontSize: 10,
              letterSpacing: '.09em',
              textTransform: 'uppercase',
              color: 'rgba(32,30,29,.5)',
              marginBottom: 12,
            }}
          >
            Ingredient on hand
          </div>
          <input
            className="input"
            placeholder="e.g. tomatoes"
            style={{ background: 'var(--color-bg)' }}
            value={ingredientOnHand}
            onChange={(e) => setIngredientOnHand(e.target.value)}
          />
          <button className="btn btn-ghost" style={{ marginTop: 20 }} onClick={clearFilters} disabled={!hasFilters}>
            Clear filters
          </button>
        </aside>
        <div style={{ padding: '30px 34px 40px' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
            <input
              className="input"
              placeholder="Search recipes…"
              style={{ flex: 1, minHeight: 44, background: 'var(--color-surface)' }}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="seg">
              {(
                [
                  ['recent', 'Recent'],
                  ['az', 'A–Z'],
                  ['most-cooked', 'Most cooked'],
                ] as const
              ).map(([value, label]) => (
                <label className="seg-opt" key={value}>
                  <input type="radio" name="sort" checked={sort === value} onChange={() => setSort(value)} />
                  {label}
                </label>
              ))}
            </div>
          </div>
          <p className="text-muted" style={{ fontSize: 12.5, marginBottom: 22 }}>
            {filtered.length} recipe{filtered.length === 1 ? '' : 's'}
            {course ? (
              <>
                {' '}
                · filtered by <strong style={{ fontWeight: 600 }}>{course}</strong>
              </>
            ) : null}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 18 }}>
            {filtered.map((r) => (
              <Link
                key={r.id}
                className="card elev-sm"
                to={`/recipe/${r.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <span className="card-kicker">{r.course}</span>
                <span className="card-title">{r.title}</span>
                <p className="card-body">{r.notes || `From ${r.source || 'the archive'}.`}</p>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span className="tag tag-accent">{r.difficulty}</span>
                  <span className="tag tag-neutral">Serves {r.servings}</span>
                </div>
                <span className="card-meta">
                  {r.timesCooked === 0
                    ? 'Not cooked yet'
                    : r.timesCooked === 1
                      ? 'Cooked once'
                      : `Cooked ${r.timesCooked} times`}
                </span>
              </Link>
            ))}
            <div
              className="card"
              style={{
                alignItems: 'flex-start',
                justifyContent: 'center',
                background: 'transparent',
                border: '1.5px dashed var(--color-neutral-400)',
                minHeight: 172,
              }}
            >
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: 17 }}>Add a recipe</span>
              <p className="card-body" style={{ flex: 'none' }}>
                Type it in, or paste a wall of text and let it split itself.
              </p>
              <Link className="btn btn-secondary" to="/new">
                Start
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
