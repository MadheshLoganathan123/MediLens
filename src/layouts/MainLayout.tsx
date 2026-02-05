import { Outlet } from "react-router-dom";

export function MainLayout() {
  return (
    <div className="min-h-screen w-full bg-gray-50">
      <Outlet />
    </div>
  );
}

