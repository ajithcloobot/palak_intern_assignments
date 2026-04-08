from sqlalchemy import Column, Integer, String, DateTime, Enum
from sqlalchemy.sql import func
from database import Base
import enum

class AuthProvider(enum.Enum):
    LOCAL = "local"
    OKTA = "okta"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True)  # Nullable for SSO users
    provider = Column(Enum(AuthProvider), nullable=False, default=AuthProvider.LOCAL)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<User(email={self.email}, provider={self.provider})>"
