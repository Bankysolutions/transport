// Copyright (c) 2016, Aakvatech Limited and contributors
// For license information, please see license.txt

frappe.ui.form.on('Vehicle Trip', {
setup: function (frm) {
frm.set_query('reference_docname', function () {
return {
filters: {
status: ['not in', ['Cancelled', 'Completed']],
},
};
});

$('.btn[data-fieldname="reduce_stock"]').css('background-color', '#5e64ff');
$('.btn[data-fieldname="reduce_stock"]').css('color', 'white');
},
refresh: function (frm) {
frm.add_custom_button(__('Vehicle Inspection'), function () {
frappe.model.open_mapped_doc({
method: 'transport_management.transport_management.doctype.vehicle_trip.vehicle_trip.make_vehicle_inspection',
frm: frm,
});
});
if (frm.doc.status == 'Open' && !frm.doc.__islocal) {
frm.add_custom_button(__('Assign Vehicle'), function () {
frappe.call({
method: 'transport_management.transport_management.doctype.transportation_order.transportation_order.create_vehicle_trip',
args: {
reference_doctype: frm.doc.reference_doctype,
reference_docname: frm.doc.reference_docname,
transporter: frm.doc.transporter_type,
customer: frm.doc.customer,
vehicle: frm.doc.vehicle,
trip_route: frm.doc.main_route,
driver: frm.doc.driver,
cargo: frm.doc.main_cargo,
},
});
});
}
if (frm.doc.main_fuel_request) {
for (let i in frm.doc.main_fuel_request) {
let row = frm.doc.main_fuel_request[i];
if (row.status == 'Requested') {
// frm.add_custom_button(__('Approve Fuel Request'), function () {
// cur_frm.call({
// method: "transport_management.transport_management.doctype.requested_payments.requested_payments.request_funds",
// args: {
// reference_doctype: cur_frm.doc.doctype,
// reference_docname: cur_frm.doc.name,
// customer: cur_frm.doc.customer,
// vehicle_no: cur_frm.doc.vehicle_plate_number,
// driver: cur_frm.doc.driver,
// trip_route: cur_frm.doc.main_route,
// }
// })
// }, "Fuel Request")
}
}
}
frm.set_query('stock_out_entry', function () {
return {
filters: {
docstatus: 1,
},
};
});
if (!frm.doc.stock_out_entry) {
frm.add_custom_button(
__('Reduce Stock'),
function () {
frappe.call({
method: 'transport_management.transport_management.doctype.vehicle_trip.vehicle_trip.create_stock_out_entry',
args: {
doc: JSON.stringify(frm.doc),
fuel_stock_out: frm.doc.fuel_stock_out,
},
});
},
__('Create')
);
}

frm.add_custom_button(
__('Create Purchase Order'),
function () {
frm.events.create_purchase_order(frm);
},
__('Create')
);

frm.add_custom_button(
__('Create Fund JL'),
function () {
frm.events.create_fund_jl(frm);
},
__('Create')
);
},
create_fund_jl: function (frm) {
if (frm.doc.main_requested_funds.length > 0) {
frm.doc.main_requested_funds.forEach((row) => {
if (row.request_status == 'Approved' && !row.journal_entry) {
frappe.call({
method: 'transport_management.transport_management.doctype.vehicle_trip.vehicle_trip.create_fund_jl',
args: {
doc: JSON.stringify(frm.doc),
row: JSON.stringify(row),
},
});
}
});
}
},
create_purchase_order: function (frm) {
if (frm.doc.main_fuel_request.length > 0) {
frm.doc.main_fuel_request.forEach((row) => {
if (row.status == 'Approved' && !row.purchase_order) {
frappe.call({
method: 'transport_management.transport_management.doctype.vehicle_trip.vehicle_trip.create_purchase_order',
args: {
request_doc: JSON.stringify(frm.doc),
item: JSON.stringify(row),
},
});
}
});
}
},
});
