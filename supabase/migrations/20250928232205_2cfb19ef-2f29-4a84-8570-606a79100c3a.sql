-- Enable realtime for chat tables (idempotent)
DO $$
BEGIN
  -- Ensure replica identity full for chat_messages
  BEGIN
    EXECUTE 'ALTER TABLE public.chat_messages REPLICA IDENTITY FULL';
  EXCEPTION WHEN others THEN
    -- ignore if table doesn't exist or already set
    NULL;
  END;

  -- Ensure replica identity full for chat_rooms
  BEGIN
    EXECUTE 'ALTER TABLE public.chat_rooms REPLICA IDENTITY FULL';
  EXCEPTION WHEN others THEN
    NULL;
  END;

  -- Add chat_messages to supabase_realtime publication if not present
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'chat_messages'
  ) THEN
    BEGIN
      EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages';
    EXCEPTION WHEN others THEN
      NULL;
    END;
  END IF;

  -- Add chat_rooms to supabase_realtime publication if not present
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'chat_rooms'
  ) THEN
    BEGIN
      EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_rooms';
    EXCEPTION WHEN others THEN
      NULL;
    END;
  END IF;
END $$;