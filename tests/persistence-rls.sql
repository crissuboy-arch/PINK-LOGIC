-- Integration assertions against the real schema. All fixtures are rolled back.
BEGIN;
SELECT set_config('test.owner', gen_random_uuid()::text, true);
SELECT set_config('test.other', gen_random_uuid()::text, true);
SELECT set_config('test.project', gen_random_uuid()::text, true);
INSERT INTO auth.users(id) VALUES (current_setting('test.owner')::uuid), (current_setting('test.other')::uuid);
SELECT set_config('request.jwt.claim.sub', current_setting('test.owner'), true);
SET LOCAL ROLE authenticated;
INSERT INTO public.projects(id, name) VALUES (current_setting('test.project')::uuid, 'Temporary persistence test');
INSERT INTO public.brands(project_id, name) VALUES (current_setting('test.project')::uuid, 'Test brand');
SELECT public.pl_save_editor_document(current_setting('test.project')::uuid, '{"slides":[{"id":"test","elements":[],"background":{"type":"color","value":"#000"}}],"canvasFormat":{"id":"carousel","name":"Carousel","width":1080,"height":1350},"slideCount":1,"caption":"Legenda persistida"}', 0);
DO $$ BEGIN
 IF (SELECT document->>'caption' FROM public.pl_editor_documents WHERE project_id=current_setting('test.project')::uuid) <> 'Legenda persistida' THEN RAISE EXCEPTION 'Document round trip failed'; END IF;
 PERFORM public.pl_save_editor_document(current_setting('test.project')::uuid, '{"slides":[{}],"canvasFormat":{},"caption":"Atualizada"}', 1);
 BEGIN
  PERFORM public.pl_save_editor_document(current_setting('test.project')::uuid, '{"slides":[{}],"canvasFormat":{},"caption":"Stale"}', 1);
  RAISE EXCEPTION 'Stale write was accepted';
 EXCEPTION WHEN serialization_failure THEN NULL; END;
END $$;
SELECT set_config('request.jwt.claim.sub', current_setting('test.other'), true);
DO $$ BEGIN
 IF EXISTS (SELECT 1 FROM public.projects WHERE id=current_setting('test.project')::uuid) THEN RAISE EXCEPTION 'Other account can read project'; END IF;
 IF EXISTS (SELECT 1 FROM public.pl_editor_documents WHERE project_id=current_setting('test.project')::uuid) THEN RAISE EXCEPTION 'Other account can read document'; END IF;
 BEGIN
  INSERT INTO public.brands(project_id,name) VALUES (current_setting('test.project')::uuid, 'Unauthorized');
  RAISE EXCEPTION 'Other account can write child';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN
  PERFORM public.pl_save_editor_document(current_setting('test.project')::uuid, '{"slides":[{}],"canvasFormat":{},"caption":"Unauthorized"}', 2);
  RAISE EXCEPTION 'Other account can modify document';
 EXCEPTION WHEN serialization_failure THEN NULL; END;
END $$;
SET LOCAL ROLE anon;
DO $$ BEGIN
 BEGIN
  PERFORM 1 FROM public.projects;
  RAISE EXCEPTION 'Anonymous read allowed';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', current_setting('test.owner'), true);
DELETE FROM public.projects WHERE id=current_setting('test.project')::uuid;
RESET ROLE;
DO $$ BEGIN
 IF EXISTS (SELECT 1 FROM public.pl_editor_documents WHERE project_id=current_setting('test.project')::uuid) THEN RAISE EXCEPTION 'Document cascade failed'; END IF;
 IF EXISTS (SELECT 1 FROM public.brands WHERE project_id=current_setting('test.project')::uuid) THEN RAISE EXCEPTION 'Brand cascade failed'; END IF;
END $$;
ROLLBACK;
SELECT 'PASS: document round trip, optimistic concurrency, account isolation, anonymous denial and deletion cascade; fixtures rolled back' AS result;
