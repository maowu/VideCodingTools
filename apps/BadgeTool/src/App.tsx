import { Routes, Route } from "react-router-dom";
import { WorkspaceHome } from "@/pages/WorkspaceHome";
import { MedalWorkbench } from "@/pages/MedalWorkbench";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<WorkspaceHome />} />
      <Route path="/work/:id" element={<MedalWorkbench />} />
    </Routes>
  );
}
