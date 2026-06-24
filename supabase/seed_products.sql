-- seed_products.sql
-- Seed script for populating product templates, stages, and standard tasks

DO $$
DECLARE
  v_template_id UUID;
  v_stage_id UUID;
  
  -- Standard jobs/tasks array for generic templates
  v_jobs TEXT[] := ARRAY['Contrato', 'Financeiro', 'Briefing', 'Produção', 'Revisão Interna', 'Aprovação Cliente', 'Entrega', 'Pós-Projeto'];
  v_job TEXT;
  i INT;
BEGIN
  -- Delete existing templates to avoid duplicates
  DELETE FROM public.product_templates WHERE name IN (
    'Social Media (Mensal)', 'Social Media (30 Dias)', 'Branding', 'Branding (45 Dias)', 'Criação de Site', 'Consultoria Estratégica', 'Mentoria (Recorrente)'
  );

  -- =========================================================================
  -- 1. SOCIAL MEDIA (30 DIAS)
  -- =========================================================================
  INSERT INTO public.product_templates (name, category, type, base_price, is_active, is_sequential)
  VALUES ('Social Media (30 Dias)', 'Social Media', 'social_media', 0.00, true, true)
  RETURNING id INTO v_template_id;

  -- Stage 1: Fase Comercial
  INSERT INTO public.product_template_stages (template_id, name, order_index, duration_days, auto_start, requires_approval)
  VALUES (v_template_id, 'Fase Comercial', 0, 11, true, false) RETURNING id INTO v_stage_id;

  INSERT INTO public.product_template_tasks (stage_id, title, role, deadline_offset, task_type, is_required) VALUES
    (v_stage_id, 'Envio da Proposta Comercial', 'Comercial', 1, 'task', true),
    (v_stage_id, 'Aprovação da Proposta', 'Cliente', 4, 'approval', true),
    (v_stage_id, 'Emissão do Contrato', 'Financeiro', 5, 'task', true),
    (v_stage_id, 'Assinatura do Contrato', 'Cliente', 8, 'approval', true),
    (v_stage_id, 'Emissão da Cobrança', 'Financeiro', 9, 'task', true),
    (v_stage_id, 'Confirmação de Pagamento', 'Financeiro', 11, 'approval', true);

  -- Stage 2: Fase Operacional
  INSERT INTO public.product_template_stages (template_id, name, order_index, duration_days, auto_start, requires_approval)
  VALUES (v_template_id, 'Fase Operacional', 1, 30, true, false) RETURNING id INTO v_stage_id;

  INSERT INTO public.product_template_tasks (stage_id, title, role, deadline_offset, task_type, is_required) VALUES
    (v_stage_id, 'Reunião de Onboarding', 'default', 12, 'task', true),
    (v_stage_id, 'Briefing e Diagnóstico', 'default', 14, 'task', true),
    (v_stage_id, 'Planejamento Estratégico', 'default', 17, 'task', true),
    (v_stage_id, 'Produção das Copys', 'copywriter', 21, 'task', true),
    (v_stage_id, 'Aprovação das Copys', 'Cliente', 24, 'approval', true),
    (v_stage_id, 'Ajustes das Copys', 'copywriter', 26, 'task', true),
    (v_stage_id, 'Desenvolvimento dos Posts', 'designer', 32, 'task', true),
    (v_stage_id, 'Revisão Interna', 'default', 33, 'task', true),
    (v_stage_id, 'Aprovação dos Posts', 'Cliente', 36, 'approval', true),
    (v_stage_id, 'Ajustes Finais', 'designer', 38, 'task', true),
    (v_stage_id, 'Agendamento', 'default', 39, 'task', true),
    (v_stage_id, 'Monitoramento', 'default', 40, 'task', true),
    (v_stage_id, 'Relatório Mensal', 'default', 41, 'task', true),
    (v_stage_id, 'Aprovação de Encerramento', 'Cliente', 42, 'approval', true);


  -- =========================================================================
  -- 2. BRANDING (45 DIAS)
  -- =========================================================================
  INSERT INTO public.product_templates (name, category, type, base_price, is_active, is_sequential)
  VALUES ('Branding (45 Dias)', 'Design', 'branding', 0.00, true, true)
  RETURNING id INTO v_template_id;

  -- Stage 1: Fase Comercial
  INSERT INTO public.product_template_stages (template_id, name, order_index, duration_days, auto_start, requires_approval)
  VALUES (v_template_id, 'Fase Comercial', 0, 11, true, false) RETURNING id INTO v_stage_id;

  INSERT INTO public.product_template_tasks (stage_id, title, role, deadline_offset, task_type, is_required) VALUES
    (v_stage_id, 'Envio da Proposta Comercial', 'Comercial', 1, 'task', true),
    (v_stage_id, 'Aprovação da Proposta', 'Cliente', 4, 'approval', true),
    (v_stage_id, 'Emissão do Contrato', 'Financeiro', 5, 'task', true),
    (v_stage_id, 'Assinatura do Contrato', 'Cliente', 8, 'approval', true),
    (v_stage_id, 'Emissão da Cobrança Inicial', 'Financeiro', 9, 'task', true),
    (v_stage_id, 'Confirmação do Pagamento', 'Financeiro', 11, 'approval', true);

  -- Stage 2: Fase Estratégica
  INSERT INTO public.product_template_stages (template_id, name, order_index, duration_days, auto_start, requires_approval)
  VALUES (v_template_id, 'Fase Estratégica', 1, 23, true, false) RETURNING id INTO v_stage_id;

  INSERT INTO public.product_template_tasks (stage_id, title, role, deadline_offset, task_type, is_required) VALUES
    (v_stage_id, 'Onboarding + Briefing', 'default', 13, 'task', true),
    (v_stage_id, 'Pesquisa e Diagnóstico', 'default', 17, 'task', true),
    (v_stage_id, 'Estratégia de Marca', 'default', 24, 'task', true),
    (v_stage_id, 'Manual Estratégico', 'default', 29, 'task', true),
    (v_stage_id, 'Aprovação da Estratégia', 'Cliente', 32, 'approval', true),
    (v_stage_id, 'Ajustes Estratégicos', 'default', 34, 'task', true);

  -- Stage 3: Fase Criativa
  INSERT INTO public.product_template_stages (template_id, name, order_index, duration_days, auto_start, requires_approval)
  VALUES (v_template_id, 'Fase Criativa', 2, 25, true, false) RETURNING id INTO v_stage_id;

  INSERT INTO public.product_template_tasks (stage_id, title, role, deadline_offset, task_type, is_required) VALUES
    (v_stage_id, 'Briefing Criativo', 'default', 35, 'task', true),
    (v_stage_id, 'Conceito A', 'designer', 39, 'task', true),
    (v_stage_id, 'Conceito B', 'designer', 43, 'task', true),
    (v_stage_id, 'Montagem da Apresentação', 'default', 45, 'task', true),
    (v_stage_id, 'Escolha da Proposta', 'Cliente', 48, 'approval', true),
    (v_stage_id, 'Refinamento da Marca', 'designer', 52, 'task', true),
    (v_stage_id, 'Desenvolvimento das Aplicações', 'designer', 54, 'task', true),
    (v_stage_id, 'Construção do Manual Visual', 'designer', 57, 'task', true),
    (v_stage_id, 'Aprovação Final da Marca', 'Cliente', 59, 'approval', true);

  -- Stage 4: Fase de Entrega
  INSERT INTO public.product_template_stages (template_id, name, order_index, duration_days, auto_start, requires_approval)
  VALUES (v_template_id, 'Fase de Entrega', 3, 8, true, false) RETURNING id INTO v_stage_id;

  INSERT INTO public.product_template_tasks (stage_id, title, role, deadline_offset, task_type, is_required) VALUES
    (v_stage_id, 'Solicitação do Pagamento Final', 'Financeiro', 60, 'task', true),
    (v_stage_id, 'Confirmação do Pagamento Final', 'Financeiro', 62, 'approval', true),
    (v_stage_id, 'Exportação dos Arquivos', 'designer', 63, 'task', true),
    (v_stage_id, 'Organização do Drive', 'default', 64, 'task', true),
    (v_stage_id, 'Entrega Oficial', 'default', 65, 'task', true),
    (v_stage_id, 'Produção do Case de Portfólio', 'default', 67, 'task', true);


  -- =========================================================================
  -- 3. CRIAÇÃO DE SITE
  -- =========================================================================
  INSERT INTO public.product_templates (name, category, type, base_price, is_active, is_sequential)
  VALUES ('Criação de Site', 'Desenvolvimento', 'website', 0.00, true, true)
  RETURNING id INTO v_template_id;

  -- Stage 1
  INSERT INTO public.product_template_stages (template_id, name, order_index, duration_days, auto_start, requires_approval)
  VALUES (v_template_id, '1. Onboarding', 0, 5, true, false) RETURNING id INTO v_stage_id;
  FOR i IN 1 .. array_length(v_jobs, 1) LOOP
    v_job := v_jobs[i];
    INSERT INTO public.product_template_tasks (stage_id, title, role, deadline_offset, task_type, is_required)
    VALUES (v_stage_id, v_job, 'default', (i - 1) * 2, 'task', true);
  END LOOP;
  
  -- Stage 2
  INSERT INTO public.product_template_stages (template_id, name, order_index, duration_days, auto_start, requires_approval)
  VALUES (v_template_id, '2. Arquitetura e Planejamento', 1, 5, true, false) RETURNING id INTO v_stage_id;
  FOR i IN 1 .. array_length(v_jobs, 1) LOOP
    v_job := v_jobs[i];
    INSERT INTO public.product_template_tasks (stage_id, title, role, deadline_offset, task_type, is_required)
    VALUES (v_stage_id, v_job, 'default', (i - 1) * 2, 'task', true);
  END LOOP;
  
  -- Stage 3
  INSERT INTO public.product_template_stages (template_id, name, order_index, duration_days, auto_start, requires_approval)
  VALUES (v_template_id, '3. Produção de Conteúdo', 2, 7, true, false) RETURNING id INTO v_stage_id;
  FOR i IN 1 .. array_length(v_jobs, 1) LOOP
    v_job := v_jobs[i];
    INSERT INTO public.product_template_tasks (stage_id, title, role, deadline_offset, task_type, is_required)
    VALUES (v_stage_id, v_job, 'default', (i - 1) * 2, 'task', true);
  END LOOP;
  
  -- Stage 4
  INSERT INTO public.product_template_stages (template_id, name, order_index, duration_days, auto_start, requires_approval)
  VALUES (v_template_id, '4. Wireframe', 3, 7, true, true) RETURNING id INTO v_stage_id;
  FOR i IN 1 .. array_length(v_jobs, 1) LOOP
    v_job := v_jobs[i];
    INSERT INTO public.product_template_tasks (stage_id, title, role, deadline_offset, task_type, is_required)
    VALUES (v_stage_id, v_job, 'default', (i - 1) * 2, 'task', true);
  END LOOP;
  
  -- Stage 5
  INSERT INTO public.product_template_stages (template_id, name, order_index, duration_days, auto_start, requires_approval)
  VALUES (v_template_id, '5. Design UI', 4, 10, true, true) RETURNING id INTO v_stage_id;
  FOR i IN 1 .. array_length(v_jobs, 1) LOOP
    v_job := v_jobs[i];
    INSERT INTO public.product_template_tasks (stage_id, title, role, deadline_offset, task_type, is_required)
    VALUES (v_stage_id, v_job, 'default', (i - 1) * 2, 'task', true);
  END LOOP;
  
  -- Stage 6
  INSERT INTO public.product_template_stages (template_id, name, order_index, duration_days, auto_start, requires_approval)
  VALUES (v_template_id, '6. Desenvolvimento', 5, 15, true, false) RETURNING id INTO v_stage_id;
  FOR i IN 1 .. array_length(v_jobs, 1) LOOP
    v_job := v_jobs[i];
    INSERT INTO public.product_template_tasks (stage_id, title, role, deadline_offset, task_type, is_required)
    VALUES (v_stage_id, v_job, 'default', (i - 1) * 2, 'task', true);
  END LOOP;
  
  -- Stage 7
  INSERT INTO public.product_template_stages (template_id, name, order_index, duration_days, auto_start, requires_approval)
  VALUES (v_template_id, '7. Revisão e Homologação', 6, 7, true, true) RETURNING id INTO v_stage_id;
  FOR i IN 1 .. array_length(v_jobs, 1) LOOP
    v_job := v_jobs[i];
    INSERT INTO public.product_template_tasks (stage_id, title, role, deadline_offset, task_type, is_required)
    VALUES (v_stage_id, v_job, 'default', (i - 1) * 2, 'task', true);
  END LOOP;
  
  -- Stage 8
  INSERT INTO public.product_template_stages (template_id, name, order_index, duration_days, auto_start, requires_approval)
  VALUES (v_template_id, '8. Publicação e Treinamento', 7, 5, true, false) RETURNING id INTO v_stage_id;
  FOR i IN 1 .. array_length(v_jobs, 1) LOOP
    v_job := v_jobs[i];
    INSERT INTO public.product_template_tasks (stage_id, title, role, deadline_offset, task_type, is_required)
    VALUES (v_stage_id, v_job, 'default', (i - 1) * 2, 'task', true);
  END LOOP;


  -- =========================================================================
  -- 4. CONSULTORIA ESTRATÉGICA
  -- =========================================================================
  INSERT INTO public.product_templates (name, category, type, base_price, is_active, is_sequential)
  VALUES ('Consultoria Estratégica', 'Consultoria', 'consultoria', 0.00, true, true)
  RETURNING id INTO v_template_id;

  -- Stage 1
  INSERT INTO public.product_template_stages (template_id, name, order_index, duration_days, auto_start, requires_approval)
  VALUES (v_template_id, '1. Contratação', 0, 3, true, false) RETURNING id INTO v_stage_id;
  FOR i IN 1 .. array_length(v_jobs, 1) LOOP
    v_job := v_jobs[i];
    INSERT INTO public.product_template_tasks (stage_id, title, role, deadline_offset, task_type, is_required)
    VALUES (v_stage_id, v_job, 'default', (i - 1) * 2, 'task', true);
  END LOOP;
  
  -- Stage 2
  INSERT INTO public.product_template_stages (template_id, name, order_index, duration_days, auto_start, requires_approval)
  VALUES (v_template_id, '2. Diagnóstico', 1, 5, true, false) RETURNING id INTO v_stage_id;
  FOR i IN 1 .. array_length(v_jobs, 1) LOOP
    v_job := v_jobs[i];
    INSERT INTO public.product_template_tasks (stage_id, title, role, deadline_offset, task_type, is_required)
    VALUES (v_stage_id, v_job, 'default', (i - 1) * 2, 'task', true);
  END LOOP;
  
  -- Stage 3
  INSERT INTO public.product_template_stages (template_id, name, order_index, duration_days, auto_start, requires_approval)
  VALUES (v_template_id, '3. Pesquisa', 2, 7, true, false) RETURNING id INTO v_stage_id;
  FOR i IN 1 .. array_length(v_jobs, 1) LOOP
    v_job := v_jobs[i];
    INSERT INTO public.product_template_tasks (stage_id, title, role, deadline_offset, task_type, is_required)
    VALUES (v_stage_id, v_job, 'default', (i - 1) * 2, 'task', true);
  END LOOP;
  
  -- Stage 4
  INSERT INTO public.product_template_stages (template_id, name, order_index, duration_days, auto_start, requires_approval)
  VALUES (v_template_id, '4. Estratégia', 3, 10, true, false) RETURNING id INTO v_stage_id;
  FOR i IN 1 .. array_length(v_jobs, 1) LOOP
    v_job := v_jobs[i];
    INSERT INTO public.product_template_tasks (stage_id, title, role, deadline_offset, task_type, is_required)
    VALUES (v_stage_id, v_job, 'default', (i - 1) * 2, 'task', true);
  END LOOP;
  
  -- Stage 5
  INSERT INTO public.product_template_stages (template_id, name, order_index, duration_days, auto_start, requires_approval)
  VALUES (v_template_id, '5. Preparação da Apresentação', 4, 5, true, false) RETURNING id INTO v_stage_id;
  FOR i IN 1 .. array_length(v_jobs, 1) LOOP
    v_job := v_jobs[i];
    INSERT INTO public.product_template_tasks (stage_id, title, role, deadline_offset, task_type, is_required)
    VALUES (v_stage_id, v_job, 'default', (i - 1) * 2, 'task', true);
  END LOOP;
  
  -- Stage 6
  INSERT INTO public.product_template_stages (template_id, name, order_index, duration_days, auto_start, requires_approval)
  VALUES (v_template_id, '6. Reunião de Consultoria', 5, 3, true, false) RETURNING id INTO v_stage_id;
  FOR i IN 1 .. array_length(v_jobs, 1) LOOP
    v_job := v_jobs[i];
    INSERT INTO public.product_template_tasks (stage_id, title, role, deadline_offset, task_type, is_required)
    VALUES (v_stage_id, v_job, 'default', (i - 1) * 2, 'task', true);
  END LOOP;
  
  -- Stage 7
  INSERT INTO public.product_template_stages (template_id, name, order_index, duration_days, auto_start, requires_approval)
  VALUES (v_template_id, '7. Entrega', 6, 3, true, false) RETURNING id INTO v_stage_id;
  FOR i IN 1 .. array_length(v_jobs, 1) LOOP
    v_job := v_jobs[i];
    INSERT INTO public.product_template_tasks (stage_id, title, role, deadline_offset, task_type, is_required)
    VALUES (v_stage_id, v_job, 'default', (i - 1) * 2, 'task', true);
  END LOOP;
  
  -- Stage 8
  INSERT INTO public.product_template_stages (template_id, name, order_index, duration_days, auto_start, requires_approval)
  VALUES (v_template_id, '8. Follow-up', 7, 5, true, false) RETURNING id INTO v_stage_id;
  FOR i IN 1 .. array_length(v_jobs, 1) LOOP
    v_job := v_jobs[i];
    INSERT INTO public.product_template_tasks (stage_id, title, role, deadline_offset, task_type, is_required)
    VALUES (v_stage_id, v_job, 'default', (i - 1) * 2, 'task', true);
  END LOOP;


  -- =========================================================================
  -- 5. MENTORIA (RECORRENTE)
  -- =========================================================================
  INSERT INTO public.product_templates (name, category, type, base_price, is_active, is_sequential)
  VALUES ('Mentoria (Recorrente)', 'Consultoria', 'consultoria', 0.00, true, true)
  RETURNING id INTO v_template_id;

  -- Stage 1
  INSERT INTO public.product_template_stages (template_id, name, order_index, duration_days, auto_start, requires_approval)
  VALUES (v_template_id, '1. Entrada do Cliente', 0, 5, true, false) RETURNING id INTO v_stage_id;
  FOR i IN 1 .. array_length(v_jobs, 1) LOOP
    v_job := v_jobs[i];
    INSERT INTO public.product_template_tasks (stage_id, title, role, deadline_offset, task_type, is_required)
    VALUES (v_stage_id, v_job, 'default', (i - 1) * 2, 'task', true);
  END LOOP;
  
  -- Stage 2
  INSERT INTO public.product_template_stages (template_id, name, order_index, duration_days, auto_start, requires_approval)
  VALUES (v_template_id, '2. Planejamento da Mentoria', 1, 5, true, false) RETURNING id INTO v_stage_id;
  FOR i IN 1 .. array_length(v_jobs, 1) LOOP
    v_job := v_jobs[i];
    INSERT INTO public.product_template_tasks (stage_id, title, role, deadline_offset, task_type, is_required)
    VALUES (v_stage_id, v_job, 'default', (i - 1) * 2, 'task', true);
  END LOOP;
  
  -- Stage 3
  INSERT INTO public.product_template_stages (template_id, name, order_index, duration_days, auto_start, requires_approval)
  VALUES (v_template_id, '3. Reunião Mensal', 2, 3, true, false) RETURNING id INTO v_stage_id;
  FOR i IN 1 .. array_length(v_jobs, 1) LOOP
    v_job := v_jobs[i];
    INSERT INTO public.product_template_tasks (stage_id, title, role, deadline_offset, task_type, is_required)
    VALUES (v_stage_id, v_job, 'default', (i - 1) * 2, 'task', true);
  END LOOP;
  
  -- Stage 4
  INSERT INTO public.product_template_stages (template_id, name, order_index, duration_days, auto_start, requires_approval)
  VALUES (v_template_id, '4. Plano de Ação', 3, 5, true, false) RETURNING id INTO v_stage_id;
  FOR i IN 1 .. array_length(v_jobs, 1) LOOP
    v_job := v_jobs[i];
    INSERT INTO public.product_template_tasks (stage_id, title, role, deadline_offset, task_type, is_required)
    VALUES (v_stage_id, v_job, 'default', (i - 1) * 2, 'task', true);
  END LOOP;
  
  -- Stage 5
  INSERT INTO public.product_template_stages (template_id, name, order_index, duration_days, auto_start, requires_approval)
  VALUES (v_template_id, '5. Execução pelo Cliente', 4, 10, true, false) RETURNING id INTO v_stage_id;
  FOR i IN 1 .. array_length(v_jobs, 1) LOOP
    v_job := v_jobs[i];
    INSERT INTO public.product_template_tasks (stage_id, title, role, deadline_offset, task_type, is_required)
    VALUES (v_stage_id, v_job, 'default', (i - 1) * 2, 'task', true);
  END LOOP;
  
  -- Stage 6
  INSERT INTO public.product_template_stages (template_id, name, order_index, duration_days, auto_start, requires_approval)
  VALUES (v_template_id, '6. Suporte Assíncrono', 5, 7, true, false) RETURNING id INTO v_stage_id;
  FOR i IN 1 .. array_length(v_jobs, 1) LOOP
    v_job := v_jobs[i];
    INSERT INTO public.product_template_tasks (stage_id, title, role, deadline_offset, task_type, is_required)
    VALUES (v_stage_id, v_job, 'default', (i - 1) * 2, 'task', true);
  END LOOP;
  
  -- Stage 7
  INSERT INTO public.product_template_stages (template_id, name, order_index, duration_days, auto_start, requires_approval)
  VALUES (v_template_id, '7. Revisão de Resultados', 6, 5, true, false) RETURNING id INTO v_stage_id;
  FOR i IN 1 .. array_length(v_jobs, 1) LOOP
    v_job := v_jobs[i];
    INSERT INTO public.product_template_tasks (stage_id, title, role, deadline_offset, task_type, is_required)
    VALUES (v_stage_id, v_job, 'default', (i - 1) * 2, 'task', true);
  END LOOP;
  
  -- Stage 8
  INSERT INTO public.product_template_stages (template_id, name, order_index, duration_days, auto_start, requires_approval)
  VALUES (v_template_id, '8. Renovação ou Encerramento', 7, 5, true, true) RETURNING id INTO v_stage_id;
  FOR i IN 1 .. array_length(v_jobs, 1) LOOP
    v_job := v_jobs[i];
    INSERT INTO public.product_template_tasks (stage_id, title, role, deadline_offset, task_type, is_required)
    VALUES (v_stage_id, v_job, 'default', (i - 1) * 2, 'task', true);
  END LOOP;

END $$;
