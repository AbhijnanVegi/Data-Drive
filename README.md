# Data-Drive
A cloud file storage/ hosting platform for data foundation systems.


## Setup

### Backend

Ensure that you have docker installed

```
docker-compose -f docker-compose-dev.yml up
```

Ensure that you have fastapi installed and run this from the root directory of the project

```
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload
```

### Frontend

Installed the required packages

```
npm install 
```

Start the server 

```
npm start
```