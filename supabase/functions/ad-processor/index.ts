// CBK Foods - Ad Processor Edge Function
// Validates ad submissions, calculates pricing

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const PRICING = {
  image: { '1_month': 6000, '2_months': 12000 },
  gif: { '1_month': 10000, '2_months': 20000 },
  duration_multiplier: { '5_seconds': 1, '10_seconds': 2 },
  custom_creation: 5000,
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { mediaType, duration, period, customCreation } = await req.json()
    
    // Calculate price
    let basePrice = PRICING[mediaType][period]
    let durationMultiplier = PRICING.duration_multiplier[duration]
    let totalPrice = basePrice * durationMultiplier
    
    if (customCreation) {
      totalPrice += PRICING.custom_creation
    }

    return new Response(
      JSON.stringify({
        success: true,
        breakdown: {
          basePrice,
          durationMultiplier,
          customCreationFee: customCreation ? PRICING.custom_creation : 0,
          totalPrice,
        },
        paymentInstructions: "Transfer to the admin account and upload proof of payment",
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
