from sqlalchemy import create_engine, Column, Integer, Float, String, Date
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class Allenamento(Base):
    __tablename__ = "allenamenti"
    id = Column(Integer, primary_key=True)
    data = Column(Date, nullable=False)
    tipo_attivita = Column(String)
    durata_minuti = Column(Integer)
    calorie_stimate = Column(Float)
    frequenza_cardiaca_media = Column(Integer)
    frequenza_cardiaca_max = Column(Integer, nullable=True)
    passi_allenamento = Column(Integer, nullable=True)
    distanza_km = Column(Float, nullable=True)

class Sonno(Base):
    __tablename__ = "sonno"
    id = Column(Integer, primary_key=True)
    data = Column(Date, nullable=False, unique=True)
    ore_totali = Column(Float)
    ore_sonno_leggero = Column(Float)
    ore_sonno_profondo = Column(Float)
    ore_sonno_rem = Column(Float)
    qualita_percepita = Column(Integer)

class Pisolino(Base):
    __tablename__ = "pisolini"
    id = Column(Integer, primary_key=True)
    data = Column(Date, nullable=False)
    ora_inizio = Column(String)  # opzionale, se la band lo fornisce
    durata_minuti = Column(Integer)

class MisuraCorporea(Base):
    __tablename__ = "misure_corporee"
    id = Column(Integer, primary_key=True)
    data = Column(Date, nullable=False)
    peso_kg = Column(Float)
    percentuale_grasso = Column(Float)
    massa_magra = Column(Float)
    bmi = Column(Float)

class Passi(Base):
    __tablename__ = "passi"
    id = Column(Integer, primary_key=True)
    data = Column(Date, nullable=False, unique=True)
    numero_passi = Column(Integer)
    distanza_km = Column(Float, nullable=True)

# Crea il database fisico (file fitness.db) se non esiste
engine = create_engine("sqlite:///fitness.db")
Base.metadata.create_all(engine)