// CBK Foods - End of Day Processor
// Calculates daily closing with owner splits

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
    const { closingDate, closedBy, notes } = await req.json()
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Call the database function
    const { data, error } = await supabase.rpc('close_day', {
      p_date: closingDate,
      p_closed_by: closedBy,
      p_notes: notes,
    })

    if (error) throw error

    // Fetch the closing record
    const { data: closingData, error: fetchError } = await supabase
      .from('day_closings')
      .select('*')
      .eq('id', data)
      .single()

    if (fetchError) throw fetchError

    return new Response(
      JSON.stringify({
        success: true,
        closing: closingData,
        message: `Day ${closingDate} closed successfully`,
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
