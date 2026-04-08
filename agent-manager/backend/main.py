from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
import uuid
from datetime import datetime

from database import engine, get_db, Base
from models import Agent, Conversation, Feedback

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Schemas ---
class AgentCreate(BaseModel):
    name: str
    description: Optional[str] = None

class AgentUpdate(BaseModel):
    name: str
    description: Optional[str] = None

class AgentOut(BaseModel):
    id: str
    name: str
    description: Optional[str]
    system_guideline: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class MessageItem(BaseModel):
    role: str
    content: str

class ConversationCreate(BaseModel):
    messages: List[MessageItem]
    title: Optional[str] = None

class FeedbackOut(BaseModel):
    id: str
    rating: Optional[int]
    comment: Optional[str]

    class Config:
        from_attributes = True

class ConversationOut(BaseModel):
    id: str
    agent_id: str
    title: Optional[str]
    messages: list
    created_at: datetime
    feedback: Optional[FeedbackOut]

    class Config:
        from_attributes = True

class FeedbackCreate(BaseModel):
    rating: Optional[int] = None
    comment: Optional[str] = None

class SystemGuidelineUpdate(BaseModel):
    system_guideline: Optional[str] = None

# --- Agent Routes ---
@app.get("/agents", response_model=list[AgentOut])
def get_agents(db: Session = Depends(get_db)):
    return db.query(Agent).order_by(Agent.created_at.desc()).all()

@app.get("/agents/{agent_id}", response_model=AgentOut)
def get_agent(agent_id: str, db: Session = Depends(get_db)):
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent

@app.post("/agents", response_model=AgentOut, status_code=201)
def create_agent(agent: AgentCreate, db: Session = Depends(get_db)):
    if not agent.name.strip():
        raise HTTPException(status_code=422, detail="Agent name is required")
    existing = db.query(Agent).filter(Agent.name == agent.name.strip()).first()
    if existing:
        raise HTTPException(status_code=409, detail="Agent name already exists")
    new_agent = Agent(
        id=str(uuid.uuid4()),
        name=agent.name.strip(),
        description=agent.description
    )
    db.add(new_agent)
    db.commit()
    db.refresh(new_agent)
    return new_agent

@app.put("/agents/{agent_id}", response_model=AgentOut)
def update_agent(agent_id: str, agent: AgentUpdate, db: Session = Depends(get_db)):
    if not agent.name.strip():
        raise HTTPException(status_code=422, detail="Agent name is required")
    db_agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not db_agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    existing = db.query(Agent).filter(
        Agent.name == agent.name.strip(), Agent.id != agent_id
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Agent name already exists")
    db_agent.name = agent.name.strip()
    db_agent.description = agent.description
    db.commit()
    db.refresh(db_agent)
    return db_agent

@app.patch("/agents/{agent_id}/guideline", response_model=AgentOut)
def update_guideline(agent_id: str, body: SystemGuidelineUpdate, db: Session = Depends(get_db)):
    db_agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not db_agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    db_agent.system_guideline = body.system_guideline
    db.commit()
    db.refresh(db_agent)
    return db_agent

@app.delete("/agents/{agent_id}", status_code=204)
def delete_agent(agent_id: str, db: Session = Depends(get_db)):
    db_agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not db_agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    db.delete(db_agent)
    db.commit()

# --- Conversation Routes ---
def validate_messages(messages):
    filtered = [m for m in messages if m["role"] != "system"]
    if len(filtered) < 2:
        raise HTTPException(status_code=422, detail="At least one complete user→assistant pair required.")
    for i, m in enumerate(filtered):
        if not m["content"].strip():
            raise HTTPException(status_code=422, detail="Messages cannot be empty.")
        expected = "user" if i % 2 == 0 else "assistant"
        if m["role"] != expected:
            raise HTTPException(status_code=422, detail="Messages must alternate user → assistant.")
    return filtered

@app.get("/agents/{agent_id}/conversations", response_model=list[ConversationOut])
def get_conversations(agent_id: str, db: Session = Depends(get_db)):
    return db.query(Conversation).filter(Conversation.agent_id == agent_id).order_by(Conversation.created_at.desc()).all()

@app.get("/conversations/{conversation_id}", response_model=ConversationOut)
def get_conversation(conversation_id: str, db: Session = Depends(get_db)):
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conv

@app.post("/agents/{agent_id}/conversations", response_model=ConversationOut, status_code=201)
def create_conversation(agent_id: str, body: ConversationCreate, db: Session = Depends(get_db)):
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    messages_dict = [{"role": m.role, "content": m.content} for m in body.messages]
    filtered = validate_messages(messages_dict)
    conv = Conversation(
        id=str(uuid.uuid4()),
        agent_id=agent_id,
        title=body.title or f"Conversation {datetime.now().strftime('%b %d, %H:%M')}",
        messages=filtered
    )
    db.add(conv)
    db.commit()
    db.refresh(conv)
    return conv

@app.post("/agents/{agent_id}/upload", response_model=list[ConversationOut], status_code=201)
def upload_conversations(agent_id: str, body: dict, db: Session = Depends(get_db)):
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    if "system_guideline" in body and body["system_guideline"]:
        agent.system_guideline = body["system_guideline"]
    raw_conversations = body.get("conversations", [])
    if not raw_conversations:
        raise HTTPException(status_code=422, detail="No conversations found in file.")
    created = []
    for i, msgs in enumerate(raw_conversations):
        msgs_dict = [{"role": m["role"], "content": m["content"]} for m in msgs]
        filtered = validate_messages(msgs_dict)
        conv = Conversation(
            id=str(uuid.uuid4()),
            agent_id=agent_id,
            title=f"Conversation {i+1} — {datetime.now().strftime('%b %d, %H:%M')}",
            messages=filtered
        )
        db.add(conv)
        created.append(conv)
    db.commit()
    for c in created:
        db.refresh(c)
    return created

@app.delete("/conversations/{conversation_id}", status_code=204)
def delete_conversation(conversation_id: str, db: Session = Depends(get_db)):
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    db.delete(conv)
    db.commit()

# --- Feedback Routes ---
@app.post("/conversations/{conversation_id}/feedback", response_model=FeedbackOut)
def upsert_feedback(conversation_id: str, body: FeedbackCreate, db: Session = Depends(get_db)):
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    existing = db.query(Feedback).filter(Feedback.conversation_id == conversation_id).first()
    if existing:
        existing.rating = body.rating
        existing.comment = body.comment
        db.commit()
        db.refresh(existing)
        return existing
    fb = Feedback(
        id=str(uuid.uuid4()),
        conversation_id=conversation_id,
        rating=body.rating,
        comment=body.comment
    )
    db.add(fb)
    db.commit()
    db.refresh(fb)
    return fb