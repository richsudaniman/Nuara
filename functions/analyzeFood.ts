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
        
        // Create form data for Passio API
        const formData = new FormData();
        formData.append('image', imageBlob, 'food.jpg');

        // Call Passio Nutrition AI API
        const passioResponse = await fetch('https://api.passiolife.com/v2/products/nutrition-ai', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
            },
            body: formData,
        });

        if (!passioResponse.ok) {
            const errorText = await passioResponse.text();
            console.error('Passio API error:', errorText);
            return Response.json({ 
                error: 'Failed to analyze food image', 
                details: errorText 
            }, { status: passioResponse.status });
        }

        const passioData = await passioResponse.json();

        // Map Passio response to our format
        const results = passioData.results || passioData.detections || [];
        
        if (!results.length) {
            return Response.json({ 
                success: true,
                foods: [],
                message: 'No food items detected in the image'
            });
        }

        // Extract nutritional data from Passio response
        const foods = results.map(item => ({
            name: item.name || item.food_name || 'Unknown Food',
            calories: item.calories || item.nutrition?.calories || 0,
            protein: item.protein || item.nutrition?.protein || 0,
            carbs: item.carbs || item.carbohydrates || item.nutrition?.carbs || 0,
            fats: item.fat || item.fats || item.nutrition?.fat || 0,
            serving_size: item.serving_size || item.servingSize || '1 serving',
            confidence: item.confidence || item.score || 1.0,
        }));

        return Response.json({
            success: true,
            foods: foods,
            raw_response: passioData, // Include raw response for debugging
        });

    } catch (error) {
        console.error('Error analyzing food:', error);
        return Response.json({ 
            error: 'Internal server error', 
            details: error.message 
        }, { status: 500 });
    }
});