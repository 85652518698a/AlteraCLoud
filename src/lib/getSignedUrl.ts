import { supabase } from '../config/supabase';

export async function getSignedUrl(fileId: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke('get-signed-url', {
    body: { fileId },
  });

  if (error) throw new Error(error.message);
  return data.url;
}
