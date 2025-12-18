import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    
    try {
        console.log('=== FUNCTION VERSION: V2 - 2024-12-18-18:05 ===');
        console.log('Using simple image_url format (NOT nested)');
        
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        }

        const body = await req.json();
        const imageUrl = body.image_url;
        
        console.log('Received image URL:', imageUrl);
        
        if (!imageUrl) {
            return Response.json({ success: false, error: 'No image URL provided' }, { status: 400 });
        }

        const apiKey = Deno.env.get('PASSIO_API_KEY');
        if (!apiKey) {
            console.error('API key not found');
            return Response.json({ success: false, error: 'API key not configured' }, { status: 500 });
        }

        console.log('Getting access token...');
        const tokenUrl = `https://api.passiolife.com/v2/token-cache/unified/oauth/token/${apiKey}`;
        const tokenRes = await fetch(tokenUrl, { method: 'POST' });
        
        console.log('Token response status:', tokenRes.status);
        
        if (!tokenRes.ok) {
            const errorText = await tokenRes.text();
            console.error('Token error:', errorText);
            return Response.json({ 
                success: false, 
                error: 'Failed to get access token',
                details: errorText
            }, { status: 500 });
        }

        const tokenJson = await tokenRes.json();
        const token = tokenJson.access_token;

        if (!token) {
            console.error('No token in response');
            return Response.json({ success: false, error: 'No token received' }, { status: 500 });
        }

        console.log('Calling recognition API with simple image_url format...');

        // Simple format - just image_url property
        const payload = { 
            image_url: imageUrl
        };

        const recognizeUrl = 'https://api.passiolife.com/v2/recognize/image';
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        console.log('=== REQUEST DEBUG ===');
        console.log('URL:', recognizeUrl);
        console.log('Payload:', JSON.stringify(payload));
        console.log('Token length:', token?.length);
        console.log('====================');

        const recognizeRes = await fetch(recognizeUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });

        console.log('Response status:', recognizeRes.status);
        const requestId = recognizeRes.headers.get('X-Request-Id');
        console.log('X-Request-Id:', requestId);

        if (!recognizeRes.ok) {
            const errText = await recognizeRes.text();
            console.error('Recognition error:', errText);
            console.error('X-Request-Id for support:', requestId);
            return Response.json({ 
                success: false, 
                error: 'Recognition API failed',
                statusCode: recognizeRes.status,
                requestId: requestId,
                details: errText
            }, { status: 500 });
        }

        const data = await recognizeRes.json();
        console.log('Recognition data:', JSON.stringify(data));
        
        const results = data.results || data.candidates || [];

        if (results.length === 0) {
            return Response.json({ 
                success: false, 
                error: 'No food detected' 
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

        console.log('Success! Found foods:', foods);
        return Response.json({ success: true, foods });

    } catch (err) {
        console.error('Caught error:', err.message, err.stack);
        return Response.json({ 
            success: false, 
            error: err.message || 'Unknown error' 
        }, { status: 500 });
    }
});