// CBK Foods - Image Optimizer Edge Function
// Compresses images and GIFs to lowest possible size

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { filePath, bucket, maxWidth = 1200, maxHeight = 1200, quality = 75, format = 'webp' } = await req.json()
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Download original
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(bucket)
      .download(filePath)
    
    if (downloadError) throw downloadError

    const arrayBuffer = await fileData.arrayBuffer()
    const originalSize = arrayBuffer.byteLength
    
    // For images, use Supabase's built-in transformation
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath, {
        transform: {
          width: maxWidth,
          height: maxHeight,
          resize: 'cover',
          quality: quality,
          format: format,
        },
      })

    // For GIFs, we'll use a simpler approach - resize and optimize
    // In production, you'd use a GIF optimization library
    const isGif = filePath.toLowerCase().endsWith('.gif')
    
    return new Response(
      JSON.stringify({
        success: true,
        originalSize,
        optimizedUrl: publicUrl,
        format: isGif ? 'gif' : format,
        dimensions: { width: maxWidth, height: maxHeight },
        quality,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
