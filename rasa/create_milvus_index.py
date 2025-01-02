from pymilvus import connections, FieldSchema, CollectionSchema, DataType, Collection, utility
import openai
import json
import numpy as np
from sklearn.preprocessing import normalize
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load OpenAI API key from environment variable
openai.api_key = os.getenv("OPENAI_API_KEY", "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")

if not openai.api_key:
    raise ValueError("OpenAI API key not found! Set it in the environment variable 'OPENAI_API_KEY'.")

# Milvus configuration
MILVUS_HOST = os.getenv("MILVUS_HOST", "localhost")
MILVUS_PORT = os.getenv("MILVUS_PORT", "19530")
COLLECTION_NAME = "rasa"  # Update with your desired collection name

# Connect to Milvus
connections.connect("default", host=MILVUS_HOST, port=MILVUS_PORT)
logger.info(f"Connected to Milvus at {MILVUS_HOST}:{MILVUS_PORT}")

# Define schema for Milvus collection
fields = [
    FieldSchema(name="id", dtype=DataType.INT64, is_primary=True, auto_id=False),
    FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=1536),
    FieldSchema(name="title", dtype=DataType.VARCHAR, max_length=255),  # Add title field
    FieldSchema(name="content", dtype=DataType.VARCHAR, max_length=5000),  # Add content field
]
schema = CollectionSchema(fields, "Document embeddings and metadata for similarity search")

# Create or load collection
if not utility.has_collection(COLLECTION_NAME):
    collection = Collection(name=COLLECTION_NAME, schema=schema)
    logger.info(f"Collection '{COLLECTION_NAME}' created.")
else:
    collection = Collection(name=COLLECTION_NAME)
    logger.info(f"Collection '{COLLECTION_NAME}' already exists.")

# Load documents from JSON file
try:
    with open('data/documents.json', 'r') as file:
        documents = json.load(file)
        logger.info(f"Loaded {len(documents)} documents.")
except FileNotFoundError:
    logger.error("Documents file not found! Ensure 'data/documents.json' exists.")
    raise

# Generate embeddings and prepare data
embeddings = []
ids = []  # Store unique IDs for each document
titles = []
contents = []

for idx, doc in enumerate(documents):
    try:
        title = doc.get('title', '').strip()
        content = doc.get('content', '').strip()
        if not content:
            logger.warning(f"Document {idx} has no content; skipping.")
            continue

        response = openai.Embedding.create(
            input=content,
            model="text-embedding-ada-002"
        )
        embedding = response["data"][0]["embedding"]
        embeddings.append(embedding)
        ids.append(idx)  # Use a unique identifier (e.g., index)
        titles.append(title)
        contents.append(content)

        if idx % 10 == 0:  # Log progress every 10 documents
            logger.info(f"Processed {idx + 1}/{len(documents)} documents.")
    except Exception as e:
        logger.error(f"Error generating embedding for document {idx}: {e}")
        continue

# Normalize embeddings
embeddings = np.array(embeddings).astype("float32")
embeddings = normalize(embeddings, axis=1)

# Insert data into Milvus collection
try:
    collection.insert([ids, embeddings, titles, contents])
    collection.flush()
    logger.info(f"Inserted {len(embeddings)} documents into '{COLLECTION_NAME}'.")
except Exception as e:
    logger.error(f"Error inserting data into Milvus: {e}")
    raise

# Create an index if it doesn't exist
if not collection.indexes:
    index_params = {
        "metric_type": "IP",  # Inner Product (cosine similarity)
        "index_type": "IVF_FLAT",
        "params": {"nlist": 128},  # Number of clusters
    }
    try:
        collection.create_index(field_name="embedding", index_params=index_params)
        logger.info("Index created successfully.")
    except Exception as e:
        logger.error(f"Error creating index: {e}")
        raise

logger.info("Milvus index creation completed successfully.")
