from sqlalchemy import create_engine
from looserver import settings
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship, backref

engine = create_engine(settings.DB_URI)

Base = declarative_base()


class Toilet(Base):
    __tablename__ = 'toilets'

    id = Column(Integer, primary_key=True)
    identifier = Column(String)  # bluetooth identifier
    floor = Column(Integer)
    gender = Column(String)
    label = Column(String)
    in_use = Column(Boolean)


class Event(Base):
    __tablename__ = 'events'

    id = Column(Integer, primary_key=True)
    timestamp = Column(DateTime)
    toilet_id = Column(Integer, ForeignKey('toilets.id'))
    toilet = relationship(Toilet, backref='events')
    in_use = Column(Boolean)
