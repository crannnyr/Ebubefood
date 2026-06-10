// CBK Foods - Analytics Aggregator
// Daily analytics snapshots

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
    const { date } = await req.json()
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const snapshotDate = date || new Date().toISOString().split('T')[0]

    // Aggregate metrics
    const metrics = [
      { name: 'total_orders', query: `COUNT(*) FROM orders WHERE DATE(created_at) = '${snapshotDate}'` },
      { name: 'total_revenue', query: `COALESCE(SUM(total_amount), 0) FROM orders WHERE DATE(created_at) = '${snapshotDate}' AND status != 'cancelled'` },
      { name: 'total_profit', query: `COALESCE(SUM(total_amount - (SELECT SUM(item_cost_price * quantity) FROM order_items WHERE order_id = orders.id)), 0) FROM orders WHERE DATE(created_at) = '${snapshotDate}' AND status != 'cancelled'` },
    ]

    // Insert snapshots
    for (const metric of metrics) {
      const { data: result } = await supabase.rpc('execute_raw_sql', { sql: `SELECT ${metric.query}` })
      
      await supabase.from('analytics_snapshots').insert({
        snapshot_date: snapshotDate,
        metric_name: metric.name,
        metric_value: result?.[0]?.[Object.keys(result[0])[0]] || 0,
      })
    }

    return new Response(
      JSON.stringify({ success: true, date: snapshotDate }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
