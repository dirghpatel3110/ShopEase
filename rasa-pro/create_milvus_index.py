from pymilvus import connections, FieldSchema, CollectionSchema, DataType, Collection, utility
import openai
import json
import numpy as np
from sklearn.preprocessing import normalize
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

openai.api_key = os.getenv("OPENAI_API_KEY", "OPENAI API Key")

if not openai.api_key:
    raise ValueError("OpenAI API key not found! Set it in the environment variable 'OPENAI_API_KEY'.")

MILVUS_HOST = os.getenv("MILVUS_HOST", "localhost")
MILVUS_PORT = os.getenv("MILVUS_PORT", "19530")
COLLECTION_NAME = "rasa"  

connections.connect("default", host=MILVUS_HOST, port=MILVUS_PORT)
logger.info(f"Connected to Milvus at {MILVUS_HOST}:{MILVUS_PORT}")

fields = [
    FieldSchema(name="id", dtype=DataType.INT64, is_primary=True, auto_id=False),
    FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=1536),
    FieldSchema(name="title", dtype=DataType.VARCHAR, max_length=255), 
    FieldSchema(name="content", dtype=DataType.VARCHAR, max_length=5000),  
]
schema = CollectionSchema(fields, "Document embeddings and metadata for similarity search")

if not utility.has_collection(COLLECTION_NAME):
    collection = Collection(name=COLLECTION_NAME, schema=schema)
    logger.info(f"Collection '{COLLECTION_NAME}' created.")
else:
    collection = Collection(name=COLLECTION_NAME)
    logger.info(f"Collection '{COLLECTION_NAME}' already exists.")

try:
    with open('data/documents.json', 'r') as file:
        documents = json.load(file)
        logger.info(f"Loaded {len(documents)} documents.")
except FileNotFoundError:
    logger.error("Documents file not found! Ensure 'data/documents.json' exists.")
    raise

embeddings = []
ids = []  
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
            input=[content],
            model="text-embedding-ada-002"
        )
        embedding = response["data"][0]["embedding"]
        embeddings.append(embedding)
        ids.append(idx)
        titles.append(title)
        contents.append(content)

        if idx % 10 == 0:
            logger.info(f"Processed {idx + 1}/{len(documents)} documents.")
    except Exception as e:
        logger.error(f"Error generating embedding for document {idx}: {e}")
        continue

if not embeddings:
    logger.error("No embeddings were generated. Exiting.")
    raise ValueError("Embeddings list is empty.")

embeddings = np.array(embeddings).astype("float32")
embeddings = normalize(embeddings, axis=1)

try:
    collection.insert([ids, embeddings, titles, contents])
    collection.flush()
    logger.info(f"Inserted {len(embeddings)} documents into '{COLLECTION_NAME}'.")
except Exception as e:
    logger.error(f"Error inserting data into Milvus: {e}")
    raise

if not collection.indexes:
    index_params = {
        "metric_type": "IP",  
        "index_type": "IVF_FLAT",
        "params": {"nlist": 128},  
    }
    try:
        collection.create_index(field_name="embedding", index_params=index_params)
        logger.info("Index created successfully.")
    except Exception as e:
        logger.error(f"Error creating index: {e}")
        raise

logger.info("Milvus index creation completed successfully.")
