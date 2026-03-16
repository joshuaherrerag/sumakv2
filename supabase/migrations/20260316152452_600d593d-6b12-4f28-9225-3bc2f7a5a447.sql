
-- Update trigger to handle rol_inicial from signup metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  _rol_inicial TEXT;
  _profile_id UUID;
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, nombre, apellido)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'nombre', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'apellido', '')
  )
  RETURNING id INTO _profile_id;

  -- Always assign alumno role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'alumno');

  -- If rol_inicial is mentor, also add mentor role and create mentor record
  _rol_inicial := NEW.raw_user_meta_data ->> 'rol_inicial';
  IF _rol_inicial = 'mentor' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'mentor');
    
    INSERT INTO public.mentores (profile_id, activo)
    VALUES (_profile_id, false);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
