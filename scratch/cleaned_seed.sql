DO $$
DECLARE
v_admin_id UUID := 'c2e56241-fec3-4a06-9f07-d83faf469585';
v_writer_id UUID := 'bfe0c670-41c1-442e-a7be-ff48cde627d1';
v_designer_id UUID := '2f0a1537-cafc-45ae-bf23-3139e44bdfd0';
c_gabriela_id UUID := 'e5473cf4-142c-47bc-ad8c-0c1a17953268';
c_duda_id UUID := 'bc2ee5c8-1cc6-4929-a54b-d7840133c940';
c_gabrielly_id UUID := '3a1df58a-4c28-4447-97a6-23f2b1d64cc1';
w_id UUID := 'a8b89e62-c07a-4c07-b248-cb3502570b55';
p_social_id UUID := '0f092789-983f-4228-a3cf-cfb577312108';
p_branding_id UUID := 'f0238e88-cfb2-4d1e-ae7a-05c2826a7989';
s_stage1_id UUID := '8c86d8a2-1d54-47c3-8822-e421c7e9db8b';
s_stage2_id UUID := '5e9c60e3-98cc-4d32-aa77-742bc531e21b';
b_stage1_id UUID := '569cb84e-cb52-4752-98ba-b7e3240e945c';
t_social_1 UUID := 'a73d3fe5-fbc4-47c2-8418-49e083c27631';
t_branding_1 UUID := 'f8b8a07c-9b1b-466f-b6bb-f888cc8b4bb2';
post1_id UUID := '11111111-1111-1111-1111-111111111111';
post2_id UUID := '22222222-2222-2222-2222-222222222222';
post3_id UUID := '33333333-3333-3333-3333-333333333333';
rev1_id UUID := extensions.uuid_generate_v4();
rev2_id UUID := extensions.uuid_generate_v4();
rev3_id UUID := extensions.uuid_generate_v4();
BEGIN
INSERT INTO public.profiles (id, role, full_name, first_name, last_name)
VALUES
(v_admin_id, 'admin', 'Bruna Zanetti', 'Bruna', 'Zanetti'),
(v_writer_id, 'writer', 'João Redator', 'João', 'Redator'),
(v_designer_id, 'designer', 'Pedro Designer', 'Pedro', 'Designer')
ON CONFLICT (id) DO UPDATE
SET role = EXCLUDED.role, full_name = EXCLUDED.full_name;
INSERT INTO public.clients (id, type, name, company, email, phone, status, pipeline_stage, notes)
VALUES
(c_gabriela_id, 'pj', 'Gabriela Seuressig', 'Gabriela Seuressig Ltda', 'gabriela@test.com', '(51) 99999-1111', 'active', 'Onboarding', 'Cliente de Social e Marca.'),
(c_duda_id, 'pf', 'Duda Personal', 'Duda Fit', 'duda@test.com', '(51) 98888-2222', 'active', 'Fechado', 'Foco no perfil pessoal.'),
(c_gabrielly_id, 'pj', 'Gabrielly Lima Consultoria', 'Gabrielly Lima', 'gabi@test.com', '(51) 97777-3333', 'active', 'Fechado', 'Site institucional e branding.')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.client_portal_settings (
client_id, slug, logo_url, wallpaper_url, theme_color_primary, theme_color_secondary,
ig_username, ig_name, ig_bio, ig_avatar_url, ig_stats_posts, ig_stats_followers, ig_stats_following,
portal_user, portal_password, focus_of_month, planning_period, deadline_description, is_active
)
VALUES (
c_gabriela_id, 'gabriela',
'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=150&h=150',
'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=1200&h=800',
'#BE4B00', '#B4053C',
'gabriela_seuressig', 'Gabriela Seuressig',
'| Advocacia & Consultoria Jurídica<br/>| Atendimento Personalizado<br/>| Porto Alegre/RS',
'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150',
12, '1.503', '982',
'gabriela', '123',
'Posicionamento Profissional e Lançamento de Curso', 'Julho 2026', '2026-07-05', true
)
ON CONFLICT (client_id) DO NOTHING;
INSERT INTO public.v2_workspaces (id, name, owner_id, slug)
VALUES (w_id, 'Duas Mãos Agência', v_admin_id, 'duasmaos')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.v2_projects (id, workspace_id, client_id, name, workflow_type, status, priority, owner_id, type, amount, billing_day, start_date)
VALUES (p_social_id, w_id, c_gabriela_id, 'Redes Sociais - Gabi', 'social_media', 'active', 'medium', v_admin_id, 'recurring', 1500.00, 10, '2026-06-01')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.v2_projects (id, workspace_id, client_id, name, workflow_type, status, priority, owner_id, type, amount, billing_day, start_date)
VALUES (p_branding_id, w_id, c_gabriela_id, 'Branding & Identidade Visual', 'branding', 'active', 'high', v_admin_id, 'one_time', 4500.00, NULL, '2026-06-15')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.v2_project_stages (id, project_id, name, stage_key, "order", status)
VALUES
(s_stage1_id, p_social_id, 'Planejamento e Pautas', 'planning', 1, 'in_progress'),
(s_stage2_id, p_social_id, 'Criação e Design', 'design', 2, 'pending'),
(b_stage1_id, p_branding_id, 'Identidade Visual', 'identity', 1, 'in_progress')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.v2_tasks (id, project_id, stage_id, title, description, type, task_type, status, priority, "order", stage_order, html_content)
VALUES (t_social_1, p_social_id, s_stage1_id, 'Aprovação de Temas - Julho', 'Definir os 12 temas das postagens de Julho de acordo com o briefing.', 'task', 'task', 'in_progress', 'medium', 1, 1, '<p>Pesquisa realizada. Focar nas pautas institucionais.</p>')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.v2_tasks (id, project_id, stage_id, title, description, type, task_type, status, priority, "order", stage_order, html_content)
VALUES (t_branding_1, p_branding_id, b_stage1_id, 'Layouts de Identidade', 'Desenvolvimento da grade de posts conceituais para demonstrar a aplicação da nova marca no Instagram.', 'task', 'task', 'in_progress', 'high', 1, 1, '<p>Apresentar a marca em 3 peças conceituais.</p>')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.v2_task_assignees (task_id, user_id)
VALUES
(t_social_1, v_writer_id),
(t_branding_1, v_designer_id)
ON CONFLICT DO NOTHING;
INSERT INTO public.v2_social_posts (id, task_id, "order", post_type, status, requires_approval, client_approval_status, caption, art_text, hashtags)
VALUES
(post1_id, t_branding_1, 1, 'carousel', 'awaiting_review', true, 'pending', 'Esta é a legenda conceito para a primeira peça do carrossel institucional.', 'Slide 1: Nova Marca\nSlide 2: Nossos Valores', '["branding", "identidade", "duasmaos"]'::jsonb),
(post2_id, t_branding_1, 2, 'carousel', 'awaiting_review', true, 'pending', 'Legenda da peça 02 que fala sobre nosso posicionamento.', 'Slide 1: Posicionamento\nSlide 2: Nosso método', '["advocacia", "marketing"]'::jsonb),
(post3_id, t_branding_1, 3, 'image', 'draft', true, 'pending', 'Legenda simples da peça única para fechar a grade.', 'Peça Única: Fale Conosco', '["contato"]'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.v2_post_media (post_id, storage_provider, file_path, public_url, media_type, order_index)
VALUES
(post1_id, 'drive', NULL, 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&q=80&w=600&h=800', 'image', 0),
(post1_id, 'drive', NULL, 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600&h=800', 'image', 1),
(post2_id, 'drive', NULL, 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=600&h=800', 'image', 0),
(post2_id, 'drive', NULL, 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=600&h=800', 'image', 1),
(post3_id, 'drive', NULL, 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=600&h=800', 'image', 0)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.revenues (id, project_id, amount, due_date, status, type)
VALUES (rev1_id, p_social_id, 1500.00, '2026-06-10T12:00:00Z', 'paid', 'recurring')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.payments (revenue_id, paid_at, amount, method)
VALUES (rev1_id, '2026-06-09T14:30:00Z', 1500.00, 'pix')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.revenue_recurrences (project_id, amount, frequency, billing_day, next_due_date)
VALUES (p_social_id, 1500.00, 'monthly', 10, '2026-07-10T12:00:00Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.revenues (id, project_id, amount, due_date, status, type)
VALUES
(rev2_id, p_branding_id, 2250.00, '2026-06-20T12:00:00Z', 'overdue', 'installment'),
(rev3_id, p_branding_id, 2250.00, '2026-07-20T12:00:00Z', 'pending', 'installment')
ON CONFLICT (id) DO NOTHING;
END $$;