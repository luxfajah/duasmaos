-- Add operational fields to v2_projects
ALTER TABLE public.v2_projects 
ADD COLUMN IF NOT EXISTS deadline timestamptz,
ADD COLUMN IF NOT EXISTS completed_at timestamptz;

-- Function to handle project completion
CREATE OR REPLACE FUNCTION public.handle_v2_project_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- If status changed to 'completed', set completed_at
    IF (NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed')) THEN
        NEW.completed_at = now();
    -- If status moved AWAY from 'completed', clear completed_at
    ELSIF (NEW.status != 'completed' AND OLD.status = 'completed') THEN
        NEW.completed_at = NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function
DROP TRIGGER IF EXISTS tr_v2_project_completion ON public.v2_projects;
CREATE TRIGGER tr_v2_project_completion
BEFORE UPDATE ON public.v2_projects
FOR EACH ROW
EXECUTE FUNCTION public.handle_v2_project_status_change();
