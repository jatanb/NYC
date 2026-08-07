document.getElementById("predictionForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const submitBtn = document.getElementById("submitBtn");
    const resultContainer = document.getElementById("resultContainer");
    const resultValue = document.getElementById("resultValue");

    // Optional elements for the new result UI
    const resultIcon = document.getElementById("resultIcon");
    const resultDescription = document.getElementById("resultDescription");

    // Gather data exactly as FastAPI Pydantic schema expects
    const payload = {
        neighbourhood_group: document.getElementById("neighbourhood_group").value,
        neighbourhood: document.getElementById("neighbourhood").value.trim(),

        latitude: parseFloat(
            document.getElementById("latitude").value
        ),

        longitude: parseFloat(
            document.getElementById("longitude").value
        ),

        price: parseInt(
            document.getElementById("price").value,
            10
        ),

        minimum_nights: parseInt(
            document.getElementById("minimum_nights").value,
            10
        ),

        number_of_reviews: parseInt(
            document.getElementById("number_of_reviews").value,
            10
        ),

        reviews_per_month: parseFloat(
            document.getElementById("reviews_per_month").value
        ),

        calculated_host_listings_count: parseInt(
            document.getElementById("calculated_host_listings_count").value,
            10
        ),

        availability_365: parseInt(
            document.getElementById("availability_365").value,
            10
        )
    };

    // Loading state
    submitBtn.textContent = "Predicting...";
    submitBtn.disabled = true;

    resultContainer.classList.add("hidden");

    try {

        /*
         * LOCAL:
         * http://127.0.0.1:8000/predict
         *
         * DEPLOYED:
         * Change this to your Render FastAPI URL.
         */
        const response = await fetch("http://127.0.0.1:8000/predict", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        // Get JSON response
        const result = await response.json();

        if (!response.ok) {

            let errorMessage = "Server error.";

            if (Array.isArray(result.detail)) {
                errorMessage = result.detail
                    .map(error => error.msg)
                    .join(", ");
            } else if (result.detail) {
                errorMessage = result.detail;
            }

            throw new Error(errorMessage);
        }

        /*
         * FastAPI returns:
         *
         * {
         *     "message": "Private room"
         * }
         *
         * or
         *
         * {
         *     "message": "Shared room"
         * }
         *
         * or
         *
         * {
         *     "message": "Entire home/apt"
         * }
         */

        const prediction = String(result.message).trim().toLowerCase();

        let displayName;
        let icon;
        let description;

        // --------------------------------
        // SHARED ROOM
        // --------------------------------

        if (prediction.includes("shared")) {

            displayName = "Shared Room";
            icon = "👥";

            description =
                "Your property is predicted to be a shared room.";

        }

        // --------------------------------
        // PRIVATE ROOM
        // --------------------------------

        else if (prediction.includes("private")) {

            displayName = "Private Room";
            icon = "🔒";

            description =
                "Your property is predicted to be a private room.";

        }

        // --------------------------------
        // ENTIRE HOME / APARTMENT
        // --------------------------------

        else if (
            prediction.includes("apartment") ||
            prediction.includes("entire") ||
            prediction.includes("home")
        ) {

            displayName = "Entire Home / Apartment";
            icon = "🏠";

            description =
                "Your property is predicted to be an entire home or apartment.";

        }

        // --------------------------------
        // UNKNOWN MODEL OUTPUT
        // --------------------------------

        else {

            displayName = result.message;
            icon = "✦";

            description =
                "The AI model returned a room type prediction.";

        }

        // Put prediction into result box
        resultValue.textContent = displayName;

        // If these elements exist in your HTML,
        // update them too.
        if (resultIcon) {
            resultIcon.textContent = icon;
        }

        if (resultDescription) {
            resultDescription.textContent = description;
        }

        // Show result
        resultContainer.classList.remove("hidden");

    } catch (error) {

        console.error("Prediction error:", error);

        alert(
            "Failed to get prediction.\n\n" +
            error.message +
            "\n\nPlease make sure your FastAPI server is running."
        );

    } finally {

        // Restore button
        submitBtn.textContent = "Predict Room Type";
        submitBtn.disabled = false;

    }
})