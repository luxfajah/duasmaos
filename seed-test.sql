DO $$ 
DECLARE
  v_admin_id UUID := 'c2e56241-fec3-4a06-9f07-d83faf469585';
  v_writer_id UUID := 'bfe0c670-41c1-442e-a7be-ff48cde627d1';
  v_designer_id UUID := '2f0a1537-cafc-45ae-bf23-3139e44bdfd0';

  client_gabriela_id UUID := extensions.uuid_generate_v4();
  client_duda_id UUID := extensions.uuid_generate_v4();
  client_gabrielly_id UUID := extensions.uuid_generate_v4();
  client_spa_id UUID := extensions.uuid_generate_v4();
  client_mobiliapet_id UUID := extensions.uuid_generate_v4();
  client_lux_id UUID := extensions.uuid_generate_v4();
  client_psicologo_id UUID := extensions.uuid_generate_v4();

  proj1_id UUID := extensions.uuid_generate_v4();
  proj2_id UUID := extensions.uuid_generate_v4();
  proj3_id UUID := extensions.uuid_generate_v4();
  proj4_id UUID := extensions.uuid_generate_v4();
  proj5_id UUID := extensions.uuid_generate_v4();
  proj6_id UUID := extensions.uuid_generate_v4();
  proj7_id UUID := extensions.uuid_generate_v4();

  stage1_id UUID;
  stage2_id UUID;
  stage3_id UUID;
BEGIN

  -- 1. Insert Clients
  INSERT INTO public.clients (id, name, company, email, status, pipeline_stage, notes) VALUES
  (client_gabriela_id, 'Gabriela Seuressig', 'Gabriela Seuressig', 'gabriela@test.com', 'active', 'Onboarding', 'Cliente de Redes Sociais focado em engajamento.'),
  (client_duda_id, 'Duda', 'Duda', 'duda@test.com', 'active', 'Fechado', 'Foco no perfil pessoal.'),
  (client_gabrielly_id, 'Gabrielly Lima', 'Gabrielly Lima', 'gabi@test.com', 'active', 'Fechado', 'Site institucional e Instagram.'),
  (client_spa_id, 'Spa do Colchão', 'Spa do Colchão', 'contato@spadocolchao.com.br', 'active', 'Lead', 'Necessitam de rebranding completo.'),
  (client_mobiliapet_id, 'MobiliaPet', 'MobiliaPet', 'contato@mobiliapet.com', 'active', 'Negociação', 'Branding para e-commerce de produtos pet.'),
  (client_lux_id, 'Lux Sistemas', 'Lux Sistemas', 'admin@lux.com', 'active', 'Fechado', 'Criação de branding e UX de plataforma.'),
  (client_psicologo_id, 'Consultório de Psicologia', 'Clínica Psico', 'atendimento@psico.com', 'active', 'Proposta', 'Sistema web com agenda e gestão de pacientes.');

  -- 2. Insert Projects
  INSERT INTO public.projects (id, name, description, client_id, status, type, priority, owner_id) VALUES
  (proj1_id, 'Redes Sociais Gabriela', 'Gestão mensal de redes sociais, cronograma de postagens e artes.', client_gabriela_id, 'approved', 'redes_sociais', 'medium', v_admin_id),
  (proj2_id, 'Redes Sociais Duda', 'Criação de conteúdo para Instagram e TikTok.', client_duda_id, 'draft', 'redes_sociais', 'high', v_admin_id),
  (proj3_id, 'Site e Redes Sociais', 'Criação de landing page e material para lançamento.', client_gabrielly_id, 'review', 'site', 'urgent', v_admin_id),
  (proj4_id, 'Rebranding Spa do Colchão', 'Nova identidade visual, manual da marca e key visuals.', client_spa_id, 'copy', 'branding', 'medium', v_admin_id),
  (proj5_id, 'Branding MobiliaPet', 'Identidade visual para marca de móveis pet, embalagens e social.', client_mobiliapet_id, 'draft', 'branding', 'high', v_admin_id),
  (proj6_id, 'Branding Lux - Sistemas e UI/UX', 'Design de interface, dashboard e sistema de design.', client_lux_id, 'approved', 'site', 'urgent', v_admin_id),
  (proj7_id, 'Sistema para Psicologos', 'Desenvolvimento de portal e agendamento.', client_psicologo_id, 'delayed', 'site', 'medium', v_admin_id);

  -- 3. Insert Stages and Tasks for Proj 1
  stage1_id := extensions.uuid_generate_v4();
  stage2_id := extensions.uuid_generate_v4();
  INSERT INTO public.project_stages (id, project_id, name, position) VALUES 
  (stage1_id, proj1_id, 'Planejamento e Copy', 1),
  (stage2_id, proj1_id, 'Design', 2);

  INSERT INTO public.tasks (project_id, stage_id, title, description, assigned_to, status, priority) VALUES
  (proj1_id, stage1_id, 'Pesquisa de referências', 'Buscar perfis similares e anotar trends', v_writer_id, 'done', 'medium'),
  (proj1_id, stage1_id, 'Escrever pautas de Abril', 'Criar 12 temas para o cronograma', v_writer_id, 'in_progress', 'high'),
  (proj1_id, stage2_id, 'Aprovação de cores', 'Apresentar a paleta nos layouts', v_designer_id, 'todo', 'medium');

  -- 4. Proj 2
  stage1_id := extensions.uuid_generate_v4();
  INSERT INTO public.project_stages (id, project_id, name, position) VALUES 
  (stage1_id, proj2_id, 'Criação de Roteiros', 1);

  INSERT INTO public.tasks (project_id, stage_id, title, description, assigned_to, status, priority) VALUES
  (proj2_id, stage1_id, 'Roteiro de apresentação', 'Video de introdução de reels', v_writer_id, 'review', 'high');

  -- 5. Proj 3
  stage1_id := extensions.uuid_generate_v4();
  stage2_id := extensions.uuid_generate_v4();
  INSERT INTO public.project_stages (id, project_id, name, position) VALUES 
  (stage1_id, proj3_id, 'Desenvolvimento Site', 1),
  (stage2_id, proj3_id, 'Criação Redes Sociais', 2);

  INSERT INTO public.tasks (project_id, stage_id, title, description, assigned_to, status, priority) VALUES
  (proj3_id, stage1_id, 'Wireframe estrutural', 'Montar Figma com a estrutura da home', v_designer_id, 'todo', 'urgent'),
  (proj3_id, stage2_id, 'Artes de Lançamento', 'Posts carrosséis de anúncio', v_designer_id, 'todo', 'medium');

  -- 6. Proj 4
  stage1_id := extensions.uuid_generate_v4();
  stage2_id := extensions.uuid_generate_v4();
  INSERT INTO public.project_stages (id, project_id, name, position) VALUES 
  (stage1_id, proj4_id, 'Briefing', 1),
  (stage2_id, proj4_id, 'Identidade Visual', 2);

  INSERT INTO public.tasks (project_id, stage_id, title, description, assigned_to, status, priority) VALUES
  (proj4_id, stage1_id, 'Análise de concorrência', 'Verificar as outras marcas de colchão', v_admin_id, 'done', 'low'),
  (proj4_id, stage2_id, 'Apresentação V1', 'Montar os primeiros mockups com logo', v_designer_id, 'in_progress', 'high');

  -- 7. Proj 6
  stage1_id := extensions.uuid_generate_v4();
  INSERT INTO public.project_stages (id, project_id, name, position) VALUES 
  (stage1_id, proj6_id, 'UI/UX Design', 1);

  INSERT INTO public.tasks (project_id, stage_id, title, description, assigned_to, status, priority) VALUES
  (proj6_id, stage1_id, 'Design System Base', 'Definir paleta, typo e botões', v_designer_id, 'in_progress', 'urgent'),
  (proj6_id, stage1_id, 'Dashboard', 'Telas do dashboard de adm', v_designer_id, 'review', 'medium');

END $$;
