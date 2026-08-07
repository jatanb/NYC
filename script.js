const API_URL = "http://127.0.0.1:8000";
// ↑ For Render, change this to:
// const API_URL = "https://your-fastapi-app.onrender.com";


document.getElementById("predictionForm").addEventListener("submit", async function (e) {

    e.preventDefault();

    const submitBtn = document.getElementById("submitBtn");
    const resultContainer = document.getElementById("resultContainer");
    const emptyResult = document.getElementById("emptyResult");

    const resultValue = document.getElementById("resultValue");
    const resultIcon = document.getElementById("resultIcon");
    const resultDescription = document.getElementById("resultDescription");
    const resultStatus = document.getElementById("resultStatus");
    const errorMessage = document.getElementById("errorMessage");


    // --------------------------------
    // GET USER INPUT
    // --------------------------------

    const payload = {

        neighbourhood_group:
            document.getElementById("neighbourhood_group").value,

        neighbourhood:
            document.getElementById("neighbourhood").value.trim(),

        latitude:
            parseFloat(
                document.getElementById("latitude").value
            ),

        longitude:
            parseFloat(
                document.getElementById("longitude").value
            ),

        price:
            parseInt(
                document.getElementById("price").value,
                10
            ),

        minimum_nights:
            parseInt(
                document.getElementById("minimum_nights").value,
                10
            ),

        number_of_reviews:
            parseInt(
                document.getElementById("number_of_reviews").value,
                10
            ),

        reviews_per_month:
            parseFloat(
                document.getElementById("reviews_per_month").value
            ),

        calculated_host_listings_count:
            parseInt(
                document.getElementById(
                    "calculated_host_listings_count"
                ).value,
                10
            ),

        availability_365:
            parseInt(
                document.getElementById("availability_365").value,
                10
            )
    };


    // --------------------------------
    // CLEAR OLD ERROR
    // --------------------------------

    errorMessage.textContent = "";


    // --------------------------------
    // LOADING STATE
    // --------------------------------

    submitBtn.disabled = true;
    submitBtn.classList.add("loading");


    try {

        // --------------------------------
        // SEND DATA TO FASTAPI
        // --------------------------------

        const response = await fetch(
            `${API_URL}/predict`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(payload)
            }
        );


        // --------------------------------
        // READ RESPONSE
        // --------------------------------

        const result = await response.json();


        // --------------------------------
        // HANDLE API ERROR
        // --------------------------------

        if (!response.ok) {

            let message = "Something went wrong.";

            if (Array.isArray(result.detail)) {

                message = result.detail
                    .map(error => error.msg)
                    .join(", ");

            } else if (result.detail) {

                message = result.detail;

            }

            throw new Error(message);
        }


        // --------------------------------
        // GET MODEL PREDICTION
        // --------------------------------

        const prediction =
            String(result.message)
                .trim()
                .toLowerCase();


        let displayName;
        let icon;
        let description;
        let type;


        // --------------------------------
        // SHARED ROOM
        // --------------------------------

        if (prediction.includes("shared")) {

            displayName = "Shared Room";
            icon = "👥";
            type = "shared";

            description =
                "Your property is predicted to be a shared room.";
        }


        // --------------------------------
        // PRIVATE ROOM
        // --------------------------------

        else if (prediction.includes("private")) {

            displayName = "Private Room";
            icon = "🔒";
            type = "private";

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
            type = "entire";

            description =
                "Your property is predicted to be an entire home or apartment.";
        }


        // --------------------------------
        // UNKNOWN OUTPUT
        // --------------------------------

        else {

            displayName = result.message;
            icon = "✦";
            type = "";

            description =
                "The AI model returned a room type prediction.";
        }


        // --------------------------------
        // UPDATE RESULT UI
        // --------------------------------

        resultValue.textContent = displayName;

        resultIcon.textContent = icon;

        resultDescription.textContent = description;


        // --------------------------------
        // SHOW RESULT
        // --------------------------------

        emptyResult.classList.add("hidden");

        resultContainer.classList.remove("hidden");


        // --------------------------------
        // GREEN STATUS DOT
        // --------------------------------

        resultStatus.style.background = "#34d399";

        resultStatus.style.boxShadow =
            "0 0 12px #34d399";


        // --------------------------------
        // HIGHLIGHT PREDICTED TYPE
        // --------------------------------

        document
            .querySelectorAll(".type-option")
            .forEach(option => {

                option.classList.remove("active");

                if (option.dataset.type === type) {

                    option.classList.add("active");

                }
            });


    } catch (error) {

        // --------------------------------
        // ERROR HANDLING
        // --------------------------------

        console.error(
            "Prediction error:",
            error
        );


        errorMessage.textContent =
            "Prediction failed: " +
            error.message;


        resultStatus.style.background =
            "#ef4444";

        resultStatus.style.boxShadow =
            "0 0 12px #ef4444";
    }


    finally {

        // --------------------------------
        // RESTORE BUTTON
        // --------------------------------

        submitBtn.disabled = false;

        submitBtn.classList.remove("loading");
    }

});


// --------------------------------
// RESET BUTTON
// --------------------------------

document
    .getElementById("resetBtn")
    .addEventListener("click", function () {

        document
            .getElementById("predictionForm")
            .reset();


        document
            .getElementById("errorMessage")
            .textContent = "";


        document
            .getElementById("resultContainer")
            .classList.add("hidden");


        document
            .getElementById("emptyResult")
            .classList.remove("hidden");


        document
            .getElementById("resultStatus")
            .style.background = "#64748b";


        document
            .getElementById("resultStatus")
            .style.boxShadow = "none";


        document
            .querySelectorAll(".type-option")
            .forEach(option => {

                option.classList.remove("active");

            });

    });

