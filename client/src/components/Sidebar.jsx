import { useState } from "react";
import { Menu, X, Briefcase, Users } from "lucide-react";
import { useSelector } from "react-redux";

function NavItem({ icon, text, active = false, badge }) {
  return (
    <button
      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors
      ${active ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-800/60 hover:text-white"}
    `}
    >
      <div className="flex items-center gap-3">
        <span className="text-gray-300">{icon}</span>
        <span className="font-medium text-sm">{text}</span>
      </div>

      {badge > 0 && (
        <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </button>
  );
}

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  // 🛠️ FIX: Safe selector with fallback
  const currentWorkspace = useSelector(
    (state) => state?.workspaces?.currentWorkspace || null
  );

  const memberCount = currentWorkspace?.members?.length || 0;

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 bg-gray-900 text-white p-2 rounded-lg"
      >
        {isOpen ? <X /> : <Menu />}
      </button>

      <aside
        className={`
          fixed md:static top-0 left-0 h-full w-64 bg-gray-900 text-white p-4
          transition-transform duration-300 shadow-lg border-r border-gray-800
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="border-b border-gray-800 pb-4 mb-4">
          <h2 className="text-lg font-semibold">
            {currentWorkspace?.name || "No Workspace Selected"}
          </h2>
          <p className="text-xs text-gray-400">{memberCount} Members</p>
        </div>

        <div className="flex-1 flex flex-col gap-2">
          <NavItem icon={<Briefcase />} text="Dashboard" active />
          <NavItem icon={<Users />} text="Members" badge={memberCount} />
        </div>
      </aside>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/40 md:hidden"
        ></div>
      )}
    </>
  );
}
