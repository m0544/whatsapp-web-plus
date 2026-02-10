import { Outlet } from 'react-router-dom';
import { ContactSidebar } from '@/components/ContactSidebar';

export function SendLayout() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      <div className="flex-1 min-w-0 overflow-auto">
        <Outlet />
      </div>
      <ContactSidebar />
    </div>
  );
}
