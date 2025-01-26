from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from .milvus_utils import MilvusConnector, QueryEmbeddingGenerator, SimilaritySearchProcessor
import logging
import os
import openai

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ActionMilvusSearch(Action):
    def name(self) -> Text:
        return "action_milvus_search"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        logger.info("Custom action 'action_milvus_search' triggered.")

        try:
            milvus_connector = MilvusConnector()
            collection = milvus_connector.connect_and_load()

            query = tracker.latest_message.get("text", "").strip()
            if not query:
                dispatcher.utter_message(text="Please enter a valid query.")
                return []

            logger.info(f"User query: {query}")

            api_key = "OpenAI API Key"  
            embedding_generator = QueryEmbeddingGenerator(api_key=api_key)
            query_embedding = embedding_generator.generate_embedding(query)

            threshold = float(os.getenv("SIMILARITY_THRESHOLD", "0.5"))
            search_processor = SimilaritySearchProcessor(collection=collection, threshold=threshold)
            retrieved_docs = search_processor.search_and_filter(query_embedding)

            if not retrieved_docs:
                dispatcher.utter_message(text="Sorry, I couldn't find any relevant documents.")
                return []
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
