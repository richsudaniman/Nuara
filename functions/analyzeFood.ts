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

        const apiKey = Deno.env.get('PASSIO_API_KEY');
        if (!apiKey) {
            return Response.json({ error: 'Passio API key not configured' }, { status: 500 });
        }

        console.log('=== Starting Food Analysis ===');
        console.log('Image URL:', image_url);
        console.log('API Key present:', !!apiKey);

        // Step 1: Fetch the image from the URL
        console.log('Step 1: Fetching image...');
        const imageResponse = await fetch(image_url);
        if (!imageResponse.ok) {
            console.error('Failed to fetch image:', imageResponse.status);
            return Response.json({ error: 'Failed to fetch image from storage' }, { status: 400 });
        }

        const imageBuffer = await imageResponse.arrayBuffer();
        console.log('Image fetched successfully - Size:', imageBuffer.byteLength);

        // Step 3: Convert image to base64
        const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
        console.log('Image converted to base64 - Length:', base64Image.length);

        // Step 3: Call Passio recognition API using API key directly
        console.log('Step 2: Calling Passio recognition API...');
        const endpoint = 'https://api.passiolife.com/v2/recognize/image';

        const passioResponse = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image: {
                    content: base64Image
                }
            }),
        });

        console.log('=== Passio API Response ===');
        console.log('Status:', passioResponse.status);
        console.log('Status Text:', passioResponse.statusText);
        console.log('Headers:', JSON.stringify(Object.fromEntries(passioResponse.headers.entries()), null, 2));
        
        const responseText = await passioResponse.text();
        console.log('Response Body (raw):', responseText);
        console.log('Response Body Length:', responseText.length);

        if (!passioResponse.ok) {
            console.error('=== API ERROR DETAILS ===');
            console.error('Status Code:', passioResponse.status);
            console.error('Status Text:', passioResponse.statusText);
            console.error('Response Body:', responseText);
            console.error('Endpoint Called:', endpoint);
            console.error('Authorization Header Present:', !!accessToken);
            
            return Response.json({
                error: 'Passio API Error',
                status: passioResponse.status,
                statusText: passioResponse.statusText,
                details: responseText,
                endpoint: endpoint,
            }, { status: passioResponse.status });
        }

        let passioData;
        try {
            passioData = JSON.parse(responseText);
            console.log('Successfully parsed JSON');
            console.log('Response Keys:', Object.keys(passioData));
            console.log('Full Response:', JSON.stringify(passioData, null, 2));
        } catch (parseError) {
            console.error('JSON Parse Error:', parseError.message);
            console.error('Raw Response:', responseText);
            return Response.json({
                error: 'Invalid JSON response from Passio',
                details: responseText,
                parseError: parseError.message,
            }, { status: 500 });
        }
        
        let foods = [];
        
        // Try multiple possible response structures
        if (passioData.results && Array.isArray(passioData.results)) {
            console.log('Found results array with', passioData.results.length, 'items');
            foods = passioData.results.map(item => ({
                name: item.foodName || item.name || 'Unknown Food',
                calories: item.nutritionPreview?.calories || item.calories || 150,
                protein: item.nutritionPreview?.protein || item.protein || 5,
                carbs: item.nutritionPreview?.carbs || item.carbs || 20,
                fats: item.nutritionPreview?.fat || item.fats || 5,
                serving_size: item.servingSize || '1 serving',
                confidence: item.confidence || 0.8,
            }));
        } else if (passioData.candidates && Array.isArray(passioData.candidates)) {
            console.log('Found candidates array with', passioData.candidates.length, 'items');
            foods = passioData.candidates.map(item => ({
                name: item.foodName || item.name || 'Unknown Food',
                calories: item.nutritionPreview?.calories || item.calories || 150,
                protein: item.nutritionPreview?.protein || item.protein || 5,
                carbs: item.nutritionPreview?.carbs || item.carbs || 20,
                fats: item.nutritionPreview?.fat || item.fats || 5,
                serving_size: item.servingSize || '1 serving',
                confidence: item.confidence || 0.8,
            }));
        } else if (Array.isArray(passioData)) {
            console.log('Response is an array with', passioData.length, 'items');
            foods = passioData.map(item => ({
                name: item.foodName || item.name || 'Unknown Food',
                calories: item.nutritionPreview?.calories || item.calories || 150,
                protein: item.nutritionPreview?.protein || item.protein || 5,
                carbs: item.nutritionPreview?.carbs || item.carbs || 20,
                fats: item.nutritionPreview?.fat || item.fats || 5,
                serving_size: item.servingSize || '1 serving',
                confidence: item.confidence || 0.8,
            }));
        }
        
        console.log('Extracted', foods.length, 'food items');
        
        if (foods.length === 0) {
            console.log('No foods detected - returning empty result');
            return Response.json({
                success: true,
                foods: [],
                message: 'No food items detected in the image',
                raw_response: passioData,
            });
        }

        console.log('=== Success ===');
        return Response.json({
            success: true,
            foods: foods,
        });

    } catch (error) {
        console.error('Fatal error:', error);
        return Response.json({ 
            error: 'Internal server error', 
            details: error.message,
        }, { status: 500 });
    }
});