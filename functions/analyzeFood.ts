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

        console.log('Analyzing food from URL:', image_url);

        // Fetch the image from the URL
        const imageResponse = await fetch(image_url);
        if (!imageResponse.ok) {
            console.error('Failed to fetch image:', imageResponse.status);
            return Response.json({ error: 'Failed to fetch image from storage' }, { status: 400 });
        }

        const imageBlob = await imageResponse.blob();
        console.log('Image fetched, size:', imageBlob.size, 'type:', imageBlob.type);
        
        // Create form data with the image
        const formData = new FormData();
        formData.append('image', imageBlob, 'food.jpg');

        // Correct Passio API endpoint for food recognition
        const endpoint = 'https://api.passiolife.com/v2/recognize';
        console.log('Using Passio endpoint:', endpoint);

        const passioResponse = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
            },
            body: formData,
        });

        console.log('Response status:', passioResponse.status);
        const responseText = await passioResponse.text();
        console.log('Response body:', responseText);

        if (!passioResponse.ok) {
            console.error('Passio API error:', passioResponse.status, responseText);
            return Response.json({
                error: 'Failed to analyze food image',
                details: `Passio API returned ${passioResponse.status}: ${responseText}`,
            }, { status: 500 });
        }

        const passioData = JSON.parse(responseText);
        
        let foods = [];
        
        if (passioData.results && Array.isArray(passioData.results)) {
            foods = passioData.results.map(item => ({
                name: item.foodName || item.name || 'Unknown Food',
                calories: item.nutritionPreview?.calories || item.calories || 150,
                protein: item.nutritionPreview?.protein || item.protein || 5,
                carbs: item.nutritionPreview?.carbs || item.carbs || 20,
                fats: item.nutritionPreview?.fat || item.fats || 5,
                serving_size: '1 serving',
                confidence: item.confidence || 0.8,
            }));
        }
        
        if (foods.length === 0) {
            return Response.json({
                success: true,
                foods: [],
                message: 'No food items detected in the image',
            });
        }

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