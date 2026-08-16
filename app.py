from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # Added import
from pydantic import BaseModel, Field
import pandas as pd
from typing import Literal
import pickle
import sys

# 1. Force the dummy class into sys.modules before any pickle execution
import sklearn.compose._column_transformer

class DummyRemainderColsList(list):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

sklearn.compose._column_transformer._RemainderColsList = DummyRemainderColsList

model = pickle.load(open("l_model.pkl", "rb"))

class User(BaseModel):
    neighbourhood_group: Literal['Brooklyn', 'Manhattan', 'Queens', 'Staten Island', 'Bronx']
    neighbourhood: str
    latitude: float = Field(description="Latitude coordinate")
    longitude: float = Field(description="Longitude coordinate")
    price: int = Field(gt=0)
    minimum_nights: int = Field(ge=0)
    number_of_reviews: int = Field(ge=0)
    reviews_per_month: float = Field(ge=0)
    calculated_host_listings_count: int = Field(ge=0)
    availability_365: int = Field(ge=0, le=365)

app = FastAPI()

# 2. Add CORS Middleware right after app definition
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows requests from your local HTML file/live server
    allow_credentials=True,
    allow_methods=["*"],  # Allows POST, GET, OPTIONS, etc.
    allow_headers=["*"],  # Allows Content-Type and other standard headers
)

@app.post('/predict')
def predict(data: User):
    input_df = pd.DataFrame([
        {
            "neighbourhood_group": data.neighbourhood_group,
            "neighbourhood": data.neighbourhood,
            "latitude": data.latitude,
            "longitude": data.longitude,
            "price": data.price,
            "minimum_nights": data.minimum_nights,
            "number_of_reviews": data.number_of_reviews,
            "reviews_per_month": data.reviews_per_month,
            "calculated_host_listings_count": data.calculated_host_listings_count,
            "availability_365": data.availability_365
        }
    ])

    prediction = model.predict(input_df)[0]
    return {'message': str(prediction)}  # Wrapped in str() to prevent serialization bugs
