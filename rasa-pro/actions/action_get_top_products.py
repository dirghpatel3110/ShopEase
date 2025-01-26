from typing import Any, Text, Dict, List
import requests
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher


class ActionGetTopProducts(Action):
    def name(self) -> Text:
        return "action_get_top_products"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any]
    ) -> List[Dict[Text, Any]]:
        product_name = tracker.get_slot("productName")

        api_url = "http://localhost:5001/api/auth/search"

        try:
            response = requests.get(api_url, params={"query": product_name})
            response.raise_for_status() 
            
            results = response.json().get("results", [])[:5] 
            
            if results:
                product_list = "\n".join(
                    [
                        f"{i+1}. {product['name']} - ${product['price']}\n   {product['description']}"
                        for i, product in enumerate(results)
                    ]
                )
                dispatcher.utter_message(text=f"Here are the top 5 products:\n{product_list}")
            else:
                dispatcher.utter_message(text="Sorry, I couldn't find any products matching your query.")

        except requests.exceptions.RequestException as e:
            dispatcher.utter_message(text="Sorry, I couldn't fetch the top products at the moment.")
            print(f"Error while fetching products: {e}")

        return []


class ActionStoreCart(Action):
    def name(self) -> Text:
        return "action_store_cart"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any]
    ) -> List[Dict[Text, Any]]:
        selected_product = tracker.get_slot("selectedProduct")
        quantity = tracker.get_slot("quantity")

        api_url = "http://localhost:5001/api/auth/cart"

        try:
            payload = {
                "product_name": selected_product,
                "quantity": int(quantity) if quantity.isdigit() else quantity,
            }

            response = requests.post(api_url, json=payload)
            response.raise_for_status()  
            
            if response.status_code == 200 or response.status_code == 201:
                dispatcher.utter_message(
                    text=f"Thank you! {quantity} units of {selected_product} have been added to your cart."
                )
            else:
                dispatcher.utter_message(
                    text="Sorry, I couldn't add your product to the cart at this moment."
                )

        except requests.exceptions.RequestException as e:
            dispatcher.utter_message(text="Sorry, there was an error adding your product to the cart.")
            print(f"Error while storing cart data: {e}")

        return []
