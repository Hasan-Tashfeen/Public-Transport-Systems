import { BrowserRouter, Route, Routes } from "react-router-dom";
import MapPage from "./pages/MapPage";
import RouteDetailPage from "./pages/RouteDetailPage";
import RouteEditorPage from "./pages/RouteEditorPage";
import StopDetailPage from "./pages/StopDetailPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MapPage />} />
        <Route path="/routes/:id" element={<RouteDetailPage />} />
        <Route path="/stops/:id" element={<StopDetailPage />} />
        <Route path="/editor" element={<RouteEditorPage />} />
        <Route path="/editor/:id" element={<RouteEditorPage />} />
      </Routes>
    </BrowserRouter>
  );
}
