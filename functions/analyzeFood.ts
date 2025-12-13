import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    
    try {
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        }

        const body = await req.json();
        const imageUrl = body.image_url;
        
        if (!imageUrl) {
            return Response.json({ success: false, error: 'No image URL provided' }, { status: 400 });
        }

        const apiKey = Deno.env.get('PASSIO_API_KEY');
        if (!apiKey) {
            return Response.json({ success: false, error: 'API key not configured' }, { status: 500 });
        }

        // Step 1: Get token
        const tokenUrl = `https://api.passiolife.com/v2/token-cache/unified/oauth/token/${apiKey}`;
        const tokenRes = await fetch(tokenUrl, { method: 'POST' });
        
        if (!tokenRes.ok) {
            return Response.json({ 
                success: false, 
                error: 'Token request failed',
                statusCode: tokenRes.status 
            }, { status: 500 });
        }

        const tokenJson = await tokenRes.json();
        const token = tokenJson.access_token;

        if (!token) {
            return Response.json({ success: false, error: 'No token received' }, { status: 500 });
        }

        // Step 2: Download and encode image
        const imgRes = await fetch(imageUrl);
        if (!imgRes.ok) {
            return Response.json({ success: false, error: 'Failed to download image' }, { status: 400 });
        }

        const imgBuffer = await imgRes.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(imgBuffer)));

        // Step 3: Recognize food
        const recognizeRes = await fetch('https://api.passiolife.com/v2/recognize/image', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ image: { content: base64 } })
        });

        if (!recognizeRes.ok) {
            const errText = await recognizeRes.text();
            return Response.json({ 
                success: false, 
                error: 'Recognition failed',
                details: errText,
                statusCode: recognizeRes.status
            }, { status: 500 });
        }

        const data = await recognizeRes.json();
        const results = data.results || data.candidates || [];

        if (results.length === 0) {
            return Response.json({ 
                success: false, 
                error: 'No food detected in the image' 
            });
        }

        const foods = results.map(r => ({
            name: r.foodName || r.name || 'Unknown',
            calories: r.nutritionPreview?.calories || 200,
            protein: r.nutritionPreview?.protein || 8,
            carbs: r.nutritionPreview?.carbs || 25,
            fats: r.nutritionPreview?.fat || 8,
            confidence: r.confidence || 0.5
        }));

        return Response.json({ success: true, foods });

    } catch (err) {
        console.error('Error in analyzeFood:', err);
        return Response.json({ 
            success: false, 
            error: err.message || 'Unknown error' 
        }, { status: 500 });
    }
});