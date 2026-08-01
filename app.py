from fastapi import FastAPI
from pydantic import BaseModel,Field
import pandas as pd
import pickle

model=pickle.load("ml_mb_model.pkl")

class User(BaseModel):
    neighbourhood_group:str=Field(...,example="neghbourhood_group")
    neighbourhood:str=Field(...,example="neghbourhood_group")
    latitude:float=Field(...,gt=0)
    longitude:float=Field(...,gt=0)

app=FastAPI()

@app.get("/")
def home():
    return {"message":"running"}

@app.post('/predict')
def predict(data:User):

    """neighbourhood_group	neighbourhood	latitude	longitude	room_type	price	minimum_nights	number_of_reviews	last_review	reviews_per_month	calculated_host_listings_count	availability_365"""

    input_df=pd.DataFrame(
        {

        }
    )

    prediction=model.predict(input_df)[0]

    return {'messege':prediction}