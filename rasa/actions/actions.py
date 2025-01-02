from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
import faiss
import json
import numpy as np
import openai
import os
import logging

# Set OpenAI API key (replace with your actual API key)
openai.api_key = "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"

# Environment variables to prevent threading issues (especially on macOS)
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

class ActionFaissSearch(Action):
    def name(self) -> Text:
        return "action_faiss_search"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        logging.info("Custom action 'action_faiss_search' triggered.")

        try:
            # Load FAISS index and metadata
            index_path = "faiss/faiss_index"
            metadata_path = "faiss/metadata.json"
            
            if not os.path.exists(index_path):
                raise FileNotFoundError(f"FAISS index not found at {index_path}")
            if not os.path.exists(metadata_path):
                raise FileNotFoundError(f"Metadata file not found at {metadata_path}")

            index = faiss.read_index(index_path)
            with open(metadata_path, "r") as meta_file:
                metadata = json.load(meta_file)

            # Get the user query from the tracker
            query = tracker.latest_message.get("text")
            logging.info(f"User query: {query}")

            # Generate embeddings for the query using OpenAI's embedding model
            embedding_response = openai.Embedding.create(
                input=[query],  # Pass the input as a list
                model="text-embedding-ada-002"  # Use the correct model name
            )
            query_embedding = np.array(embedding_response["data"][0]["embedding"]).astype("float32")
            logging.info("Query embedding generated successfully.")

            # Normalize the query embedding for cosine similarity search
            faiss.normalize_L2(query_embedding.reshape(1, -1))

            # Perform the FAISS search (retrieve top-k results)
            k = 3  # Number of results to retrieve
            distances, indices = index.search(query_embedding.reshape(1, -1), k)

            # Fetch corresponding metadata for results
            results = [metadata[idx] for idx in indices[0] if idx != -1]
            logging.info(f"Search results: {results}")

            # If no results are found, respond accordingly
            if not results:
                response_text = "Sorry, I couldn't find any relevant documents."
                dispatcher.utter_message(text=response_text)
                return []

            # Combine retrieved documents into a single prompt for GPT-4
            context = "\n\n".join([f"{result['title']}: {result['content']}" for result in results])
            
            # Use GPT-4 to generate a response based on the retrieved documents and user query
            gpt_response = openai.ChatCompletion.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are a helpful assistant. Use the following context to answer the user's question:"
                            f"\n\n{context}"
                        ),
                    },
                    {"role": "user", "content": query},
                ],
                temperature=0.1,
                max_tokens=300,
            )

            # Extract the response text from GPT-4's output
            response_text = gpt_response["choices"][0]["message"]["content"].strip()
            logging.info("Response generated by GPT-4.")

        except Exception as e:
            logging.exception("Error in 'action_faiss_search':")
            response_text = f"An error occurred while processing your request: {str(e)}"

        # Send the response back to the user
        dispatcher.utter_message(text=response_text)
        return []
