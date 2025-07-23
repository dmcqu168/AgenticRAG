from app.models.base import Base, engine
from app.models.document import Document
from sqlalchemy.orm import sessionmaker

# Create all tables
Base.metadata.create_all(bind=engine)

# Create a new session
Session = sessionmaker(bind=engine)
session = Session()

# Try to query the database
try:
    count = session.query(Document).count()
    print(f"Successfully connected to the database. Found {count} documents.")
except Exception as e:
    print(f"Error connecting to the database: {e}")
finally:
    session.close()
