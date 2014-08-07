from sqlalchemy import create_engine
from looserver import settings
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, ForeignKey,
    Float
)

from sqlalchemy.orm import relationship, sessionmaker

engine = create_engine(settings.DB_URI)
Session = sessionmaker(bind=engine)

Base = declarative_base()


class Loo(Base):
    __tablename__ = 'loos'

    id = Column(Integer, primary_key=True)
    identifier = Column(String, unique=True)  # bluetooth identifier
    floor = Column(Integer)
    gender = Column(String)
    label = Column(String)
    in_use = Column(Boolean)


class Event(Base):
    __tablename__ = 'events'

    id = Column(Integer, primary_key=True)
    timestamp = Column(DateTime)
    loo_id = Column(Integer, ForeignKey('loos.id'))
    loo = relationship(Loo, backref='events')
    in_use = Column(Boolean)
    seconds_in_state = Column(Float, nullable=True)
