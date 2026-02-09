import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom';
import { RootLayout } from './layouts/RootLayout';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { QuickRepliesPage } from './pages/QuickRepliesPage';
import { SendPage } from './pages/SendPage';
import { TemplatesPage } from './pages/TemplatesPage';

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<RootLayout />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/send" element={<SendPage />} />
      <Route path="/dashboard/quick-replies" element={<QuickRepliesPage />} />
      <Route path="/templates" element={<TemplatesPage />} />
    </Route>,
  ),
);
