import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { image_url } = await req.json();
        
        if (!image_url) {
            return Response.json({ error: 'Image URL is required' }, { status: 400 });
        }

        const API_KEY = Deno.env.get('PASSIO_API_KEY')?.trim();
        if (!API_KEY) {
            return Response.json({ error: 'API key not configured' }, { status: 500 });
        }

        // STEP 1: Get Access Token
        const TOKEN_URL = `https://api.passiolife.com/v2/token-cache/unified/oauth/token/${API_KEY}`;
        const tokenResponse = await fetch(TOKEN_URL, { method: 'POST' });
        
        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            return Response.json({
                error: 'Failed to get access token',
                status: tokenResponse.status,
                details: errorText
            }, { status: 500 });
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        if (!accessToken) {
            return Response.json({ error: 'No access token received' }, { status: 500 });
        }

        // STEP 2: Fetch and convert image
        const imageResponse = await fetch(image_url);
        if (!imageResponse.ok) {
            return Response.json({ error: 'Failed to fetch image' }, { status: 400 });
        }

        const imageBuffer = await imageResponse.arrayBuffer();
        const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));

        // STEP 3: Call Recognition API
        const RECOGNIZE_URL = 'https://api.passiolife.com/v2/recognize/image';
        const recognitionPayload = {
            image: { content: base64Image }
        };

        const recognitionResponse = await fetch(RECOGNIZE_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(recognitionPayload)
        });

        if (!recognitionResponse.ok) {
            const errorText = await recognitionResponse.text();
            return Response.json({
                error: 'Food recognition failed',
                status: recognitionResponse.status,
                details: errorText
            }, { status: recognitionResponse.status });
        }

        const foodData = await recognitionResponse.json();

        // Parse results
        let foods = [];
        const results = foodData.results || foodData.candidates || [];
        
        foods = results.map(item => ({
            name: item.foodName || item.name || 'Unknown Food',
            calories: item.nutritionPreview?.calories || 150,
            protein: item.nutritionPreview?.protein || 5,
            carbs: item.nutritionPreview?.carbs || 20,
            fats: item.nutritionPreview?.fat || 5,
            serving_size: item.servingSize || '1 serving',
            confidence: item.confidence || 0.8
        }));

        return Response.json({
            success: true,
            foods: foods
        });

    } catch (error) {
        console.error('Error:', error);
        return Response.json({ 
            error: 'Internal server error',
            details: error.message
        }, { status: 500 });
    }
});