import { Navigate, Route, Routes } from 'react-router-dom';
import { RecipesProvider } from './data/useRecipes';
import LibraryPage from './pages/LibraryPage';
import RecipeFormPage from './pages/RecipeFormPage';
import RecipeDetailPage from './pages/RecipeDetailPage';

export default function App() {
  return (
    <RecipesProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/library" replace />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/new" element={<RecipeFormPage />} />
        <Route path="/recipe/:id" element={<RecipeDetailPage />} />
        <Route path="/recipe/:id/edit" element={<RecipeFormPage />} />
        <Route path="*" element={<Navigate to="/library" replace />} />
      </Routes>
    </RecipesProvider>
  );
}
