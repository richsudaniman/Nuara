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
        console.log('API Key present:', !!apiKey, 'Length:', apiKey?.length);

        // Fetch the image from the URL
        const imageResponse = await fetch(image_url);
        if (!imageResponse.ok) {
            console.error('Failed to fetch image:', imageResponse.status);
            return Response.json({ error: 'Failed to fetch image from storage' }, { status: 400 });
        }

        const imageBlob = await imageResponse.blob();
        console.log('Image fetched successfully - Size:', imageBlob.size, 'Type:', imageBlob.type);
        
        // Create form data with the image
        const formData = new FormData();
        formData.append('image', imageBlob, 'food.jpg');

        // Correct Passio API endpoint for food recognition
        const endpoint = 'https://api.passiolife.com/v2/recognize';
        console.log('Calling Passio API:', endpoint);

        const passioResponse = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
            },
            body: formData,
        });

        console.log('=== Passio API Response ===');
        console.log('Status:', passioResponse.status);
        console.log('Status Text:', passioResponse.statusText);
        console.log('Headers:', Object.fromEntries(passioResponse.headers.entries()));
        
        const responseText = await passioResponse.text();
        console.log('Response Body:', responseText);

        if (!passioResponse.ok) {
            console.error('=== API ERROR ===');
            console.error('Status:', passioResponse.status);
            console.error('Body:', responseText);
            return Response.json({
                error: 'Passio API Error',
                status: passioResponse.status,
                details: responseText,
                message: 'Failed to analyze food image',
            }, { status: 500 });
        }

        let passioData;
        try {
            passioData = JSON.parse(responseText);
            console.log('Parsed response structure:', Object.keys(passioData));
            console.log('Full parsed data:', JSON.stringify(passioData, null, 2));
        } catch (parseError) {
            console.error('Failed to parse response:', parseError);
            return Response.json({
                error: 'Invalid response from Passio',
                details: responseText,
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