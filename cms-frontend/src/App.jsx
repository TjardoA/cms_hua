import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { CmsDataProvider } from "./cms/CmsDataContext";
import CmsEdit from "./cms/CmsEdit";
import CmsPage from "./cms/CmsPage";

function App() {
  return (
    <CmsDataProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/cms" replace />} />
          <Route path="/cms" element={<CmsPage />} />
          <Route path="/cms/edit/:id" element={<CmsEdit />} />
          <Route path="*" element={<Navigate to="/cms" replace />} />
        </Routes>
      </BrowserRouter>
    </CmsDataProvider>
  );
}

export default App;
