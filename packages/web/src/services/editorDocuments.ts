import type { Slide, CanvasFormat } from '../contexts/EditorContext';
import { requireSupabase } from './api';

export interface EditorDocument {
  slides: Slide[];
  canvasFormat: CanvasFormat;
  slideCount: number;
  caption: string;
}
export async function loadEditorData(projectId: string): Promise<{ document: EditorDocument; version: number } | null> {
  const { data, error } = await requireSupabase().from('pl_editor_documents').select('document, version').eq('project_id', projectId).maybeSingle();
  if (error) throw new Error('Não foi possível abrir o design: ' + error.message);
  return data;
}
export async function saveEditorData(projectId: string, document: EditorDocument, expectedVersion: number): Promise<number> {
  if (!document.slides.length) throw new Error('O design precisa ter pelo menos um slide.');
  const { data, error } = await requireSupabase().rpc('pl_save_editor_document', {
    p_project_id: projectId, p_document: document, p_expected_version: expectedVersion,
  });
  if (error) throw new Error('Não foi possível salvar o design: ' + error.message);
  return data as number;
}
