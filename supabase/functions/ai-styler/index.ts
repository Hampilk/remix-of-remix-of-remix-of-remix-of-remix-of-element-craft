import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, currentState } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are a CSS/Tailwind style assistant. Given a user's natural language description of style changes, you must return a JSON object with the specific property changes.

Current element state:
${JSON.stringify(currentState, null, 2)}

Available properties you can modify:
- padding: { l, t, r, b } (string values like "4", "8", "16")
- margin: { x, y } (string values)
- size: { width, height, maxWidth, maxHeight } (CSS values like "200px", "100%")
- typography: { fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, textAlign, textColor }
  - fontFamily: "inter", "roboto", "poppins", "montserrat", "mono", "serif", "sans"
  - fontWeight: "thin", "light", "normal", "medium", "semibold", "bold", "extrabold", "black"
  - letterSpacing: "tighter", "tight", "normal", "wide", "wider", "widest"
  - textAlign: "left", "center", "right", "justify"
  - textColor: hex color string or null
- transforms: { translateX, translateY, rotate, scale, skewX, skewY } (numbers)
  - scale is 0-200 (100 = normal)
  - rotate, skewX, skewY in degrees
- transforms3D: { rotateX, rotateY, rotateZ, perspective } (numbers)
- border: { color, width, style, radius: { all, tl, tr, br, bl } }
  - style: "none", "solid", "dashed", "dotted"
  - radius values are numbers (pixels)
- effects: { shadow, opacity, blur, backdropBlur, hueRotate, saturation, brightness, contrast, grayscale, invert, sepia }
  - shadow: "none", "sm", "md", "lg", "xl", "2xl", "inner"
  - opacity: 0-100
  - blur, backdropBlur: 0-20 (pixels)
  - hueRotate: 0-360 (degrees)
  - saturation, brightness, contrast: 0-200 (100 = normal)
  - grayscale, invert, sepia: 0-100
- appearance: { backgroundColor, backgroundImage, blendMode }
  - backgroundColor: hex color or null
  - blendMode: "normal", "multiply", "screen", "overlay", etc.

Respond ONLY with valid JSON in this format:
{
  "changes": {
    // Only include properties that need to change
    // Use nested objects for nested properties
  },
  "message": "Brief description of changes applied"
}

Examples:
User: "Make the corners rounder"
Response: { "changes": { "border": { "radius": { "all": 16 } } }, "message": "Increased border radius to 16px" }

User: "Add a blue background and center the text"
Response: { "changes": { "appearance": { "backgroundColor": "#3b82f6" }, "typography": { "textAlign": "center" } }, "message": "Added blue background and centered text" }

User: "Make it bigger and add shadow"
Response: { "changes": { "transforms": { "scale": 120 }, "effects": { "shadow": "lg" } }, "message": "Scaled up to 120% and added large shadow" }`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response from AI');
    }

    // Parse the JSON response
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      console.error('Failed to parse AI response:', content);
      throw new Error('Invalid AI response format');
    }

    return new Response(
      JSON.stringify({
        changes: parsed.changes || {},
        message: parsed.message || 'Stílusok alkalmazva'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error in ai-styler function:', error);
    const errorMessage = error instanceof Error ? error.message : 'AI processing failed';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
