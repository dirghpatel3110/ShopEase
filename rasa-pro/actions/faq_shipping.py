from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet, AllSlotsReset
from pymongo import MongoClient
import datetime

class ActionCheckFaqShipping(Action):
    def name(self):
        return "action_check_faq_shipping"

    def run(self, dispatcher, tracker, domain):
        order_id = tracker.get_slot("orderId")

        if not order_id:
            dispatcher.utter_message(
                text="I need your order ID to check the shipping or delivery date."
            )
            return []

        client = MongoClient("mongodb://localhost:27017/")
        db = client["shopease"]
        orders_collection = db["transactions"]

        order = orders_collection.find_one({"orderId": order_id})
        
        if order:
            order_status = order.get("orderStatus", "unknown").lower()
            delivery_date = order.get("orderDeliveryDate", None)

            if isinstance(delivery_date, datetime.datetime):
                delivery_date = delivery_date.strftime("%Y-%m-%d")

            if order_status == "delivered":
                dispatcher.utter_message(
                    text=f"Your order {order_id} was delivered on {delivery_date}."
                )
                return [SlotSet("status", f"Delivered on {delivery_date}")]
            
            elif order_status == "pending":
                dispatcher.utter_message(
                    text=f"Your order {order_id} is pending and has not been shipped yet."
                )
                return [SlotSet("status", "Pending")]
            
            else:
                shipping_date = order.get("orderDeliveryDate", None)
                if isinstance(shipping_date, datetime.datetime):
                    shipping_date = shipping_date.strftime("%Y-%m-%d")

                dispatcher.utter_message(
                    text=f"The shipping date of your order {order_id} is {shipping_date}."
                )
                return [SlotSet("status", f"Shipping date: {shipping_date}")]
        
        else:
            dispatcher.utter_message(
                text="I couldn't find an order with that ID. Please check and try again."
            )
            return [SlotSet("status", None)]


class ActionClearAllSlots(Action):
    def name(self):
        return "action_clear_all_slots"

    def run(self, dispatcher: CollectingDispatcher, tracker, domain):
        dispatcher.utter_message(text="All slots have been cleared.")
        
        return [AllSlotsReset()]