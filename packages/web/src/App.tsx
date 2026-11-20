import { BrowserRouter, HashRouter, Routes, Route } from 'react-router-dom';
// Desktop (Electron) carrega o dist por file:// — aí o pathname é o caminho
// do ficheiro e o BrowserRouter não casa nenhuma rota (ecrã vazio). Só
// nesse caso usa-se HashRouter; no browser/Vercel nada muda.
const isFileProtocol =
  typeof window !== 'undefined' && window.location.protocol === 'file:';
const Router = isFileProtocol ? HashRouter : BrowserRouter;
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Calendario from './pages/Gestao/Calendario';
import Ideias from './pages/Gestao/Ideias';
import Checklist from './pages/Gestao/Checklist';
import Campanhas from './pages/Gestao/Campanhas';
import Produtos from './pages/Gestao/Produtos';
import Status from './pages/Gestao/Status';
import Editor from './pages/Criacao/Editor';
import CarouselFlow from './pages/Criacao/CarouselFlow';
import CaptionStudio from './pages/Criacao/CaptionStudio';
import { StoryCreator, CopyGenerator, StrategicVision, StickerStudio, HubModels } from './pages/Criacao/SubPages';
import LogoStudioIA from './pages/Criacao/LogoStudioIA';
import BrandKitPro from './pages/Criacao/BrandKitPro';
import MockupStudio from './pages/Criacao/MockupStudio';
import QRCodeStudio from './pages/Criacao/QRCodeStudio';
import CortesVirais from './pages/Criacao/CortesVirais';
import BrandManual from './pages/Criacao/BrandManual';
import TemplatesPremium from './pages/Criacao/TemplatesPremium';
import Estrategia from './pages/Estrategia';
import { MeusProjetos } from './pages/Biblioteca/SubPages';
import Login from './pages/Auth/Login';
import AIConnectionPage from './pages/Settings/AIConnection';
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
            <Router>
              <EditorProvider>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/redefinir-senha" element={<Login initialMode="reset" />} />
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
                    <Route path="criacao/carrossel-fluxo" element={<CarouselFlow />} />
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
                    <Route path="criacao/legendas" element={<CaptionStudio />} />
                    <Route path="criacao/cortes" element={<CortesVirais />} />
                    <Route path="criacao/models" element={<HubModels />} />
                    
                    <Route path="estrategia" element={<Estrategia />} />
                    <Route path="biblioteca" element={<MeusProjetos />} />
                    <Route path="sistema/agentes" element={<AgentDashboard />} />
                    <Route path="sistema/ia" element={<AIConnectionPage />} />
                    <Route path="sistema/execucao" element={<ExecutionDashboard />} />
                  </Route>
                </Routes>
              </EditorProvider>
            </Router>
          </GestaoProvider>
        </PublisherProvider>
      </ProductProvider>
    </LanguageProvider>
  );
}

export default App;
