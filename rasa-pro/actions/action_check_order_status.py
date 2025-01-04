from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
from pymongo import MongoClient
from rasa_sdk.forms import FormValidationAction
import re
import requests


class ActionCheckOrderStatus(Action):
    def name(self):
        return "action_check_order_status"

    def run(self, dispatcher, tracker, domain):
        # Get orderId from tracker
        order_id = tracker.get_slot("orderId")

        # Validate input
        if not order_id:
            dispatcher.utter_message(
                text="I need your order ID to check your order status."
            )
            return []

        # Connect to MongoDB (replace with your connection details)
        client = MongoClient("mongodb://localhost:27017/")
        db = client["shopease"]
        orders_collection = db["transactions"]

        # Fetch order status from MongoDB
        order = orders_collection.find_one({"orderId": order_id})
        
        if order:
            # Fetch 'orderStatus' field from MongoDB
            order_status = order.get("orderStatus", "unknown")  # Default to 'unknown' if missing
            dispatcher.utter_message(
                text=f"The status of your order {order_id} is {order_status}."
            )
            return [SlotSet("status", order_status)]
        else:
            dispatcher.utter_message(
                text="I couldn't find an order with that ID. Please check and try again."
            )
            return [SlotSet("status", None)]
        

class ActionOrderCancellation(Action):
    def name(self):
        return "action_cancel_booking"
    
    def run(self, dispatcher: CollectingDispatcher, tracker, domain):
        # Base URL for the API
        base_url = "http://localhost:5001/api/auth/transactions"
        
        # Retrieve the order ID from the slot
        order_id = tracker.get_slot('orderId')
        
        if not order_id:
            dispatcher.utter_message(text="No order number provided. Please provide a valid order number.")
            return []
        
        # Construct the URL for deleting the order
        delete_url = f"{base_url}/{order_id}"
        
        try:
            # Send a DELETE request to remove the order
            delete_response = requests.delete(delete_url)
            
            if delete_response.status_code == 200:
                # Order successfully deleted
                dispatcher.utter_message(text="Your Product has been cancelled successfully.")
            elif delete_response.status_code == 404:
                # Order does not exist
                dispatcher.utter_message(text="The provided order number does not exist in our system.")
            else:
                # Other errors (e.g., server error)
                dispatcher.utter_message(text="Failed to cancel your product. Please try again later.")
        
        except requests.exceptions.RequestException as e:
            # Handle any exceptions that occur during the request
            dispatcher.utter_message(text="An error occurred while processing your request. Please try again later.")
            print(f"Error: {e}")
        
        return []


class ValidateCheckOrderStatusForm(FormValidationAction):
    def name(self) -> str:
        return "validate_check_order_status_form"

    def validate_orderId(self, value, dispatcher, tracker, domain):
        # Use a regex pattern to validate order IDs like 'ORD-60855'
        if re.match(r"^[A-Za-z0-9\-]+$", value):  # Allows letters, digits, and hyphens
            return {"orderId": value}
        dispatcher.utter_message(text="The order ID must be alphanumeric and may include a hyphen.")
        return {"orderId": None}
