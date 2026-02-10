import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom';
import { RootLayout } from './layouts/RootLayout';
import { SendLayout } from './layouts/SendLayout';
import { ChatsPage } from './pages/ChatsPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { QuickRepliesPage } from './pages/QuickRepliesPage';
import { SchedulePage } from './pages/SchedulePage';
import { SendPage } from './pages/SendPage';
import { TemplatesPage } from './pages/TemplatesPage';

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<RootLayout />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route element={<SendLayout />}>
        <Route path="/send" element={<SendPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
      </Route>
      <Route path="/dashboard/quick-replies" element={<QuickRepliesPage />} />
      <Route path="/templates" element={<TemplatesPage />} />
      <Route path="/chats" element={<ChatsPage />} />
    </Route>,
  ),
);
