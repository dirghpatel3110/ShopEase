# milvus_utils.py
# Utility classes for Milvus operations

class MilvusConnector:
    def __init__(self, host="localhost", port="19530", collection_name="rasa"):
        from pymilvus import connections, utility, Collection
        self.host = host
        self.port = port
        self.collection_name = collection_name
        self.collection = None
        self.connections = connections
        self.utility = utility
        self.Collection = Collection

    def connect_and_load(self):
        self.connections.connect("default", host=self.host, port=self.port)
        if not self.utility.has_collection(self.collection_name):
            raise ValueError(f"Collection '{self.collection_name}' does not exist in Milvus.")
        self.collection = self.Collection(self.collection_name)
        self.collection.load()
        return self.collection


class QueryEmbeddingGenerator:
    def __init__(self, api_key):
        import openai
        import numpy as np
        from sklearn.preprocessing import normalize
        self.openai = openai
        self.np = np
        self.normalize = normalize
        self.openai.api_key = api_key

    def generate_embedding(self, query):
        if not query:
            raise ValueError("Query cannot be empty.")
        embedding_response = self.openai.Embedding.create(
            input=[query],
            model="text-embedding-ada-002"
        )
        query_embedding = self.np.array(embedding_response["data"][0]["embedding"]).reshape(1, -1).astype("float32")
        query_embedding = self.normalize(query_embedding, axis=1)
        return query_embedding


class SimilaritySearchProcessor:
    def __init__(self, collection, threshold=0.5, k=3):
        self.collection = collection
        self.threshold = threshold
        self.k = k

    def search_and_filter(self, query_embedding):
        search_params = {"metric_type": "IP", "params": {"nprobe": 10}}
        results = self.collection.search(
            data=query_embedding,
            anns_field="embedding",
            param=search_params,
            limit=self.k,
            output_fields=["id", "title", "content"]
        )

        retrieved_docs = []
        for hits in results:
            for hit in hits:
                if hit.score >= self.threshold:
                    retrieved_docs.append({
                        "id": hit.id,
                        "title": getattr(hit.entity, "title", "Untitled"),
                        "content": getattr(hit.entity, "content", "No content available"),
                        "score": hit.score,
                    })
        return retrieved_docs
