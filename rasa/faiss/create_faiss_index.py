import faiss
import json
import numpy as np
import openai

# Set OpenAI API key (replace with your actual API key)
openai.api_key = "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"

# Load documents
with open('data/documents.json', 'r') as file:
    documents = json.load(file)

# Generate embeddings using OpenAI's text-embedding-ada-002 model
embeddings = []
for doc in documents:
    response = openai.Embedding.create(
        input=doc['content'],  # Document content
        model="text-embedding-ada-002"
    )
    embedding = response["data"][0]["embedding"]
    embeddings.append(embedding)

# Convert embeddings to a NumPy array
embeddings = np.array(embeddings).astype("float32")

# Normalize embeddings for FAISS cosine similarity search
faiss.normalize_L2(embeddings)

# Create and save FAISS index
dimension = embeddings.shape[1]  # Should be 1536 for text-embedding-ada-002
index = faiss.IndexFlatL2(dimension)
index.add(embeddings)

faiss.write_index(index, 'faiss/faiss_index')

# Save metadata
with open('faiss/metadata.json', 'w') as meta_file:
    json.dump(documents, meta_file)

print("FAISS index created successfully.")
