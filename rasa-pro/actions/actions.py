from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from .milvus_utils import MilvusConnector, QueryEmbeddingGenerator, SimilaritySearchProcessor
import logging
import os
import openai

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ActionMilvusSearch(Action):
    def name(self) -> Text:
        return "action_milvus_search"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        logger.info("Custom action 'action_milvus_search' triggered.")

        try:
            # Step 1: Connect to Milvus and load collection using MilvusConnector class
            milvus_connector = MilvusConnector()
            collection = milvus_connector.connect_and_load()

            # Step 2: Retrieve user query and validate it
            query = tracker.latest_message.get("text", "").strip()
            if not query:
                dispatcher.utter_message(text="Please enter a valid query.")
                return []

            logger.info(f"User query: {query}")

            # Step 3: Generate query embedding using QueryEmbeddingGenerator class
            api_key = "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"  # Replace with secure storage method!
            embedding_generator = QueryEmbeddingGenerator(api_key=api_key)
            query_embedding = embedding_generator.generate_embedding(query)

            # Steps 4 & 5: Perform similarity search and filter results using SimilaritySearchProcessor class
            threshold = float(os.getenv("SIMILARITY_THRESHOLD", "0.5"))
            search_processor = SimilaritySearchProcessor(collection=collection, threshold=threshold)
            retrieved_docs = search_processor.search_and_filter(query_embedding)

            if not retrieved_docs:
                dispatcher.utter_message(text="Sorry, I couldn't find any relevant documents.")
                return []

            # Step 6: Prepare GPT prompt with retrieved documents and generate response (unchanged)
            context = "\n\n".join([f"{doc['title']}: {doc['content']} (Score: {doc['score']:.2f})" for doc in retrieved_docs])
            
            gpt_response = openai.ChatCompletion.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": f"Use the following context:\n\n{context}"},
                    {"role": "user", "content": query},
                ],
                temperature=0.1,
                max_tokens=300,
            )
            
            response_text = gpt_response["choices"][0]["message"]["content"].strip()

        except Exception as e:
            logger.exception("Error in 'action_milvus_search':")
            response_text = f"An error occurred while processing your request."

        dispatcher.utter_message(text=response_text)
        return []
