import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

interface NavProps {
  active?: 'library' | 'new';
  right?: ReactNode;
  backTo?: { to: string; label: string };
}

export default function Nav({ active, right, backTo }: NavProps) {
  return (
    <div className="nav" style={{ padding: '16px 28px', background: 'var(--color-surface)' }}>
      <Link className="nav-brand" to="/library">
        Pantry
      </Link>
      {backTo ? (
        <Link to={backTo.to}>{backTo.label}</Link>
      ) : (
        <>
          <Link to="/library" aria-current={active === 'library' ? 'page' : undefined}>
            Library
          </Link>
          <Link to="/new" aria-current={active === 'new' ? 'page' : undefined}>
            New recipe
          </Link>
          <span className="nav-inactive" title="Not built in this pass">
            Shopping list
          </span>
        </>
      )}
      {right && <div style={{ marginLeft: 18, display: 'flex', gap: 10 }}>{right}</div>}
    </div>
  );
}
