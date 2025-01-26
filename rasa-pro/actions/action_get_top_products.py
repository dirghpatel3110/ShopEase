# from typing import Any, Text, Dict, List
# import requests
# from rasa_sdk import Action, Tracker
# from rasa_sdk.executor import CollectingDispatcher

# class ActionGetTopProducts(Action):
#     def name(self) -> Text:
#         return "action_get_top_products"

#     def run(
#         self,
#         dispatcher: CollectingDispatcher,
#         tracker: Tracker,
#         domain: Dict[Text, Any]
#     ) -> List[Dict[Text, Any]]:
#         # Retrieve the productName slot value
#         product_name = tracker.get_slot("productName")

#         # Define the API endpoint
#         api_url = "http://localhost:5001/api/auth/search"

#         try:
#             # Make the API request with productName as a query parameter
#             response = requests.get(api_url, params={"query": product_name})
#             response.raise_for_status()  # Raise an error for bad HTTP status codes
            
#             # Parse the JSON response and extract the results array
#             results = response.json().get("results", [])[:5]  # Limit to top 5 products
            
#             if results:
#                 # Format the product details into a readable list
#                 product_list = "\n".join(
#                     [
#                         f"{i+1}. {product['name']} - ${product['price']}\n   {product['description']}"
#                         for i, product in enumerate(results)
#                     ]
#                 )
#                 dispatcher.utter_message(text=f"Here are the top 5 products:\n{product_list}")
#             else:
#                 dispatcher.utter_message(text="Sorry, I couldn't find any products matching your query.")

#         except requests.exceptions.RequestException as e:
#             # Handle API request errors
#             dispatcher.utter_message(text="Sorry, I couldn't fetch the top products at the moment.")
#             print(f"Error while fetching products: {e}")

#         return []



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
        # Retrieve the productName slot value
        product_name = tracker.get_slot("productName")

        # Define the API endpoint
        api_url = "http://localhost:5001/api/auth/search"

        try:
            # Make the API request with productName as a query parameter
            response = requests.get(api_url, params={"query": product_name})
            response.raise_for_status()  # Raise an error for bad HTTP status codes
            
            # Parse the JSON response and extract the results array
            results = response.json().get("results", [])[:5]  # Limit to top 5 products
            
            if results:
                # Format the product details into a readable list
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
            # Handle API request errors
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
        # Retrieve slots for selectedProduct and quantity
        selected_product = tracker.get_slot("selectedProduct")
        quantity = tracker.get_slot("quantity")

        # Define the API endpoint for storing in MongoDB
        api_url = "http://localhost:5001/api/auth/cart"

        try:
            # Prepare payload for POST request
            payload = {
                "product_name": selected_product,
                "quantity": int(quantity) if quantity.isdigit() else quantity,
            }

            # Make POST request to store data in MongoDB
            response = requests.post(api_url, json=payload)
            response.raise_for_status()  # Raise an error for bad HTTP status codes
            
            if response.status_code == 200 or response.status_code == 201:
                dispatcher.utter_message(
                    text=f"Thank you! {quantity} units of {selected_product} have been added to your cart."
                )
            else:
                dispatcher.utter_message(
                    text="Sorry, I couldn't add your product to the cart at this moment."
                )

        except requests.exceptions.RequestException as e:
            # Handle API request errors
            dispatcher.utter_message(text="Sorry, there was an error adding your product to the cart.")
            print(f"Error while storing cart data: {e}")

        return []
