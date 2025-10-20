# 🤖 AI Itinerary Generation System - Complete Documentation

## Overview

The Travel-Mate AI Itinerary Generation System is a sophisticated Python-based service that leverages **LangGraph**, **LangChain**, and **Google Generative AI (Gemini)** to create intelligent, time-specific travel itineraries.

**Key Capabilities**:
- Generates day-by-day travel itineraries with specific times (8 AM - 10 PM+)
- Ensures each day covers unique neighborhoods and activities
- Aligns recommendations with user interests
- Provides hour-by-hour schedules with real locations
- Includes mix of famous attractions and hidden local gems

---

## Architecture

### System Design

```
┌─────────────────────────────────────────────────────────────┐
│                    Travel-Mate Backend                       │
│                  (Node.js/Express API)                       │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP POST /plan-trip
                       ↓
┌─────────────────────────────────────────────────────────────┐
│              FastAPI Itinerary Service                       │
│                  (Python Service)                            │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │           LangGraph Workflow Engine                 │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  Node 1: set_city() → Add city to state            │   │
│  │  Node 2: set_interests() → Add interests to state  │   │
│  │  Node 3: create_itinerary() → Generate with AI     │   │
│  └─────────────────────────────────────────────────────┘   │
│                       │                                      │
│  ┌────────────────────↓──────────────────────────────────┐  │
│  │         LangChain Integration                        │  │
│  ├─────────────────────────────────────────────────────┤  │
│  │  • ChatPromptTemplate - Dynamic prompt building     │  │
│  │  • ChatGoogleGenerativeAI - Gemini API connection   │  │
│  │  • Message Management - HumanMessage/AIMessage      │  │
│  └─────────────────────────────────────────────────────┘  │
│                       │                                      │
│  ┌────────────────────↓──────────────────────────────────┐  │
│  │    Google Generative AI (Gemini 2.5 Flash)          │  │
│  ├─────────────────────────────────────────────────────┤  │
│  │  • Model: gemini-2.5-flash                          │  │
│  │  • Temperature: 0 (deterministic)                   │  │
│  │  • Context Window: 1M tokens                        │  │
│  └─────────────────────────────────────────────────────┘  │
│                       │                                      │
│  ┌────────────────────↓──────────────────────────────────┐  │
│  │      Response Processing & Validation                │  │
│  ├─────────────────────────────────────────────────────┤  │
│  │  • Regex JSON extraction                            │  │
│  │  • JSON parsing & validation                        │  │
│  │  • Fallback itinerary generation                    │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                       │ HTTP Response (JSON)
                       ↓
┌─────────────────────────────────────────────────────────────┐
│           Frontend (React Application)                       │
│         Displays itinerary to user for review/edit          │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Python** | 3.8+ | Programming language |
| **FastAPI** | Latest | Web framework for async API |
| **Uvicorn** | Latest | ASGI server |
| **LangGraph** | Latest | Agentic workflow orchestration |
| **LangChain** | 0.1+ | LLM framework and abstractions |
| **langchain-google-genai** | Latest | Google Generative AI integration |
| **python-dotenv** | Latest | Environment variable management |
| **Pydantic** | v2 | Data validation |

### Installation

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install \
  fastapi \
  uvicorn \
  python-dotenv \
  langchain \
  langchain-google-genai \
  langgraph \
  pydantic
```

Or use requirements.txt:

```bash
pip install -r requirements.txt
```

**requirements.txt**:
```
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-dotenv==1.0.0
langchain==0.1.1
langchain-google-genai==0.0.1
langgraph==0.0.1
pydantic==2.0
```

---

## Core Implementation

### 1. Data Models (Pydantic)

#### TripRequest
```python
class TripRequest(BaseModel):
    request: str           # User's natural language request
    city: str              # Destination city
    interests: str         # Comma-separated interests
    duration: int          # Number of days (1-30)
```

**Example**:
```python
{
    "request": "Plan my trip for each with time specific things to do in day",
    "city": "Paris",
    "interests": "museums,art,local food,architecture",
    "duration": 3
}
```

#### PlannerState
```python
class PlannerState(TypedDict):
    messages: Annotated[List[HumanMessage | AIMessage], 
                       "the messages in conversation"]
    city: str
    interests: List[str]
    duration: int
    itinerary: List[dict]
```

**State Evolution**:
```
Initial State:
{
  "messages": [HumanMessage(content="user_request")],
  "city": "Paris",
  "interests": ["museums", "art", "local food"],
  "duration": 3,
  "itinerary": []
}
        ↓
After set_city():
{
  ...same as above...,
  "messages": [..., HumanMessage(content="City: Paris")]
}
        ↓
After set_interests():
{
  ...same as above...,
  "messages": [..., HumanMessage(content="Interests: museums, art, local food")]
}
        ↓
After create_itinerary():
{
  ...same as above...,
  "messages": [..., AIMessage(content="...full response...")],
  "itinerary": [
    {"day": 1, "title": "...", "description": "...", "location": "..."},
    ...
  ]
}
```

### 2. Prompt Template

#### System Prompt Characteristics

The prompt is engineered to ensure:

1. **Uniqueness Across Days**
   ```
   "Each day MUST be COMPLETELY DIFFERENT with unique locations, 
    attractions, and activities. Do NOT repeat the same places 
    or activities across different days."
   ```

2. **Geographic Variety**
   ```
   "For EACH day:
    1. Focus on a DIFFERENT neighborhood, district, or area
    2. Provide specific attractions unique to that area
    3. Create a time-based schedule for the ENTIRE day
    4. Mix famous sites with local hidden gems"
   ```

3. **Time Specificity**
   ```
   "Include realistic HH:MM AM/PM times for all activities
    Separate activities with line breaks (\n)
    Make it practical and balanced (not exhausting)"
   ```

4. **JSON Format Enforcement**
   ```
   "IMPORTANT - Return ONLY valid JSON with NO extra text:
    [
      {
        "day": 1,
        "title": "Day X - [Area Name] - [Experience]",
        "description": "8:00 AM - ...\n10:00 AM - ...",
        "location": "[Specific neighborhood - NOT the city]"
      }
    ]"
   ```

### 3. Workflow Nodes

#### Node 1: set_city()
```python
def set_city(state: PlannerState) -> PlannerState:
    return {
        **state,
        "messages": state['messages'] + [
            HumanMessage(content=f"City: {state['city']}")
        ],
    }
```

**Purpose**: Prepares city context for LLM

#### Node 2: set_interests()
```python
def set_interests(state: PlannerState) -> PlannerState:
    return {
        **state,
        "messages": state['messages'] + [
            HumanMessage(content=f"Interests: {', '.join(state['interests'])}")
        ],
    }
```

**Purpose**: Adds formatted interests to conversation context

#### Node 3: create_itinerary()
```python
def create_itinerary(state: PlannerState) -> PlannerState:
    # 1. Call Gemini API
    response = llm.invoke(itinerary_prompt.format_messages(
        city=state['city'], 
        interests=', '.join(state['interests']),
        duration=state['duration']
    ))
    
    # 2. Parse JSON response
    content = response.content.strip()
    json_match = re.search(r'\[.*\]', content, re.DOTALL)
    
    if json_match:
        json_str = json_match.group()
        itinerary_data = json.loads(json_str)
    else:
        itinerary_data = json.loads(content)
    
    # 3. Validate structure
    validated_itinerary = []
    for item in itinerary_data:
        validated_item = {
            "day": item.get("day", len(validated_itinerary) + 1),
            "title": item.get("title", f"Day {item.get('day')} Activities"),
            "description": item.get("description", "Activities planned"),
            "location": item.get("location", state['city'])
        }
        validated_itinerary.append(validated_item)
    
    # 4. Return updated state
    return {
        **state,
        "messages": state['messages'] + [
            AIMessage(content=response.content)
        ],
        "itinerary": validated_itinerary,
    }
```

**Error Handling**:
```python
except (json.JSONDecodeError, KeyError) as e:
    print(f"Error parsing JSON: {e}")
    # Return fallback itinerary
    fallback_itinerary = []
    for day in range(1, state['duration'] + 1):
        fallback_itinerary.append({
            "day": day,
            "title": f"Explore {state['city']} - Day {day}",
            "description": f"Discover the best of {state['city']} 
                           with activities related to {interests}",
            "location": state['city']
        })
    
    return {
        **state,
        "messages": state['messages'] + [
            AIMessage(content="Generated fallback itinerary")
        ],
        "itinerary": fallback_itinerary,
    }
```

### 4. LangGraph Workflow

```python
# Create graph
workflow = StateGraph(PlannerState)

# Add nodes
workflow.add_node("set_city", set_city)
workflow.add_node("set_interests", set_interests)
workflow.add_node("create_itinerary", create_itinerary)

# Define flow
workflow.set_entry_point('set_city')
workflow.add_edge("set_city", "set_interests")
workflow.add_edge('set_interests', 'create_itinerary')
workflow.add_edge('create_itinerary', END)

# Compile
app_graph = workflow.compile()
```

**Flow Diagram**:
```
START
  ↓
set_city
  ↓
set_interests
  ↓
create_itinerary
  ↓
END
```

### 5. Travel Planner Function

```python
def travel_planner(user_request: str, city: str, 
                  interests: List[str], duration: int):
    """
    Orchestrates the trip planning workflow
    
    Args:
        user_request: Natural language user request
        city: Destination city
        interests: List of interests
        duration: Trip duration in days
    
    Returns:
        List of itinerary dictionaries for each day
    """
    state = {
        "messages": [HumanMessage(content=user_request)],
        "city": city,
        "interests": interests,
        "duration": duration,
        "itinerary": [],
    }
    
    # Stream through workflow
    final_state = None
    for output in app_graph.stream(state):
        final_state = output
    
    # Extract itinerary
    if final_state:
        for node_output in final_state.values():
            if 'itinerary' in node_output and node_output['itinerary']:
                return node_output['itinerary']
    
    return []
```

### 6. FastAPI Endpoints

#### Health Check
```python
@app.get("/")
def read_root():
    return {
        "message": "TourMate AI Itinerary Generator",
        "status": "active",
        "version": "1.0.0"
    }
```

#### Itinerary Generation
```python
@app.post("/plan-trip")
def plan_trip(trip_request: TripRequest):
    try:
        # Parse interests
        interests_list = [
            interest.strip() 
            for interest in trip_request.interests.split(",")
        ]
        
        # Generate itinerary
        result = travel_planner(
            trip_request.request,
            trip_request.city,
            interests_list,
            trip_request.duration
        )
        
        return {
            "message": "Trip planning completed",
            "itinerary": result
        }
    
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to generate trip plan"
        )
```

#### Request Validation
```python
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=422,
        content={
            "detail": exc.errors(),
            "body": exc.body
        }
    )
```

---

## API Usage

### Setup & Configuration

#### Environment Variables (.env)
```env
# Google Generative AI
GOOGLE_API_KEY=your_actual_google_api_key_here

# FastAPI
PORT=8881
HOST=0.0.0.0

# Logging
LOG_LEVEL=INFO
```

#### Python Setup
```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run service
python main.py
```

Service will start on: `http://localhost:8881`

### Request Format

**Endpoint**: `POST /plan-trip`

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "request": "Plan my trip for each with time specific things to do in day",
  "city": "Goa",
  "interests": "beach, food, culture, nightlife",
  "duration": 5
}
```

### Response Format

**Success Response** (Status: 200):
```json
{
  "message": "Trip planning completed",
  "itinerary": [
    {
      "day": 1,
      "title": "Day 1 - North Goa Beach - Welcome to Paradise",
      "description": "8:00 AM - Arrive at Baga Beach and check in to hotel\n10:00 AM - Visit Aguada Fort for historical insights\n12:30 PM - Lunch at Tito's Seafood Restaurant\n3:00 PM - Relax at Baga Beach with water sports\n6:00 PM - Explore Anjuna Flea Market\n8:00 PM - Dinner at Brittos Restaurant with beach view",
      "location": "North Goa"
    },
    {
      "day": 2,
      "title": "Day 2 - South Goa - Serenity and Heritage",
      "description": "8:00 AM - Begin at Palolem Beach for sunrise yoga\n10:00 AM - Visit Cabo de Rama Fort\n12:30 PM - Lunch at local shack cuisine\n3:00 PM - Explore Colva Beach and hire parasail\n6:00 PM - Visit ancient temples in the area\n8:00 PM - Dinner at beachside restaurant",
      "location": "South Goa"
    },
    {
      "day": 3,
      "title": "Day 3 - Spice Plantations & Riverside Adventures",
      "description": "8:00 AM - Visit Sahakari Spice Plantation\n10:00 AM - Traditional lunch with local spice curry\n12:30 PM - Relax in plantation resort\n3:00 PM - River cruise experience\n6:00 PM - Traditional Goan dance and music\n8:00 PM - Authentic Goan dinner",
      "location": "Plantation District"
    },
    {
      "day": 4,
      "title": "Day 4 - Wildlife & Nature Exploration",
      "description": "8:00 AM - Visit Bhagwan Mahavir Wildlife Sanctuary\n10:00 AM - Dudhsagar Waterfall trek\n12:30 PM - Pack lunch in nature\n3:00 PM - Bird watching in sanctuary\n6:00 PM - Return to coastal area\n8:00 PM - Beach barbecue dinner",
      "location": "Wildlife Reserve Area"
    },
    {
      "day": 5,
      "title": "Day 5 - Cultural Immersion & Local Markets",
      "description": "8:00 AM - Visit Margao Market for local shopping\n10:00 AM - Explore Menezes Braganza House\n12:30 PM - Lunch at heritage restaurant\n3:00 PM - Visit local art galleries\n6:00 PM - Participate in evening puja ceremony\n8:00 PM - Farewell dinner with sunset view",
      "location": "Margao Town"
    }
  ]
}
```

**Error Response** (Status: 500):
```json
{
  "detail": "Failed to generate trip plan"
}
```

**Validation Error** (Status: 422):
```json
{
  "detail": [
    {
      "type": "value_error",
      "loc": ["body", "duration"],
      "msg": "ensure this value is greater than or equal to 1"
    }
  ],
  "body": {...}
}
```

---

## Example Workflows

### Scenario 1: Family Trip to Kerala

**Request**:
```python
import requests

url = "http://localhost:8881/plan-trip"
payload = {
    "request": "Plan my trip for each with time specific things to do in day",
    "city": "Kerala",
    "interests": "backwaters, ayurveda, houseboats, local culture",
    "duration": 4
}

response = requests.post(url, json=payload)
itinerary = response.json()["itinerary"]

for day in itinerary:
    print(f"\n{day['title']}")
    print(f"Location: {day['location']}")
    print(f"Activities:\n{day['description']}")
```

**Expected Output**:
```
Day 1 - Kochi Port - Gateway to Kerala's Heritage
Location: Kochi Port
Activities:
8:00 AM - Arrive at Kochi airport and check in...

Day 2 - Kumarakom Backwaters - Serene Houseboat Experience
Location: Kumarakom
Activities:
8:00 AM - Take houseboat cruise...

Day 3 - Alleppey - Venice of the East
Location: Alleppey
Activities:
8:00 AM - Explore Alleppey Beach...

Day 4 - Thekkady - Spice Gardens & Wildlife
Location: Thekkady
Activities:
8:00 AM - Visit spice plantations...
```

### Scenario 2: Adventure Trip to Himachal Pradesh

**Request**:
```python
payload = {
    "request": "Plan my trip for each with time specific things to do in day",
    "city": "Shimla",
    "interests": "hiking, adventure sports, mountain views, local food",
    "duration": 3
}
```

### Scenario 3: Cultural Trip to Rajasthan

**Request**:
```python
payload = {
    "request": "Plan my trip for each with time specific things to do in day",
    "city": "Jaipur",
    "interests": "heritage sites, palaces, local markets, desert safaris",
    "duration": 4
}
```

---

## Integration with Travel-Mate Backend

### Backend Route Implementation

```javascript
// backend/routes/trips.js

const generateItinerary = async (destination, interests, duration) => {
  try {
    console.log('Generating itinerary for:', { destination, interests, duration });

    const response = await fetch(process.env.ITINERARY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        request: "Plan my trip for each with time specific things to do in day",
        city: destination,
        interests: interests,
        duration: duration
      }),
      timeout: 30000 // 30 second timeout
    });

    if (!response.ok) {
      console.error(`API response error: ${response.status} ${response.statusText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('API response:', data);

    if (data.itinerary && Array.isArray(data.itinerary)) {
      return data.itinerary;
    } else {
      console.error('Invalid itinerary format received:', data);
      return [];
    }
  } catch (error) {
    console.error('Itinerary generation error:', error);
    return [];
  }
};

// API Endpoint
router.post('/:id/generate-itinerary', authenticate, async (req, res) => {
  try {
    const { interests, duration } = req.body;
    const trip = await Trip.findById(req.params.id);
    
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const itinerary = await generateItinerary(
      trip.destination,
      interests,
      duration
    );

    trip.itinerary = itinerary;
    await trip.save();

    res.json({
      success: true,
      itinerary: itinerary,
      message: 'Itinerary generated successfully'
    });
  } catch (error) {
    console.error('Error generating itinerary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate itinerary'
    });
  }
});
```

### Environment Configuration

```bash
# backend/.env
ITINERARY_API_URL=http://localhost:8881/plan-trip
# or for production:
ITINERARY_API_URL=https://tourmate-ai.onrender.com/plan-trip
```

---

## Deployment

### Local Development

```bash
# Terminal 1: Start AI Service
cd ai-service
python main.py

# Terminal 2: Start Backend
cd backend
npm run dev

# Terminal 3: Start Frontend
cd frontend
npm run dev
```

### Production Deployment

#### Option 1: Render

Create `render.yaml`:
```yaml
services:
  - type: web
    name: tourmate-ai
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
    envVars:
      - key: GOOGLE_API_KEY
        scope: build
        sync: false
      - key: PORT
        value: 8000
```

#### Option 2: Railway

```bash
railway init
railway add python
railway up
```

#### Option 3: Docker

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8881"]
```

Build and run:
```bash
docker build -t tourmate-ai .
docker run -p 8881:8881 -e GOOGLE_API_KEY=<your-key> tourmate-ai
```

---

## Performance Optimization

### Response Time Optimization

1. **Parallel Node Execution** (if applicable)
   ```python
   # Future optimization: Run compatible nodes in parallel
   ```

2. **Caching Strategy**
   ```python
   from functools import lru_cache
   
   @lru_cache(maxsize=128)
   def cached_travel_planner(city, interests_tuple, duration):
       return travel_planner("...", city, list(interests_tuple), duration)
   ```

3. **Connection Pooling**
   ```python
   # Use httpx with connection pooling
   import httpx
   client = httpx.AsyncClient(limits=httpx.Limits(max_keepalive_connections=5))
   ```

### Monitoring & Logging

```python
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.post("/plan-trip")
def plan_trip(trip_request: TripRequest):
    logger.info(f"Received request for {trip_request.city}")
    try:
        # ... generate itinerary
        logger.info(f"Successfully generated {trip_request.duration}-day itinerary")
    except Exception as e:
        logger.error(f"Itinerary generation failed: {str(e)}")
        raise
```

---

## Troubleshooting

### Common Issues

#### 1. "401 Unauthorized" - Invalid API Key

**Problem**: Google API key is invalid or expired

**Solution**:
```bash
# Check .env file
cat .env | grep GOOGLE_API_KEY

# Regenerate API key from Google Cloud Console
# Update .env and restart service
```

#### 2. "Timeout" - AI Service Takes Too Long

**Problem**: Gemini API response is delayed

**Solution**:
```python
# Increase timeout in backend
timeout: 60000  # 60 seconds

# Or adjust prompt for faster response
temperature: 0.5  # May help with consistency
```

#### 3. "Invalid JSON" - Parsing Error

**Problem**: AI response is not valid JSON

**Solution**:
```python
# The code includes fallback mechanism
# But you can improve robustness:

import json
from typing import Optional

def safe_json_parse(content: str) -> Optional[dict]:
    try:
        # Try full parse
        return json.loads(content)
    except:
        pass
    
    try:
        # Try regex extraction
        match = re.search(r'\[.*\]', content, re.DOTALL)
        if match:
            return json.loads(match.group())
    except:
        pass
    
    # Return None for fallback handling
    return None
```

#### 4. "Import Error" - Missing Dependencies

**Problem**: Required packages not installed

**Solution**:
```bash
# Verify all dependencies
pip list | grep -E "fastapi|langchain|langgraph"

# Reinstall from requirements.txt
pip install -r requirements.txt --force-reinstall
```

---

## Future Enhancements

### Planned Features

- **Multi-language Support**: Generate itineraries in different languages
- **User Preferences**: Remember user preferences for future generations
- **Real-time Adjustments**: Modify itinerary based on weather or events
- **Budget Integration**: Factor in budget constraints
- **Accessibility Options**: Accommodate mobility challenges
- **Group Size Optimization**: Customize for group dynamics

### Advanced Features

- **Dynamic Pricing Integration**: Include estimated costs
- **Transportation Routing**: Suggest optimal routes between locations
- **Weather Integration**: Adapt itinerary based on forecast
- **Local Events Calendar**: Include nearby events and festivals
- **Reservation System**: Auto-book restaurants and attractions
- **Personalization Engine**: Learn from user feedback

---

## Code Example: Complete Implementation

```python
# main.py - Complete AI Itinerary Service

import os
from dotenv import load_dotenv
from typing import TypedDict, Annotated, List
from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.prompts import ChatPromptTemplate
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import json
import re

# Load environment variables
load_dotenv()

# Data Models
class TripRequest(BaseModel):
    request: str
    city: str
    interests: str
    duration: int

class PlannerState(TypedDict):
    messages: Annotated[List[HumanMessage | AIMessage], "messages in conversation"]
    city: str
    interests: List[str]
    duration: int
    itinerary: List[dict]

# Initialize LLM
from langchain_google_genai import ChatGoogleGenerativeAI
llm = ChatGoogleGenerativeAI(
    temperature=0,
    google_api_key=os.getenv("GOOGLE_API_KEY"),
    model="gemini-2.5-flash"
)

# Prompt Template
itinerary_prompt = ChatPromptTemplate.from_messages([
    ("system", """You are an expert travel guide. Create a realistic 
    and enjoyable {duration}-day itinerary for {city} for travelers 
    interested in {interests}.

CRITICAL: Each day MUST be COMPLETELY DIFFERENT with unique locations, 
attractions, and activities. Do NOT repeat the same places or activities 
across different days.

For EACH day:
1. Focus on a DIFFERENT neighborhood, district, or area of {city}
2. Provide specific attractions unique to that area
3. Create a time-based schedule for the ENTIRE day
4. Mix famous sites with local hidden gems

IMPORTANT - Return ONLY valid JSON with NO extra text:
[
  {{
    "day": 1,
    "title": "Day 1 - [Area Name] - [Catchy title]",
    "description": "8:00 AM - Start at [landmark]\n10:00 AM - Visit [attraction]...",
    "location": "[Specific area/neighborhood - NOT the city]"
  }}
]"""),
    ("human", "Create a {duration}-day itinerary for {city} with interests in {interests}"),
])

# Workflow Nodes
def set_city(state: PlannerState) -> PlannerState:
    return {
        **state,
        "messages": state['messages'] + [HumanMessage(content=f"City: {state['city']}")],
    }

def set_interests(state: PlannerState) -> PlannerState:
    return {
        **state,
        "messages": state['messages'] + [HumanMessage(content=f"Interests: {', '.join(state['interests'])}")],
    }

def create_itinerary(state: PlannerState) -> PlannerState:
    try:
        response = llm.invoke(itinerary_prompt.format_messages(
            city=state['city'], 
            interests=', '.join(state['interests']),
            duration=state['duration']
        ))
        
        content = response.content.strip()
        json_match = re.search(r'\[.*\]', content, re.DOTALL)
        
        if json_match:
            json_str = json_match.group()
            itinerary_data = json.loads(json_str)
        else:
            itinerary_data = json.loads(content)
        
        validated_itinerary = []
        for item in itinerary_data:
            validated_item = {
                "day": item.get("day", len(validated_itinerary) + 1),
                "title": item.get("title", f"Day {item.get('day')} Activities"),
                "description": item.get("description", "Activities planned"),
                "location": item.get("location", state['city'])
            }
            validated_itinerary.append(validated_item)
        
        return {
            **state,
            "messages": state['messages'] + [AIMessage(content=response.content)],
            "itinerary": validated_itinerary,
        }
    
    except (json.JSONDecodeError, KeyError) as e:
        fallback_itinerary = []
        for day in range(1, state['duration'] + 1):
            fallback_itinerary.append({
                "day": day,
                "title": f"Explore {state['city']} - Day {day}",
                "description": f"Discover the best of {state['city']}",
                "location": state['city']
            })
        
        return {
            **state,
            "messages": state['messages'] + [AIMessage(content="Fallback itinerary generated")],
            "itinerary": fallback_itinerary,
        }

# Setup Workflow
workflow = StateGraph(PlannerState)
workflow.add_node("set_city", set_city)
workflow.add_node("set_interests", set_interests)
workflow.add_node("create_itinerary", create_itinerary)
workflow.set_entry_point('set_city')
workflow.add_edge("set_city", "set_interests")
workflow.add_edge('set_interests', 'create_itinerary')
workflow.add_edge('create_itinerary', END)
app_graph = workflow.compile()

# Travel Planner Function
def travel_planner(user_request: str, city: str, interests: List[str], duration: int):
    state = {
        "messages": [HumanMessage(content=user_request)],
        "city": city,
        "interests": interests,
        "duration": duration,
        "itinerary": [],
    }
    
    final_state = None
    for output in app_graph.stream(state):
        final_state = output
    
    if final_state:
        for node_output in final_state.values():
            if 'itinerary' in node_output and node_output['itinerary']:
                return node_output['itinerary']
    
    return []

# FastAPI App
app = FastAPI(title="TourMate AI Itinerary Generator", version="1.0.0")

@app.get("/")
def read_root():
    return {"message": "TourMate AI Itinerary Generator", "status": "active"}

@app.post("/plan-trip")
def plan_trip(trip_request: TripRequest):
    try:
        interests_list = [interest.strip() for interest in trip_request.interests.split(",")]
        result = travel_planner(trip_request.request, trip_request.city, interests_list, trip_request.duration)
        return {"message": "Trip planning completed", "itinerary": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to generate trip plan")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8881))
    uvicorn.run(app, host="0.0.0.0", port=port)
```

---

## References & Resources

- **LangGraph**: https://langchain-ai.github.io/langgraph/
- **LangChain**: https://python.langchain.com/
- **FastAPI**: https://fastapi.tiangolo.com/
- **Google Generative AI**: https://ai.google.dev/
- **Pydantic**: https://docs.pydantic.dev/

---

**🤖 Powered by Generative AI for Smarter Travel Planning!**