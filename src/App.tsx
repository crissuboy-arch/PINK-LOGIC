import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Calendario from './pages/Gestao/Calendario';
import Ideias from './pages/Gestao/Ideias';
import Checklist from './pages/Gestao/Checklist';
import Campanhas from './pages/Gestao/Campanhas';
import Produtos from './pages/Gestao/Produtos';
import Status from './pages/Gestao/Status';
import Editor from './pages/Criacao/Editor';
import { StoryCreator, CopyGenerator, StrategicVision, StickerStudio, HubModels } from './pages/Criacao/SubPages';
import LogoStudioIA from './pages/Criacao/LogoStudioIA';
import BrandKitPro from './pages/Criacao/BrandKitPro';
import MockupStudio from './pages/Criacao/MockupStudio';
import QRCodeStudio from './pages/Criacao/QRCodeStudio';
import BrandManual from './pages/Criacao/BrandManual';
import TemplatesPremium from './pages/Criacao/TemplatesPremium';
import Estrategia from './pages/Estrategia';
import { MeusProjetos } from './pages/Biblioteca/SubPages';
import Login from './pages/Auth/Login';
import AgentDashboard from './pages/System/AgentDashboard';
import ExecutionDashboard from './pages/Sistema/ExecutionDashboard';

import { EditorProvider } from './contexts/EditorContext';
import { GestaoProvider } from './contexts/GestaoContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ProductProvider } from './contexts/ProductContext';
import { PublisherProvider } from './contexts/PublisherContext';
import PublicadorAutomatico from './pages/Gestao/PublicadorAutomatico';

function App() {
  return (
    <LanguageProvider>
      <ProductProvider>
        <PublisherProvider>
          <GestaoProvider>
            <EditorProvider>
              <Router>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/" element={<Layout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="gestao/calendario" element={<Calendario />} />
                    <Route path="gestao/ideias" element={<Ideias />} />
                    <Route path="gestao/checklists" element={<Checklist />} />
                    <Route path="gestao/campanhas" element={<Campanhas />} />
                    <Route path="gestao/produtos" element={<Produtos />} />
                    <Route path="gestao/status" element={<Status />} />
                    <Route path="publicador-automatico" element={<PublicadorAutomatico />} />
                    
                    <Route path="criacao/editor" element={<Editor />} />
                    <Route path="criacao/carrossel" element={<Editor isCarouselOnly={true} />} />
                    <Route path="criacao/templates" element={<TemplatesPremium />} />
                    <Route path="criacao/brandkit" element={<BrandKitPro />} />
                    <Route path="criacao/story" element={<StoryCreator />} />
                    <Route path="criacao/copy" element={<CopyGenerator />} />
                    <Route path="criacao/logo" element={<LogoStudioIA />} />
                    <Route path="criacao/mockups" element={<MockupStudio />} />
                    <Route path="criacao/qrcode" element={<QRCodeStudio />} />
                    <Route path="criacao/manual" element={<BrandManual />} />
                    <Route path="criacao/vision" element={<StrategicVision />} />
                    <Route path="criacao/stickers" element={<StickerStudio />} />
                    <Route path="criacao/models" element={<HubModels />} />
                    
                    <Route path="estrategia" element={<Estrategia />} />
                    <Route path="biblioteca" element={<MeusProjetos />} />
                    <Route path="sistema/agentes" element={<AgentDashboard />} />
                    <Route path="sistema/execucao" element={<ExecutionDashboard />} />
                  </Route>
                </Routes>
              </Router>
            </EditorProvider>
          </GestaoProvider>
        </PublisherProvider>
      </ProductProvider>
    </LanguageProvider>
  );
}

export default App;
