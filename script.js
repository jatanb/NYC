document.getElementById('predictionForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    const resultContainer = document.getElementById('resultContainer');
    const resultValue = document.getElementById('resultValue');

    // Gather and format data exactly as the FastAPI Pydantic schema expects
    
    const payload = {
            neighbourhood_group: document.getElementById('neighbourhood_group').value,
            neighbourhood: document.getElementById('neighbourhood').value,
            latitude: parseFloat(document.getElementById('latitude').value),
            longitude: parseFloat(document.getElementById('longitude').value),
            price: parseInt(document.getElementById('price').value, 10),
            minimum_nights: parseInt(document.getElementById('minimum_nights').value, 10),
            number_of_reviews: parseInt(document.getElementById('number_of_reviews').value, 10),
            // FIX: Change parseInt to parseFloat for reviews per month
            reviews_per_month: parseFloat(document.getElementById('reviews_per_month').value),
            calculated_host_listings_count: parseInt(document.getElementById('calculated_host_listings_count').value, 10),
            availability_365: parseInt(document.getElementById('availability_365').value, 10)
};

    

    // UI state adjustments during request
    submitBtn.textContent = 'Predicting...';
    submitBtn.disabled = true;
    resultContainer.classList.add('hidden');

    try {
        // Change URL to match your server host if it runs on a different port/domain
        const response = await fetch('http://127.0.0.1:8000/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.statusText}`);
        }

        const result = await response.json();
        
        // Show output received from backend response dictionary {'message': prediction}
        resultValue.textContent = result.message;
        resultContainer.classList.remove('hidden');

    } catch (error) {
        alert('Failed to get prediction. Ensure your FastAPI server is running.');
        console.error('Error:', error);
    } finally {
        submitBtn.textContent = 'Predict Room Type';
        submitBtn.disabled = false;
    }
});
