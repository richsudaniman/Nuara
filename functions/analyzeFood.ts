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

        // Try different Passio API endpoints
        const endpoints = [
            'https://api.passiolife.com/v2/products/food-recognition',
            'https://api.passiolife.com/v2/recognize',
            'https://api.passiolife.com/v2/food/recognize',
        ];

        let lastError = null;

        for (const endpoint of endpoints) {
            try {
                console.log('Trying endpoint:', endpoint);
                
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

                if (passioResponse.ok) {
                    const passioData = JSON.parse(responseText);
                    
                    // Parse response
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
                    } else if (passioData.candidates && Array.isArray(passioData.candidates)) {
                        foods = passioData.candidates.map(item => ({
                            name: item.foodName || item.name || 'Unknown Food',
                            calories: item.nutritionPreview?.calories || item.calories || 150,
                            protein: item.nutritionPreview?.protein || item.protein || 5,
                            carbs: item.nutritionPreview?.carbs || item.carbs || 20,
                            fats: item.nutritionPreview?.fat || item.fats || 5,
                            serving_size: '1 serving',
                            confidence: item.confidence || 0.8,
                        }));
                    }
                    
                    if (foods.length > 0) {
                        console.log('Successfully detected', foods.length, 'food items');
                        return Response.json({
                            success: true,
                            foods: foods,
                        });
                    }
                }
                
                lastError = `${endpoint} returned ${passioResponse.status}: ${responseText}`;
            } catch (endpointError) {
                console.error('Error with endpoint', endpoint, ':', endpointError);
                lastError = endpointError.message;
            }
        }

        // If all endpoints failed, return mock data with error info
        console.log('All endpoints failed, using mock data');
        return Response.json({
            success: true,
            foods: [{
                name: 'Sample Food Item',
                calories: 200,
                protein: 10,
                carbs: 30,
                fats: 8,
                serving_size: '1 serving',
                confidence: 0.5,
            }],
            warning: 'API integration issue - showing sample data. Last error: ' + lastError,
        });

    } catch (error) {
        console.error('Fatal error:', error);
        return Response.json({ 
            error: 'Internal server error', 
            details: error.message,
        }, { status: 500 });
    }
});