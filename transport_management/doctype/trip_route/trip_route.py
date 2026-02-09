# Copyright (c) 2021, Aakvatech Limited and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class TripRoute(Document):
    def validate(self):
        self.before_save()
        self.calculate_totals()
    
    def before_save(self):
        # Validate first and last location types
        if self.trip_steps:
            first_step = self.trip_steps[0]
            last_step = self.trip_steps[-1]
            
            if first_step.location_type and first_step.location_type.lower() != "loading point":
                frappe.throw("Set 1st location type to LOADING POINT")
            
            if last_step.location_type and last_step.location_type.lower() != "offloading point":
                frappe.throw("Set last location type to OFFLOADING POINT")
    
    def calculate_totals(self):
        # Calculate total distance
        total_distance = 0
        if hasattr(self, 'trip_steps') and self.trip_steps:
            for step in self.trip_steps:
                if step.distance:
                    total_distance += step.distance
            self.total_distance = total_distance
            
            # Calculate total fuel consumption (simplified logic)
            if total_distance > 0:
                self.total_fuel_consumption_qty = total_distance * 0.25  # Example: 0.25 liters per km
