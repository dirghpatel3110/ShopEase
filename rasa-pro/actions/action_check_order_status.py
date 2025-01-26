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

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: dict):
        order_id = tracker.get_slot("orderId")

        if not order_id:
            dispatcher.utter_message(
                text="I need your order ID to check your order status."
            )
            return []

        try:
            client = MongoClient("mongodb://localhost:27017/")
            db = client["shopease"]
            orders_collection = db["transactions"]
            order = orders_collection.find_one({"orderId": order_id})

            if order:
                order_status = order.get("orderStatus", "unknown")  
                dispatcher.utter_message(
                    text=f"The status of your order {order_id} is {order_status}."
                )
                return [SlotSet("status", order_status)]
            else:
                dispatcher.utter_message(
                    text="I couldn't find an order with that ID. Please check and try again."
                )
                return [SlotSet("status", None)]

        except Exception as e:
            dispatcher.utter_message(
                text="An error occurred while checking your order status. Please try again later."
            )
            print(f"Error while fetching order status: {e}")
            return [SlotSet("status", None)]

class ActionOrderCancellation(Action):
    def name(self):
        return "action_cancel_booking"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: dict):
        base_url = "http://localhost:5001/api/auth/transactions"
        order_id = tracker.get_slot("orderId")

        if not order_id:
            dispatcher.utter_message(
                text="No order number provided. Please provide a valid order number."
            )
            return []

        delete_url = f"{base_url}/{order_id}"

        try:
            delete_response = requests.delete(delete_url)

            if delete_response.status_code == 200:
                dispatcher.utter_message(
                    text=f"Your product with Order ID {order_id} has been cancelled successfully."
                )
            elif delete_response.status_code == 404:
                dispatcher.utter_message(
                    text="The provided order number does not exist in our system."
                )
            else:
                dispatcher.utter_message(
                    text="Failed to cancel your product. Please try again later."
                )

        except requests.exceptions.RequestException as e:
            dispatcher.utter_message(
                text="An error occurred while processing your request. Please try again later."
            )
            print(f"Error while cancelling the product: {e}")

        return []

class ValidateCheckOrderStatusForm(FormValidationAction):
    def name(self) -> str:
        return "validate_check_order_status_form"

    def validate_orderId(self, value: str, dispatcher: CollectingDispatcher, tracker: Tracker, domain: dict):
        """
        Validate the `orderId` slot value using a regex pattern.
        """
        if re.match(r"^ORD-\d+$", value):  
            return {"orderId": value}
        
        dispatcher.utter_message(
            text="The Order ID must be in the format 'ORD-' followed by numbers (e.g., ORD-12345)."
        )
        return {"orderId": None}
