from fastapi import FastAPI
from pydantic import BaseModel,Field
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

model=pickle.load(open("l_model.pkl","rb"))

class User(BaseModel):
    neighbourhood_group:str=Literal['Brooklyn', 'Manhattan', 'Queens', 'Staten Island', 'Bronx']
    neighbourhood:str
    latitude:float=Field(...,gt=0)
    longitude:float=Field(...,gt=0)
    price:int=Field(...,gt=0)
    minimum_nights:int=Field(...,ge=0)
    number_of_reviews:int
    reviews_per_month:int
    calculated_host_listings_count:int
    availability_365:int



app=FastAPI()

@app.get("/")
def home():
    return {"message":"running"}

@app.post('/predict')
def predict(data:User):

    input_df=pd.DataFrame([
        {
            "neighbourhood_group":data.neighbourhood_group,
            "neighbourhood":data.neighbourhood,
            "latitude":data.latitude,
            "longitude":data.longitude,
            "price":data.price,
            "minimum_nights":data.minimum_nights,
            "number_of_reviews":data.number_of_reviews,
            "reviews_per_month":data.reviews_per_month,
            "calculated_host_listings_count":data.calculated_host_listings_count,
            "availability_365":data.availability_365
        }
    ])

    prediction=model.predict(input_df)[0]

    return {'message':prediction}