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

        // Fetch the image from the URL
        const imageResponse = await fetch(image_url);
        if (!imageResponse.ok) {
            return Response.json({ error: 'Failed to fetch image' }, { status: 400 });
        }

        const imageBlob = await imageResponse.blob();
        const arrayBuffer = await imageBlob.arrayBuffer();
        const base64Image = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        
        // Try Passio Nutrition AI API v2 format
        const passioResponse = await fetch('https://api.passiolife.com/v2/recognition', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image: base64Image,
            }),
        });

        if (!passioResponse.ok) {
            const errorText = await passioResponse.text();
            console.error('Passio API error:', passioResponse.status, errorText);
            
            // Return a more helpful error message
            return Response.json({ 
                error: 'Failed to analyze food image', 
                details: `API returned ${passioResponse.status}: ${errorText}`,
                debug_info: {
                    status: passioResponse.status,
                    api_key_present: !!apiKey,
                    image_url_present: !!image_url,
                }
            }, { status: 500 });
        }

        const passioData = await passioResponse.json();
        console.log('Passio response:', JSON.stringify(passioData));

        // Try to parse different possible response formats
        let foods = [];
        
        // Format 1: results array
        if (passioData.results && Array.isArray(passioData.results)) {
            foods = passioData.results.map(item => ({
                name: item.foodName || item.name || item.label || 'Unknown Food',
                calories: item.nutritionPreview?.calories || item.calories || 150,
                protein: item.nutritionPreview?.protein || item.protein || 5,
                carbs: item.nutritionPreview?.carbs || item.carbohydrates || item.carbs || 20,
                fats: item.nutritionPreview?.fat || item.fat || item.fats || 5,
                serving_size: item.servingSize || '1 serving',
                confidence: item.confidence || 0.8,
            }));
        }
        // Format 2: detections array
        else if (passioData.detections && Array.isArray(passioData.detections)) {
            foods = passioData.detections.map(item => ({
                name: item.foodName || item.name || item.label || 'Unknown Food',
                calories: item.nutritionPreview?.calories || item.calories || 150,
                protein: item.nutritionPreview?.protein || item.protein || 5,
                carbs: item.nutritionPreview?.carbs || item.carbohydrates || item.carbs || 20,
                fats: item.nutritionPreview?.fat || item.fat || item.fats || 5,
                serving_size: item.servingSize || '1 serving',
                confidence: item.confidence || 0.8,
            }));
        }
        // Format 3: Single food object
        else if (passioData.foodName || passioData.name) {
            foods = [{
                name: passioData.foodName || passioData.name,
                calories: passioData.nutritionPreview?.calories || passioData.calories || 150,
                protein: passioData.nutritionPreview?.protein || passioData.protein || 5,
                carbs: passioData.nutritionPreview?.carbs || passioData.carbs || 20,
                fats: passioData.nutritionPreview?.fat || passioData.fats || 5,
                serving_size: passioData.servingSize || '1 serving',
                confidence: passioData.confidence || 0.8,
            }];
        }
        
        if (foods.length === 0) {
            return Response.json({ 
                success: true,
                foods: [],
                message: 'No food items detected in the image',
                raw_response: passioData,
            });
        }

        return Response.json({
            success: true,
            foods: foods,
            raw_response: passioData,
        });

    } catch (error) {
        console.error('Error analyzing food:', error);
        return Response.json({ 
            error: 'Internal server error', 
            details: error.message,
            stack: error.stack,
        }, { status: 500 });
    }
});