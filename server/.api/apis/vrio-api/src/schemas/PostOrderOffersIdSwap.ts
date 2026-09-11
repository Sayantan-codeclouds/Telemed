const PostOrderOffersIdSwap = {
  "body": {
    "type": "object",
    "properties": {
      "swap_offer_id": {
        "type": "integer",
        "description": "The new offer ID to swap the order offer to."
      },
      "item_id": {
        "type": "integer",
        "description": "The new item ID. Required when swapping to a shared offer."
      },
      "order_offer_item_options": {
        "type": "array",
        "description": "When an offer is configured with an item has options, or variants, determine which options should be applied. Each option will have a subset option value. Example: size is an option, Small - Medium - Large is the option value. Required for items that have options.",
        "items": {
          "title": "ItemOption",
          "type": "object",
          "description": "When an Item has options, or variants, determine which options should be applied. Each option will have a subset option value. Example: size is an option, Small - Medium - Large is the option value.",
          "properties": {
            "item_option_id": {
              "type": "integer",
              "description": "The option to be applied to the item."
            },
            "item_option_value_id": {
              "type": "integer",
              "description": "The value to be used for the item option ID passed."
            }
          },
          "required": [
            "item_option_id",
            "item_option_value_id"
          ]
        }
      },
      "order_offer_notes": {
        "type": "string",
        "description": "Apply note to the history of this order offer."
      }
    },
    "required": [
      "swap_offer_id"
    ],
    "$schema": "http://json-schema.org/draft-04/schema#"
  },
  "metadata": {
    "allOf": [
      {
        "$schema": "http://json-schema.org/draft-04/schema#",
        "type": "object",
        "properties": {
          "order_offer_id": {
            "type": "integer"
          }
        },
        "required": [
          "order_offer_id"
        ]
      }
    ]
  },
  "response": {
    "200": {
      "title": "Order Offer",
      "type": "object",
      "properties": {
        "order_offer_id": {
          "type": "integer"
        },
        "connection_order_offer_id": {
          "type": [
            "string",
            "null"
          ]
        },
        "status_type_id": {
          "type": [
            "integer",
            "null"
          ],
          "title": "Status types",
          "enum": [
            null,
            1,
            2,
            3,
            4,
            5,
            6,
            7,
            8,
            9,
            10
          ],
          "description": "* `1` - Active\n* `2` - Cancelled\n* `3` - Complete\n* `4` - Partial\n* `5` - Declined\n* `6` - Archive\n* `7` - Rejected\n* `8` - Removed\n* `9` - Paused\n* `10` - Expired\n\n`null` `1` `2` `3` `4` `5` `6` `7` `8` `9` `10`"
        },
        "linked_status_type_id": {
          "type": [
            "integer",
            "null"
          ],
          "title": "Status types",
          "enum": [
            null,
            1,
            2,
            3,
            4,
            5,
            6,
            7,
            8,
            9,
            10
          ],
          "description": "* `1` - Active\n* `2` - Cancelled\n* `3` - Complete\n* `4` - Partial\n* `5` - Declined\n* `6` - Archive\n* `7` - Rejected\n* `8` - Removed\n* `9` - Paused\n* `10` - Expired\n\n`null` `1` `2` `3` `4` `5` `6` `7` `8` `9` `10`"
        },
        "date_cancel": {
          "type": [
            "string",
            "null"
          ],
          "format": "date-time",
          "examples": [
            "2023-04-01 00:00:00"
          ]
        },
        "date_created": {
          "type": [
            "string",
            "null"
          ],
          "format": "date-time",
          "examples": [
            "2023-04-01 00:00:00"
          ]
        },
        "date_modified": {
          "type": [
            "string",
            "null"
          ],
          "format": "date-time",
          "examples": [
            "2023-04-01 00:00:00"
          ]
        },
        "date_ordered": {
          "type": [
            "string",
            "null"
          ],
          "format": "date-time",
          "examples": [
            "2023-04-01 00:00:00"
          ]
        },
        "date_reactivate": {
          "type": [
            "string",
            "null"
          ],
          "format": "date-time",
          "examples": [
            "2023-04-01 00:00:00"
          ]
        },
        "date_pause": {
          "type": [
            "string",
            "null"
          ],
          "format": "date-time",
          "examples": [
            "2023-04-01 00:00:00"
          ]
        },
        "date_unpause": {
          "type": [
            "string",
            "null"
          ],
          "format": "date-time",
          "examples": [
            "2023-04-01 00:00:00"
          ]
        },
        "is_gift": {
          "type": "boolean"
        },
        "is_recurring": {
          "type": "boolean"
        },
        "is_test": {
          "type": "boolean"
        },
        "offer_id": {
          "type": "integer"
        },
        "offer_name": {
          "type": "string"
        },
        "order_id": {
          "type": "integer"
        },
        "order_offer_price": {
          "type": "string",
          "pattern": "^\\d*(\\.\\d{0,2})?$",
          "default": "0.00"
        },
        "order_offer_quantity": {
          "type": "integer"
        },
        "cancel_type_id": {
          "type": [
            "integer",
            "null"
          ]
        },
        "cancel_by": {
          "type": [
            "integer",
            "null"
          ]
        },
        "discount_id": {
          "type": [
            "integer",
            "null"
          ]
        },
        "order_offer_upsell": {
          "type": "boolean"
        },
        "parent_order_offer_id": {
          "type": [
            "integer",
            "null"
          ]
        },
        "charge_timeframe_id": {
          "type": [
            "integer",
            "null"
          ]
        },
        "charge_timeframe_name": {
          "type": [
            "string",
            "null"
          ]
        },
        "offer_cycle_multiple_shipments_count": {
          "type": "integer"
        },
        "fulfillment_delay_timeframe_id": {
          "type": [
            "integer",
            "null"
          ]
        },
        "total_shipments_count": {
          "type": "integer"
        },
        "shipped_shipments_count": {
          "type": "integer"
        },
        "current_shipment_prepaid_cycle": {
          "type": [
            "integer",
            "null"
          ]
        },
        "current_shipment_id": {
          "type": [
            "integer",
            "null"
          ]
        },
        "connection_status_type_name": {
          "type": "string"
        },
        "last_recurring_date": {
          "type": [
            "string",
            "null"
          ],
          "format": "date-time",
          "examples": [
            "2023-04-01 00:00:00"
          ]
        },
        "last_recurring_amount": {
          "type": "string",
          "pattern": "^\\d*(\\.\\d{0,2})?$",
          "default": "0.00"
        },
        "next_recurring_date": {
          "type": [
            "string",
            "null"
          ],
          "format": "date-time",
          "examples": [
            "2023-04-01 00:00:00"
          ]
        },
        "next_recurring_amount": {
          "type": "string",
          "pattern": "^\\d*(\\.\\d{0,2})?$",
          "default": "0.00"
        },
        "next_recurring_price": {
          "type": "string",
          "pattern": "^\\d*(\\.\\d{0,2})?$",
          "default": "0.00"
        },
        "next_recurring_charge": {
          "type": [
            "integer",
            "null"
          ]
        },
        "next_recurring_last_four": {
          "type": [
            "string",
            "null"
          ]
        },
        "extra_fields": {
          "type": [
            "string",
            "null"
          ]
        },
        "order_offer_notes": {
          "type": [
            "string",
            "null"
          ]
        },
        "order_offer_shipments": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "shipment_id": {
                "type": "integer"
              },
              "connection_shipment_id": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "customer_id": {
                "type": "integer"
              },
              "order_id": {
                "type": "integer"
              },
              "shipment_prepaid_cycle": {
                "type": "integer"
              },
              "shipment_status_id": {
                "type": "integer",
                "title": "Shipment Status",
                "enum": [
                  1,
                  2,
                  3,
                  4,
                  5,
                  6,
                  7,
                  8,
                  9
                ],
                "description": "* `1` - Pending Post\n* `2` - Pending Tracking\n* `3` - Cancelled\n* `4` - Shipped\n* `5` - Error\n* `6` - Delivered\n* `7` - Declined\n* `8` - Pending Transaction\n* `9` - Skipped\t\n\n`1` `2` `3` `4` `5` `6` `7` `8` `9`"
              },
              "transaction_charge_id": {
                "type": "integer"
              },
              "connection_id": {
                "type": [
                  "integer",
                  "null"
                ]
              },
              "fulfillment_id": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "shipment_tracking_id": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "carrier_id": {
                "type": [
                  "integer",
                  "null"
                ],
                "title": "Carriers",
                "enum": [
                  null,
                  1,
                  2,
                  3,
                  4,
                  5,
                  6,
                  8,
                  9
                ],
                "description": "* `1` - USPS\n* `2` - UPS\n* `3` - FedEx\n* `4` - DHL eCommerce\n* `5` - UPS Mail Innovations\n* `6` - Canada Post\n* `8` - Australia Post\n* `9` - Hermes\n\n`null` `1` `2` `3` `4` `5` `6` `8` `9`"
              },
              "shipping_profile_id": {
                "type": [
                  "integer",
                  "null"
                ]
              },
              "date_cancel": {
                "type": [
                  "string",
                  "null"
                ],
                "format": "date-time",
                "examples": [
                  "2023-04-01 00:00:00"
                ]
              },
              "date_scheduled": {
                "type": "string",
                "format": "date-time",
                "examples": [
                  "2023-04-01 00:00:00"
                ]
              },
              "date_complete": {
                "type": [
                  "string",
                  "null"
                ],
                "format": "date-time",
                "examples": [
                  "2023-04-01 00:00:00"
                ]
              },
              "date_scan": {
                "type": [
                  "string",
                  "null"
                ],
                "format": "date-time",
                "examples": [
                  "2023-04-01 00:00:00"
                ]
              },
              "date_deliver": {
                "type": [
                  "string",
                  "null"
                ],
                "format": "date-time",
                "examples": [
                  "2023-04-01 00:00:00"
                ]
              },
              "date_return": {
                "type": [
                  "string",
                  "null"
                ],
                "format": "date-time",
                "examples": [
                  "2023-04-01 00:00:00"
                ]
              },
              "date_skip": {
                "type": [
                  "string",
                  "null"
                ],
                "format": "date-time",
                "examples": [
                  "2023-04-01 00:00:00"
                ]
              },
              "date_rma": {
                "type": [
                  "string",
                  "null"
                ],
                "format": "date-time",
                "examples": [
                  "2023-04-01 00:00:00"
                ]
              },
              "shipment_rma": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "cancel_type_id": {
                "type": [
                  "integer",
                  "null"
                ]
              },
              "skip_type_id": {
                "type": [
                  "integer",
                  "null"
                ]
              },
              "shipping_reship_type_id": {
                "type": [
                  "integer",
                  "null"
                ],
                "title": "Shipping reship types",
                "enum": [
                  null,
                  1,
                  2,
                  3,
                  4
                ],
                "description": "* `1` - Did not receive package\n* `2` - Damaged Items\n* `3` - Items Incorrect\n* `4` - Quantity Incorrect\n\n`null` `1` `2` `3` `4`"
              },
              "shipment_parent_type_id": {
                "type": [
                  "integer",
                  "null"
                ],
                "title": "Shipment parent types",
                "enum": [
                  null,
                  1,
                  2,
                  3,
                  4
                ],
                "description": "* `1` - Reship\n* `2` - Reward\n* `3` - Gift\n* `4` - Free\n\n`null` `1` `2` `3` `4`"
              },
              "date_created": {
                "type": "string",
                "format": "date-time",
                "examples": [
                  "2023-04-01 00:00:00"
                ]
              },
              "created_by": {
                "type": "integer"
              },
              "date_modified": {
                "type": "string",
                "format": "date-time",
                "examples": [
                  "2023-04-01 00:00:00"
                ]
              },
              "modified_by": {
                "type": "integer"
              },
              "shipment_notes": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "connection_request_text": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "connection_response_text": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "shipment_items": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "shipment_item_id": {
                      "type": "integer"
                    },
                    "quantity": {
                      "type": "integer"
                    },
                    "item_id": {
                      "type": "integer"
                    },
                    "item_name": {
                      "type": "string"
                    },
                    "item_description": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "item_additional_description": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "item_image": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "shipment_item_sku": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "items_option_variation_id": {
                      "type": [
                        "integer",
                        "null"
                      ]
                    }
                  }
                }
              },
              "customer_address_billing": {
                "type": "object",
                "properties": {
                  "customer_address_id": {
                    "type": "integer"
                  },
                  "fname": {
                    "type": "string"
                  },
                  "lname": {
                    "type": "string"
                  },
                  "organization": {
                    "type": "string"
                  },
                  "address1": {
                    "type": "string"
                  },
                  "address2": {
                    "type": "string"
                  },
                  "city": {
                    "type": "string"
                  },
                  "country": {
                    "type": "string"
                  },
                  "state": {
                    "type": "string"
                  },
                  "zipcode": {
                    "type": "string"
                  },
                  "address_valid": {
                    "type": "boolean"
                  },
                  "date_created": {
                    "type": "string",
                    "format": "date-time",
                    "examples": [
                      "2023-04-01 00:00:00"
                    ]
                  },
                  "date_modified": {
                    "type": "string",
                    "format": "date-time",
                    "examples": [
                      "2023-04-01 00:00:00"
                    ]
                  },
                  "created_by": {
                    "type": "integer"
                  },
                  "modified_by": {
                    "type": "integer"
                  }
                }
              },
              "customer_address_shipping": {
                "type": "object",
                "properties": {
                  "customer_address_id": {
                    "type": "integer"
                  },
                  "fname": {
                    "type": "string"
                  },
                  "lname": {
                    "type": "string"
                  },
                  "organization": {
                    "type": "string"
                  },
                  "address1": {
                    "type": "string"
                  },
                  "address2": {
                    "type": "string"
                  },
                  "city": {
                    "type": "string"
                  },
                  "country": {
                    "type": "string"
                  },
                  "state": {
                    "type": "string"
                  },
                  "zipcode": {
                    "type": "string"
                  },
                  "address_valid": {
                    "type": "boolean"
                  },
                  "date_created": {
                    "type": "string",
                    "format": "date-time",
                    "examples": [
                      "2023-04-01 00:00:00"
                    ]
                  },
                  "date_modified": {
                    "type": "string",
                    "format": "date-time",
                    "examples": [
                      "2023-04-01 00:00:00"
                    ]
                  },
                  "created_by": {
                    "type": "integer"
                  },
                  "modified_by": {
                    "type": "integer"
                  }
                }
              },
              "campaign": {
                "title": "campaign_simple",
                "type": "object",
                "properties": {
                  "campaign_id": {
                    "type": "integer"
                  },
                  "campaign_name": {
                    "type": "string"
                  }
                }
              },
              "connection": {
                "title": "connection",
                "type": [
                  "object",
                  "null"
                ],
                "properties": {
                  "connection_id": {
                    "type": "integer"
                  },
                  "connection_name": {
                    "type": "string"
                  }
                }
              },
              "tracking_history": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "tracking_history_id": {
                      "type": "integer"
                    },
                    "carrier_id": {
                      "type": [
                        "integer",
                        "null"
                      ]
                    },
                    "date": {
                      "type": [
                        "string",
                        "null"
                      ],
                      "format": "date-time",
                      "examples": [
                        "2023-04-01 00:00:00"
                      ]
                    },
                    "category_id": {
                      "type": [
                        "integer",
                        "null"
                      ]
                    },
                    "category_name": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "status_id": {
                      "type": [
                        "integer",
                        "null"
                      ]
                    },
                    "status_text": {
                      "type": [
                        "string",
                        "null"
                      ]
                    }
                  }
                }
              },
              "actions": {
                "type": "object",
                "properties": {
                  "can_change_address": {
                    "type": "boolean"
                  },
                  "can_process": {
                    "type": "boolean"
                  },
                  "can_reschedule": {
                    "type": "boolean"
                  },
                  "can_rma": {
                    "type": "boolean"
                  },
                  "can_skip": {
                    "type": "boolean"
                  },
                  "can_swap": {
                    "type": "boolean"
                  },
                  "can_unskip": {
                    "type": "boolean"
                  }
                }
              }
            }
          }
        },
        "order_offer_items": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "item_id": {
                "type": "integer"
              },
              "item_name": {
                "type": "string"
              },
              "item_category_id": {
                "type": [
                  "integer",
                  "null"
                ]
              },
              "item_description": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "item_image": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "item_active": {
                "type": "boolean"
              },
              "item_price": {
                "type": [
                  "string",
                  "null"
                ],
                "pattern": "^\\d*(\\.\\d{0,2})?$",
                "default": "0.00"
              },
              "item_msrp": {
                "type": [
                  "string",
                  "null"
                ],
                "pattern": "^\\d*(\\.\\d{0,2})?$",
                "default": "0.00"
              },
              "item_cost": {
                "type": [
                  "string",
                  "null"
                ],
                "pattern": "^\\d*(\\.\\d{0,2})?$",
                "default": "0.00"
              },
              "item_shippable": {
                "type": "boolean"
              },
              "item_sku": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "item_weight": {
                "type": [
                  "string",
                  "null"
                ],
                "pattern": "^\\d*(\\.\\d{0,2})?$",
                "default": "0.00"
              },
              "item_upc": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "item_slug": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "item_quantity": {
                "type": "integer"
              },
              "connection_id": {
                "type": [
                  "integer",
                  "null"
                ]
              },
              "out_of_stock_block": {
                "type": "boolean"
              },
              "item_turnaround_time": {
                "type": "integer"
              },
              "item_additional_description": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "item_ingredients": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "item_video": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "item_sales_page": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "item_perishable": {
                "type": "boolean"
              },
              "item_tax_code": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "item_additional_details_1": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "item_additional_details_2": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "item_additional_details_3": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "item_additional_details_4": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "item_additional_details_5": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "date_created": {
                "type": "string",
                "format": "date-time",
                "examples": [
                  "2023-04-01 00:00:00"
                ]
              },
              "created_by": {
                "type": "integer"
              },
              "date_modified": {
                "type": "string",
                "format": "date-time",
                "examples": [
                  "2023-04-01 00:00:00"
                ]
              },
              "modified_by": {
                "type": "integer"
              },
              "item_notes": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "item_options": {
                "type": [
                  "array",
                  "null"
                ],
                "items": {
                  "title": "item_option",
                  "type": "object",
                  "properties": {
                    "item_option_id": {
                      "type": "integer"
                    },
                    "item_option_name": {
                      "type": "string"
                    },
                    "item_option_values": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "item_option_value_id": {
                            "type": "integer"
                          },
                          "item_option_value_name": {
                            "type": "string"
                          }
                        }
                      }
                    }
                  }
                }
              },
              "item_option_variations": {
                "type": [
                  "array",
                  "null"
                ],
                "items": {
                  "type": "object",
                  "properties": {
                    "items_option_variation_id": {
                      "type": "integer"
                    },
                    "items_option_variation_key": {
                      "type": "string"
                    },
                    "items_option_variation_name": {
                      "type": "string"
                    },
                    "items_option_variation_quantity": {
                      "type": "integer"
                    },
                    "items_option_variation_sku": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "items_option_variation_price": {
                      "type": "string",
                      "pattern": "^\\d*(\\.\\d{0,2})?$",
                      "default": "0.00"
                    },
                    "items_option_variation_msrp": {
                      "type": "string",
                      "pattern": "^\\d*(\\.\\d{0,2})?$",
                      "default": "0.00"
                    },
                    "items_option_variation_cost": {
                      "type": [
                        "string",
                        "null"
                      ],
                      "pattern": "^\\d*(\\.\\d{0,2})?$",
                      "default": "0.00"
                    },
                    "items_option_variation_weight": {
                      "type": [
                        "string",
                        "null"
                      ],
                      "pattern": "^\\d*(\\.\\d{0,2})?$",
                      "default": "0.00"
                    },
                    "items_option_variation_upc": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "items_option_variation_image": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "items_option_variation_images": {
                      "type": "array",
                      "items": {
                        "title": "image",
                        "type": "object",
                        "properties": {
                          "image_id": {
                            "type": "integer"
                          },
                          "image_url": {
                            "type": "string"
                          }
                        }
                      }
                    }
                  }
                }
              },
              "item_images": {
                "type": [
                  "array",
                  "null"
                ],
                "items": {
                  "title": "image",
                  "type": "object",
                  "properties": {
                    "image_id": {
                      "type": "integer"
                    },
                    "image_url": {
                      "type": "string"
                    }
                  }
                }
              },
              "item_tags": {
                "type": [
                  "array",
                  "null"
                ],
                "items": {
                  "title": "tag",
                  "type": "object",
                  "properties": {
                    "tag_id": {
                      "type": "integer"
                    },
                    "tag_name": {
                      "type": "string"
                    },
                    "tag_slug": {
                      "type": "string"
                    },
                    "tag_image": {
                      "type": [
                        "string",
                        "null"
                      ]
                    }
                  }
                }
              },
              "item_swap_options": {
                "type": [
                  "array",
                  "null"
                ],
                "items": {
                  "type": "object",
                  "properties": {
                    "swap_item_id": {
                      "type": "integer"
                    },
                    "swap_item_name": {
                      "type": "string"
                    },
                    "swap_item_image": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "swap_item_type_id": {
                      "type": "integer"
                    },
                    "swap_item_description": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "item_options": {
                      "type": "array",
                      "items": {
                        "title": "item_option",
                        "type": "object",
                        "properties": {
                          "item_option_id": {
                            "type": "integer"
                          },
                          "item_option_name": {
                            "type": "string"
                          },
                          "item_option_values": {
                            "type": "array",
                            "items": {
                              "type": "object",
                              "properties": {
                                "item_option_value_id": {
                                  "type": "integer"
                                },
                                "item_option_value_name": {
                                  "type": "string"
                                }
                              }
                            }
                          }
                        }
                      }
                    },
                    "item_option_variations": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "items_option_variation_id": {
                            "type": "integer"
                          },
                          "items_option_variation_key": {
                            "type": "string"
                          },
                          "items_option_variation_name": {
                            "type": "string"
                          },
                          "items_option_variation_quantity": {
                            "type": "integer"
                          },
                          "items_option_variation_sku": {
                            "type": [
                              "string",
                              "null"
                            ]
                          },
                          "items_option_variation_price": {
                            "type": "string",
                            "pattern": "^\\d*(\\.\\d{0,2})?$",
                            "default": "0.00"
                          },
                          "items_option_variation_msrp": {
                            "type": "string",
                            "pattern": "^\\d*(\\.\\d{0,2})?$",
                            "default": "0.00"
                          },
                          "items_option_variation_cost": {
                            "type": [
                              "string",
                              "null"
                            ],
                            "pattern": "^\\d*(\\.\\d{0,2})?$",
                            "default": "0.00"
                          },
                          "items_option_variation_weight": {
                            "type": [
                              "string",
                              "null"
                            ],
                            "pattern": "^\\d*(\\.\\d{0,2})?$",
                            "default": "0.00"
                          },
                          "items_option_variation_upc": {
                            "type": [
                              "string",
                              "null"
                            ]
                          },
                          "items_option_variation_image": {
                            "type": [
                              "string",
                              "null"
                            ]
                          },
                          "items_option_variation_images": {
                            "type": "array",
                            "items": {
                              "title": "image",
                              "type": "object",
                              "properties": {
                                "image_id": {
                                  "type": "integer"
                                },
                                "image_url": {
                                  "type": "string"
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              },
              "connection": {
                "title": "connection",
                "type": [
                  "object",
                  "null"
                ],
                "properties": {
                  "connection_id": {
                    "type": "integer"
                  },
                  "connection_name": {
                    "type": "string"
                  }
                }
              }
            }
          }
        },
        "discount": {
          "type": "object",
          "properties": {
            "discount_id": {
              "type": "integer"
            },
            "discount_name": {
              "type": "string"
            },
            "discount_type_id": {
              "type": "integer",
              "title": "Discount types",
              "enum": [
                1,
                2
              ],
              "description": "* `1` - One Time Code\n* `2` - Recurring Code\n\n`1` `2`"
            },
            "discount_application_type_id": {
              "type": "integer",
              "title": "Discount application types",
              "enum": [
                1,
                2
              ],
              "description": "* `1` - Offer Level\n* `2` - Cart Level\n\n`1` `2`"
            },
            "shipping_only": {
              "type": "boolean"
            },
            "discount_category_id": {
              "type": [
                "integer",
                "null"
              ]
            },
            "discount_code": {
              "type": "string"
            },
            "discount_description": {
              "type": [
                "string",
                "null"
              ]
            },
            "discount_active": {
              "type": "boolean"
            },
            "discount_expiration_date": {
              "type": [
                "string",
                "null"
              ],
              "format": "date-time",
              "examples": [
                "2023-04-01 00:00:00"
              ]
            },
            "discount_one_per_customer": {
              "type": "boolean"
            },
            "discount_notes": {
              "type": [
                "string",
                "null"
              ]
            },
            "discount_cycles": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "discount_cycle_id": {
                    "type": "integer"
                  },
                  "discount_cycle_weight": {
                    "type": "integer"
                  },
                  "discount_cycle_type_id": {
                    "type": "integer",
                    "title": "Discount cycle types",
                    "enum": [
                      1,
                      2
                    ],
                    "description": "* `1` - Percentage\n* `2` - Flat Rate\n\n`1` `2`"
                  },
                  "discount_cycle_percentage": {
                    "type": "integer"
                  },
                  "discount_cycle_flat_rate": {
                    "type": "string",
                    "pattern": "^\\d*(\\.\\d{0,2})?$",
                    "default": "0.00"
                  },
                  "discount_cycle_final": {
                    "type": "boolean"
                  },
                  "discount_cycle_active": {
                    "type": "boolean"
                  }
                }
              }
            },
            "discount_offers": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "offer_id": {
                    "type": "integer"
                  },
                  "offer_name": {
                    "type": "string"
                  },
                  "offer_title": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "offer_code": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "primary_offer_category_id": {
                    "type": [
                      "integer",
                      "null"
                    ]
                  },
                  "secondary_offer_category_id": {
                    "type": [
                      "integer",
                      "null"
                    ]
                  },
                  "offer_type_id": {
                    "type": "integer",
                    "title": "Offer types",
                    "enum": [
                      1,
                      2
                    ],
                    "description": "* `1` - One Time Sale\n* `2` - Recurring\n\n`1` `2`"
                  },
                  "offer_configuration": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "offer_price": {
                    "type": "string",
                    "pattern": "^\\d*(\\.\\d{0,2})?$",
                    "default": "0.00",
                    "description": "Returns the price for the initial cycle of the offer. If null, then the offer has multiple items associated with it, to get full pricing for the offer, pass “with=offer_cycles”"
                  },
                  "offer_description": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "offer_global": {
                    "type": "boolean"
                  },
                  "offer_url": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "initial_item_id": {
                    "type": [
                      "integer",
                      "null"
                    ]
                  },
                  "offer_notes": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "offer_active": {
                    "type": "boolean"
                  },
                  "date_created": {
                    "type": "string",
                    "format": "date-time",
                    "examples": [
                      "2023-04-01 00:00:00"
                    ]
                  },
                  "created_by": {
                    "type": "integer"
                  },
                  "date_modified": {
                    "type": "string",
                    "format": "date-time",
                    "examples": [
                      "2023-04-01 00:00:00"
                    ]
                  },
                  "modified_by": {
                    "type": "integer"
                  },
                  "initial_item_options": {
                    "type": "array",
                    "items": {
                      "title": "item_option",
                      "type": "object",
                      "properties": {
                        "item_option_id": {
                          "type": "integer"
                        },
                        "item_option_name": {
                          "type": "string"
                        },
                        "item_option_values": {
                          "type": "array",
                          "items": {
                            "type": "object",
                            "properties": {
                              "item_option_value_id": {
                                "type": "integer"
                              },
                              "item_option_value_name": {
                                "type": "string"
                              }
                            }
                          }
                        }
                      }
                    }
                  },
                  "offer_cycles": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "offer_cycle_id": {
                          "type": "integer"
                        },
                        "offer_cycle_weight": {
                          "type": "integer"
                        },
                        "offer_cycle_product_type_id": {
                          "type": "integer",
                          "title": "Offer cycle product types",
                          "enum": [
                            1,
                            2,
                            3,
                            4,
                            5,
                            6
                          ],
                          "description": "* `1` - Item Bundle\n* `2` - Item\n* `3` - Reward\n* `4` - Gift Card\n* `5` - Dynamic Item\n* `6` - Other (Used for Digital or Charge Only)\n\n`1` `2` `3` `4` `5` `6`"
                        },
                        "item_bundle_id": {
                          "type": [
                            "integer",
                            "null"
                          ]
                        },
                        "item_id": {
                          "type": [
                            "integer",
                            "null"
                          ]
                        },
                        "offer_cycle_price": {
                          "type": "string",
                          "pattern": "^\\d*(\\.\\d{0,2})?$",
                          "default": "0.00"
                        },
                        "offer_cycle_length": {
                          "type": [
                            "integer",
                            "null"
                          ]
                        },
                        "charge_timeframe_id": {
                          "type": [
                            "integer",
                            "null"
                          ]
                        },
                        "offer_cycle_trigger_type_id": {
                          "type": [
                            "integer",
                            "null"
                          ],
                          "title": "Offer cycle trigger types",
                          "enum": [
                            null,
                            1,
                            2
                          ],
                          "description": "* `1` - Time of Charge\n* `2` - Delivered Package\n\n`null` `1` `2`"
                        },
                        "offer_cycle_trigger_hour": {
                          "type": "integer"
                        },
                        "offer_cycle_multiple_shipments": {
                          "type": "boolean"
                        },
                        "offer_cycle_multiple_shipments_count": {
                          "type": "integer"
                        },
                        "offer_cycle_multiple_shipments_interval": {
                          "type": "integer"
                        },
                        "fulfillment_delay": {
                          "type": "integer"
                        },
                        "fulfillment_delay_timeframe_disable": {
                          "type": "boolean"
                        },
                        "offer_cycle_reward_type_id": {
                          "type": [
                            "integer",
                            "null"
                          ],
                          "title": "Offer cycle reward types",
                          "enum": [
                            null,
                            1,
                            2,
                            3
                          ],
                          "description": "* `1` - Flate Rate\n* `2` - Order Percentage\n* `3` - Flat Rate / Order Percentage\n\n`null` `1` `2` `3`"
                        },
                        "offer_cycle_reward_flat_rate": {
                          "type": "string",
                          "pattern": "^\\d*(\\.\\d{0,2})?$",
                          "default": "0.00"
                        },
                        "offer_cycle_reward_percentage": {
                          "type": "integer"
                        },
                        "offer_cycle_reward_expiration": {
                          "type": "integer"
                        },
                        "offer_cycle_gift_card_total": {
                          "type": "string",
                          "pattern": "^\\d*(\\.\\d{0,2})?$",
                          "default": "0.00"
                        },
                        "offer_cycle_gift_card_expiration": {
                          "type": "integer"
                        },
                        "offer_cycle_final": {
                          "type": "boolean"
                        },
                        "offer_cycle_active": {
                          "type": "boolean"
                        },
                        "quantity_discount_id": {
                          "type": [
                            "integer",
                            "null"
                          ]
                        },
                        "offer_cycle_price_minimum": {
                          "type": "string",
                          "pattern": "^\\d*(\\.\\d{0,2})?$",
                          "default": "0.00"
                        },
                        "discount_calculation_total": {
                          "type": "boolean"
                        },
                        "offer_cycle_shipping_price": {
                          "type": "string",
                          "pattern": "^\\d*(\\.\\d{0,2})?$",
                          "default": "0.00"
                        },
                        "offer_cycle_shipment_skippable": {
                          "type": "boolean"
                        },
                        "charge_responder_id_bypass": {
                          "type": "boolean"
                        },
                        "offer_cycle_deliver_extend_value": {
                          "type": "integer"
                        },
                        "offer_cycle_skippable": {
                          "type": "boolean"
                        },
                        "offer_cycle_trial": {
                          "type": "boolean"
                        },
                        "offer_cycle_auth_next_charge": {
                          "type": "boolean"
                        },
                        "date_created": {
                          "type": "string",
                          "format": "date-time",
                          "examples": [
                            "2023-04-01 00:00:00"
                          ]
                        },
                        "created_by": {
                          "type": "integer"
                        },
                        "date_modified": {
                          "type": "string",
                          "format": "date-time",
                          "examples": [
                            "2023-04-01 00:00:00"
                          ]
                        },
                        "modified_by": {
                          "type": "integer"
                        },
                        "offer_cycle_items": {
                          "type": "array",
                          "items": {
                            "title": "Item",
                            "type": "object",
                            "properties": {
                              "item_id": {
                                "type": "integer"
                              },
                              "item_name": {
                                "type": "string"
                              },
                              "item_category_id": {
                                "type": [
                                  "integer",
                                  "null"
                                ]
                              },
                              "item_description": {
                                "type": [
                                  "string",
                                  "null"
                                ]
                              },
                              "item_image": {
                                "type": [
                                  "string",
                                  "null"
                                ]
                              },
                              "item_active": {
                                "type": "boolean"
                              },
                              "item_price": {
                                "type": [
                                  "string",
                                  "null"
                                ],
                                "pattern": "^\\d*(\\.\\d{0,2})?$",
                                "default": "0.00"
                              },
                              "item_msrp": {
                                "type": [
                                  "string",
                                  "null"
                                ],
                                "pattern": "^\\d*(\\.\\d{0,2})?$",
                                "default": "0.00"
                              },
                              "item_cost": {
                                "type": [
                                  "string",
                                  "null"
                                ],
                                "pattern": "^\\d*(\\.\\d{0,2})?$",
                                "default": "0.00"
                              },
                              "item_shippable": {
                                "type": "boolean"
                              },
                              "item_sku": {
                                "type": [
                                  "string",
                                  "null"
                                ]
                              },
                              "item_weight": {
                                "type": [
                                  "string",
                                  "null"
                                ],
                                "pattern": "^\\d*(\\.\\d{0,2})?$",
                                "default": "0.00"
                              },
                              "item_upc": {
                                "type": [
                                  "string",
                                  "null"
                                ]
                              },
                              "item_slug": {
                                "type": [
                                  "string",
                                  "null"
                                ]
                              },
                              "item_quantity": {
                                "type": "integer"
                              },
                              "connection_id": {
                                "type": [
                                  "integer",
                                  "null"
                                ]
                              },
                              "out_of_stock_block": {
                                "type": "boolean"
                              },
                              "item_turnaround_time": {
                                "type": "integer"
                              },
                              "item_additional_description": {
                                "type": [
                                  "string",
                                  "null"
                                ]
                              },
                              "item_ingredients": {
                                "type": [
                                  "string",
                                  "null"
                                ]
                              },
                              "item_video": {
                                "type": [
                                  "string",
                                  "null"
                                ]
                              },
                              "item_sales_page": {
                                "type": [
                                  "string",
                                  "null"
                                ]
                              },
                              "item_perishable": {
                                "type": "boolean"
                              },
                              "item_tax_code": {
                                "type": [
                                  "string",
                                  "null"
                                ]
                              },
                              "item_additional_details_1": {
                                "type": [
                                  "string",
                                  "null"
                                ]
                              },
                              "item_additional_details_2": {
                                "type": [
                                  "string",
                                  "null"
                                ]
                              },
                              "item_additional_details_3": {
                                "type": [
                                  "string",
                                  "null"
                                ]
                              },
                              "item_additional_details_4": {
                                "type": [
                                  "string",
                                  "null"
                                ]
                              },
                              "item_additional_details_5": {
                                "type": [
                                  "string",
                                  "null"
                                ]
                              },
                              "date_created": {
                                "type": "string",
                                "format": "date-time",
                                "examples": [
                                  "2023-04-01 00:00:00"
                                ]
                              },
                              "created_by": {
                                "type": "integer"
                              },
                              "date_modified": {
                                "type": "string",
                                "format": "date-time",
                                "examples": [
                                  "2023-04-01 00:00:00"
                                ]
                              },
                              "modified_by": {
                                "type": "integer"
                              },
                              "item_notes": {
                                "type": [
                                  "string",
                                  "null"
                                ]
                              },
                              "offer_cycle_item_variation_prices": {
                                "type": "array",
                                "items": {
                                  "type": "object",
                                  "properties": {
                                    "items_option_variation_id": {
                                      "type": "integer"
                                    },
                                    "items_option_variation_name": {
                                      "type": "string"
                                    },
                                    "items_option_variation_sku": {
                                      "type": [
                                        "string",
                                        "null"
                                      ]
                                    },
                                    "price": {
                                      "type": [
                                        "string",
                                        "null"
                                      ],
                                      "pattern": "^\\d*(\\.\\d{0,2})?$"
                                    }
                                  }
                                }
                              }
                            }
                          }
                        },
                        "quantity_discount_configs": {
                          "type": "array",
                          "items": {
                            "type": "object",
                            "properties": {
                              "quantity_discount_cycle_id": {
                                "type": "integer"
                              },
                              "quantity_discount_cycle_type_id": {
                                "type": "integer",
                                "title": "Quantity Discount Cycles types",
                                "enum": [
                                  1,
                                  2
                                ],
                                "description": "* `1` - Percentage\n* `2` - Flat Rate\n\n`1` `2`"
                              },
                              "quantity_discount_cycle_weight": {
                                "type": "integer"
                              },
                              "quantity_discount_cycle_percentage": {
                                "type": [
                                  "string",
                                  "null"
                                ],
                                "pattern": "^\\d*(\\.\\d{0,2})?$",
                                "default": "0.00"
                              },
                              "quantity_discount_cycle_flat_rate": {
                                "type": [
                                  "string",
                                  "null"
                                ],
                                "pattern": "^\\d*(\\.\\d{0,2})?$",
                                "default": "0.00"
                              },
                              "quantity_discount_cycle_name": {
                                "type": [
                                  "string",
                                  "null"
                                ]
                              },
                              "quantity_discount_cycle_active": {
                                "type": "boolean"
                              }
                            }
                          }
                        },
                        "charge_timeframe": {
                          "type": [
                            "object",
                            "null"
                          ],
                          "properties": {
                            "timeframe_id": {
                              "type": "integer"
                            },
                            "timeframe_name": {
                              "type": "string"
                            },
                            "timeframe_frequency": {
                              "type": "boolean"
                            },
                            "date_created": {
                              "type": [
                                "string",
                                "null"
                              ],
                              "format": "date-time",
                              "examples": [
                                "2023-04-01 00:00:00"
                              ]
                            },
                            "created_by": {
                              "type": [
                                "integer",
                                "null"
                              ]
                            },
                            "date_modified": {
                              "type": [
                                "string",
                                "null"
                              ],
                              "format": "date-time",
                              "examples": [
                                "2023-04-01 00:00:00"
                              ]
                            },
                            "modified_by": {
                              "type": [
                                "integer",
                                "null"
                              ]
                            }
                          }
                        }
                      }
                    }
                  },
                  "offer_timeframes": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "timeframe_id": {
                          "type": "integer"
                        },
                        "timeframe_name": {
                          "type": "string"
                        },
                        "timeframe_frequency": {
                          "type": "boolean"
                        },
                        "date_created": {
                          "type": [
                            "string",
                            "null"
                          ],
                          "format": "date-time",
                          "examples": [
                            "2023-04-01 00:00:00"
                          ]
                        },
                        "created_by": {
                          "type": [
                            "integer",
                            "null"
                          ]
                        },
                        "date_modified": {
                          "type": [
                            "string",
                            "null"
                          ],
                          "format": "date-time",
                          "examples": [
                            "2023-04-01 00:00:00"
                          ]
                        },
                        "modified_by": {
                          "type": [
                            "integer",
                            "null"
                          ]
                        }
                      }
                    }
                  },
                  "primary_offer_category": {
                    "title": "offer category",
                    "type": [
                      "object",
                      "null"
                    ],
                    "properties": {
                      "offer_category_id": {
                        "type": "integer"
                      },
                      "offer_category_name": {
                        "type": "string"
                      }
                    }
                  },
                  "secondary_offer_category": {
                    "title": "offer category",
                    "type": [
                      "object",
                      "null"
                    ],
                    "properties": {
                      "offer_category_id": {
                        "type": "integer"
                      },
                      "offer_category_name": {
                        "type": "string"
                      }
                    }
                  },
                  "offer_swap_options": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "swap_offer_id": {
                          "type": "integer"
                        },
                        "swap_offer_type_id": {
                          "type": "integer",
                          "title": "Swap offer types",
                          "enum": [
                            1,
                            2,
                            3
                          ],
                          "description": "* `1` - In Cart Only\n* `2` - Ongoing Subscription\n* `3` - Both\n\n`1` `2` `3`"
                        },
                        "swap_offer_description": {
                          "type": [
                            "string",
                            "null"
                          ]
                        },
                        "created_by": {
                          "type": "integer"
                        },
                        "modified_by": {
                          "type": "integer"
                        },
                        "date_created": {
                          "type": "string",
                          "format": "date-time",
                          "examples": [
                            "2023-04-01 00:00:00"
                          ]
                        },
                        "date_modified": {
                          "type": "string",
                          "format": "date-time",
                          "examples": [
                            "2023-04-01 00:00:00"
                          ]
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "order_offer_next_transactions": {
          "type": "array",
          "items": {
            "title": "Transaction",
            "type": "object",
            "description": "",
            "properties": {
              "transaction_id": {
                "type": "integer"
              },
              "connection_transaction_id": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "customer_id": {
                "type": "integer"
              },
              "order_id": {
                "type": "integer"
              },
              "payment_method_id": {
                "type": "integer",
                "title": "Payment methods",
                "description": "* `1` - Credit Card\n* `2` - Check\n* `3` - Google Pay\n* `4` - Apple Pay\n* `5` - Cash\n* `6` - Paypal\n* `7` - Alternative Payments Sofort\n* `8` - Alternative Payments POLi\n* `9` - Alternative Payments SEPA\n* `10` - ACH\n* `11` - Afterpay\n* `12` - Klarna\n* `13` - SEPA\n\n`1` `2` `3` `4` `5` `6` `7` `8` `9` `10` `11` `12` `13`",
                "enum": [
                  1,
                  2,
                  3,
                  4,
                  5,
                  6,
                  7,
                  8,
                  9,
                  10,
                  11,
                  12,
                  13
                ]
              },
              "transaction_type_id": {
                "type": "integer",
                "title": "Transaction types",
                "enum": [
                  1,
                  2,
                  3,
                  4,
                  5,
                  6,
                  7,
                  8,
                  9,
                  10
                ],
                "description": "* `1` - Sale\n* `2` - Refund\n* `3` - Void\n* `4` - Chargeback\n* `5` - Alert\n* `6` - Auth\n* `7` - Capture\n* `8` - COD\n* `9` - Chargeback Reversal\n* `10` - Returned Check\n\n`1` `2` `3` `4` `5` `6` `7` `8` `9` `10`"
              },
              "transaction_cycle": {
                "type": "integer"
              },
              "transaction_attempt": {
                "type": "integer"
              },
              "transaction_declined": {
                "type": "boolean"
              },
              "merchant_id": {
                "type": "integer"
              },
              "transaction_merchant_descriptor": {
                "type": "string"
              },
              "response_code": {
                "type": [
                  "integer",
                  "null"
                ]
              },
              "transaction_3ds_verified_status": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "gateway_response_id": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "gateway_auth_code": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "gateway_response_code": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "gateway_response_description": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "gateway_response_avs": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "gateway_response_cvv": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "processor_response_text": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "currency_id": {
                "type": "integer"
              },
              "transaction_price": {
                "type": "string",
                "pattern": "^\\d*(\\.\\d{0,2})?$",
                "default": "0.00"
              },
              "transaction_discount_total": {
                "type": "string",
                "pattern": "^\\d*(\\.\\d{0,2})?$",
                "default": "0.00"
              },
              "transaction_shipping": {
                "type": "string",
                "pattern": "^\\d*(\\.\\d{0,2})?$",
                "default": "0.00"
              },
              "transaction_sub_total": {
                "type": "string",
                "pattern": "^\\d*(\\.\\d{0,2})?$",
                "default": "0.00"
              },
              "transaction_tax": {
                "type": "string",
                "pattern": "^\\d*(\\.\\d{0,2})?$",
                "default": "0.00"
              },
              "transaction_fee": {
                "type": "string",
                "pattern": "^\\d*(\\.\\d{0,2})?$",
                "default": "0.00"
              },
              "customer_balance_applied": {
                "type": "string",
                "pattern": "^\\d*(\\.\\d{0,2})?$",
                "default": "0.00"
              },
              "gift_card_applied": {
                "type": "string",
                "pattern": "^\\d*(\\.\\d{0,2})?$",
                "default": "0.00"
              },
              "transaction_total": {
                "type": "string",
                "pattern": "^\\d*(\\.\\d{0,2})?$",
                "default": "0.00"
              },
              "order_discount_total": {
                "type": "string",
                "pattern": "^\\d*(\\.\\d{0,2})?$",
                "default": "0.00"
              },
              "check_number": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "check_amount": {
                "type": "string",
                "pattern": "^\\d*(\\.\\d{0,2})?$",
                "default": "0.00"
              },
              "dunning_cycle_id": {
                "type": [
                  "integer",
                  "null"
                ]
              },
              "dunning_cycle_total": {
                "type": "string",
                "pattern": "^\\d*(\\.\\d{0,2})?$",
                "default": "0.00"
              },
              "quantity_discount_cycle_id": {
                "type": [
                  "integer",
                  "null"
                ]
              },
              "quantity_discount_cycle_total": {
                "type": "string",
                "pattern": "^\\d*(\\.\\d{0,2})?$",
                "default": "0.00"
              },
              "discount_cycle_id": {
                "type": [
                  "integer",
                  "null"
                ]
              },
              "discount_cycle_total": {
                "type": "string",
                "pattern": "^\\d*(\\.\\d{0,2})?$",
                "default": "0.00"
              },
              "date_scheduled": {
                "type": "string",
                "format": "date-time",
                "examples": [
                  "2023-04-01 00:00:00"
                ]
              },
              "date_complete": {
                "type": [
                  "string",
                  "null"
                ],
                "format": "date-time",
                "examples": [
                  "2023-04-01 00:00:00"
                ]
              },
              "date_cancelled": {
                "type": [
                  "string",
                  "null"
                ],
                "format": "date-time",
                "examples": [
                  "2023-04-01 00:00:00"
                ]
              },
              "date_skip": {
                "type": [
                  "string",
                  "null"
                ],
                "format": "date-time",
                "examples": [
                  "2023-04-01 00:00:00"
                ]
              },
              "date_batch": {
                "type": [
                  "string",
                  "null"
                ],
                "format": "date-time",
                "examples": [
                  "2023-04-01 00:00:00"
                ]
              },
              "date_deposit": {
                "type": [
                  "string",
                  "null"
                ],
                "format": "date-time",
                "examples": [
                  "2023-04-01 00:00:00"
                ]
              },
              "date_request": {
                "type": [
                  "string",
                  "null"
                ],
                "format": "date-time",
                "examples": [
                  "2023-04-01 00:00:00"
                ]
              },
              "date_response": {
                "type": [
                  "string",
                  "null"
                ],
                "format": "date-time",
                "examples": [
                  "2023-04-01 00:00:00"
                ]
              },
              "rebill_date": {
                "type": [
                  "string",
                  "null"
                ],
                "format": "date-time",
                "examples": [
                  "2023-04-01 00:00:00"
                ]
              },
              "original_attempt_date": {
                "type": [
                  "string",
                  "null"
                ],
                "format": "date-time",
                "examples": [
                  "2023-04-01 00:00:00"
                ]
              },
              "transaction_parent_id": {
                "type": [
                  "integer",
                  "null"
                ]
              },
              "parent_date_complete": {
                "type": [
                  "string",
                  "null"
                ],
                "format": "date-time",
                "examples": [
                  "2023-04-01 00:00:00"
                ]
              },
              "transaction_initial_id": {
                "type": [
                  "integer",
                  "null"
                ]
              },
              "is_prepaid": {
                "type": "boolean"
              },
              "customer_card_type_id": {
                "title": "Card Types",
                "enum": [
                  null,
                  1,
                  2,
                  3,
                  4,
                  5,
                  6,
                  7
                ],
                "description": "* `1` - Mastercard\n* `2` - Visa\n* `3` - Discover\n* `4` - American Express\n* `5` - Digital Wallet\n* `6` - ACH\n* `7` - SEPA\n\n`null` `1` `2` `3` `4` `5` `6` `7`",
                "type": [
                  "integer",
                  "null"
                ]
              },
              "customer_card_bin": {
                "type": "string"
              },
              "chargeback_date": {
                "type": [
                  "string",
                  "null"
                ],
                "format": "date-time",
                "examples": [
                  "2023-04-01 00:00:00"
                ]
              },
              "chargeback_code": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "chargeback_reference_id": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "chargeback_case_id": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "transaction_total_usd": {
                "type": "string",
                "pattern": "^\\d*(\\.\\d{0,2})?$",
                "default": "0.00"
              },
              "transaction_shipping_usd": {
                "type": "string",
                "pattern": "^\\d*(\\.\\d{0,2})?$",
                "default": "0.00"
              },
              "transaction_tax_usd": {
                "type": "string",
                "pattern": "^\\d*(\\.\\d{0,2})?$",
                "default": "0.00"
              },
              "transaction_price_usd": {
                "type": "string",
                "pattern": "^\\d*(\\.\\d{0,2})?$",
                "default": "0.00"
              },
              "transaction_discount_total_usd": {
                "type": "string",
                "pattern": "^\\d*(\\.\\d{0,2})?$",
                "default": "0.00"
              },
              "customer_balance_applied_usd": {
                "type": "string",
                "pattern": "^\\d*(\\.\\d{0,2})?$",
                "default": "0.00"
              },
              "transaction_fee_usd": {
                "type": "string",
                "pattern": "^\\d*(\\.\\d{0,2})?$",
                "default": "0.00"
              },
              "gift_card_applied_usd": {
                "type": "string",
                "pattern": "^\\d*(\\.\\d{0,2})?$",
                "default": "0.00"
              },
              "date_created": {
                "type": "string",
                "format": "date-time",
                "examples": [
                  "2023-04-01 00:00:00"
                ]
              },
              "created_by": {
                "type": "integer"
              },
              "modified_by": {
                "type": "integer"
              },
              "date_modified": {
                "type": "string",
                "format": "date-time",
                "examples": [
                  "2023-04-01 00:00:00"
                ]
              },
              "transaction_notes": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "order": {
                "title": "Order simple",
                "type": "object",
                "properties": {
                  "order_id": {
                    "type": "integer"
                  },
                  "connection_order_id": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "campaign_id": {
                    "type": "integer"
                  },
                  "status_type_id": {
                    "type": [
                      "integer",
                      "null"
                    ],
                    "title": "Status types",
                    "enum": [
                      null,
                      1,
                      2,
                      3,
                      4,
                      5,
                      6,
                      7,
                      8,
                      9,
                      10
                    ],
                    "description": "* `1` - Active\n* `2` - Cancelled\n* `3` - Complete\n* `4` - Partial\n* `5` - Declined\n* `6` - Archive\n* `7` - Rejected\n* `8` - Removed\n* `9` - Paused\n* `10` - Expired\n\n`null` `1` `2` `3` `4` `5` `6` `7` `8` `9` `10`"
                  },
                  "customer_card_id": {
                    "type": [
                      "integer",
                      "null"
                    ]
                  },
                  "customer_id": {
                    "type": "integer"
                  },
                  "customers_address_billing_id": {
                    "type": [
                      "integer",
                      "null"
                    ]
                  },
                  "customers_address_shipping_id": {
                    "type": [
                      "integer",
                      "null"
                    ]
                  },
                  "shipping_profile_id": {
                    "type": [
                      "integer",
                      "null"
                    ]
                  },
                  "date_created": {
                    "type": [
                      "string",
                      "null"
                    ],
                    "format": "date-time",
                    "examples": [
                      "2023-04-01 00:00:00"
                    ]
                  },
                  "date_modified": {
                    "type": [
                      "string",
                      "null"
                    ],
                    "format": "date-time",
                    "examples": [
                      "2023-04-01 00:00:00"
                    ]
                  },
                  "date_authorized": {
                    "type": [
                      "string",
                      "null"
                    ],
                    "format": "date-time",
                    "examples": [
                      "2023-04-01 00:00:00"
                    ]
                  },
                  "date_auto_capture": {
                    "type": [
                      "string",
                      "null"
                    ],
                    "format": "date-time",
                    "examples": [
                      "2023-04-01 00:00:00"
                    ]
                  },
                  "date_ordered": {
                    "type": [
                      "string",
                      "null"
                    ],
                    "format": "date-time",
                    "examples": [
                      "2023-04-01 00:00:00"
                    ]
                  },
                  "date_capture": {
                    "type": [
                      "string",
                      "null"
                    ],
                    "format": "date-time",
                    "examples": [
                      "2023-04-01 00:00:00"
                    ]
                  },
                  "is_test": {
                    "type": "boolean"
                  },
                  "ip_address": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "order_discount": {
                    "type": "string",
                    "pattern": "^\\d*(\\.\\d{0,2})?$",
                    "default": "0.00"
                  },
                  "order_pixel": {
                    "type": "boolean"
                  },
                  "cart_token": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "order_pixel_block": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "order_notes": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "created_by": {
                    "type": "integer"
                  },
                  "modified_by": {
                    "type": "integer"
                  },
                  "tracking1": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "tracking2": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "tracking3": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "tracking4": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "tracking5": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "tracking6": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "tracking7": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "tracking8": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "tracking9": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "tracking10": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "tracking11": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "tracking12": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "tracking13": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "tracking14": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "tracking15": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "tracking16": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "tracking17": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "tracking18": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "tracking19": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "tracking20": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "user_agent": {
                    "type": [
                      "string",
                      "null"
                    ]
                  }
                }
              },
              "order_revisions": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "order_revision_id": {
                      "type": "integer"
                    },
                    "orders_revision_type_id": {
                      "type": [
                        "integer",
                        "null"
                      ]
                    },
                    "order_revision_value": {
                      "type": "string",
                      "pattern": "^\\d*(\\.\\d{0,2})?$",
                      "default": "0.00"
                    },
                    "order_notes": {
                      "type": "string"
                    },
                    "modified_by": {
                      "type": "integer"
                    },
                    "date_modified": {
                      "type": "string",
                      "format": "date-time",
                      "examples": [
                        "2023-04-01 00:00:00"
                      ]
                    }
                  }
                }
              },
              "customer": {
                "type": "object",
                "properties": {
                  "customer_id": {
                    "type": "integer"
                  },
                  "connection_customer_id": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "connection_id": {
                    "type": "integer"
                  },
                  "first_name": {
                    "type": "string"
                  },
                  "last_name": {
                    "type": "string"
                  },
                  "email": {
                    "type": "string"
                  },
                  "ip_address": {
                    "type": "string"
                  },
                  "phone": {
                    "type": "string"
                  },
                  "birthday": {
                    "type": [
                      "string",
                      "null"
                    ],
                    "format": "date"
                  },
                  "gender": {
                    "type": "string"
                  },
                  "pronoun_id": {
                    "type": [
                      "integer",
                      "null"
                    ],
                    "title": "Pronouns",
                    "enum": [
                      null,
                      1,
                      2,
                      3,
                      4
                    ],
                    "description": "* `1` - he/him\n* `2` - she/her\n* `3` - they/them\n* `4` - rather not say\n\n`null` `1` `2` `3` `4`"
                  },
                  "active_subscriber": {
                    "type": "boolean"
                  },
                  "is_blacklist": {
                    "type": "boolean"
                  },
                  "is_fraud": {
                    "type": "boolean"
                  },
                  "date_created": {
                    "type": "string",
                    "format": "date-time",
                    "examples": [
                      "2023-04-01 00:00:00"
                    ]
                  },
                  "date_modified": {
                    "type": "string",
                    "format": "date-time",
                    "examples": [
                      "2023-04-01 00:00:00"
                    ]
                  },
                  "created_by": {
                    "type": "integer"
                  },
                  "modified_by": {
                    "type": "integer"
                  },
                  "customer_notes": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "tracking1": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "tracking2": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "tracking3": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "tracking4": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "tracking5": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "tracking6": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "tracking7": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "tracking8": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "tracking9": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "tracking10": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "tracking11": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "tracking12": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "tracking13": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "tracking14": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "tracking15": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "tracking16": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "tracking17": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "tracking18": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "tracking19": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "tracking20": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "customer_cards": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "customer_card_id": {
                          "type": "integer"
                        },
                        "card_type_id": {
                          "title": "Card Types",
                          "enum": [
                            null,
                            1,
                            2,
                            3,
                            4,
                            5,
                            6,
                            7
                          ],
                          "description": "* `1` - Mastercard\n* `2` - Visa\n* `3` - Discover\n* `4` - American Express\n* `5` - Digital Wallet\n* `6` - ACH\n* `7` - SEPA\n\n`null` `1` `2` `3` `4` `5` `6` `7`",
                          "type": [
                            "integer",
                            "null"
                          ]
                        },
                        "card_number": {
                          "type": "string"
                        },
                        "card_exp_month": {
                          "type": "integer"
                        },
                        "card_exp_year": {
                          "type": "integer"
                        },
                        "card_prepaid": {
                          "type": "boolean"
                        },
                        "date_created": {
                          "type": "string",
                          "format": "date-time",
                          "examples": [
                            "2023-04-01 00:00:00"
                          ]
                        },
                        "date_modified": {
                          "type": "string",
                          "format": "date-time",
                          "examples": [
                            "2023-04-01 00:00:00"
                          ]
                        },
                        "created_by": {
                          "type": "integer"
                        },
                        "modified_by": {
                          "type": "integer"
                        }
                      }
                    }
                  },
                  "customer_addresses": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "customer_address_id": {
                          "type": "integer"
                        },
                        "fname": {
                          "type": "string"
                        },
                        "lname": {
                          "type": "string"
                        },
                        "organization": {
                          "type": "string"
                        },
                        "address1": {
                          "type": "string"
                        },
                        "address2": {
                          "type": "string"
                        },
                        "city": {
                          "type": "string"
                        },
                        "country": {
                          "type": "string"
                        },
                        "state": {
                          "type": "string"
                        },
                        "zipcode": {
                          "type": "string"
                        },
                        "address_valid": {
                          "type": "boolean"
                        },
                        "date_created": {
                          "type": "string",
                          "format": "date-time",
                          "examples": [
                            "2023-04-01 00:00:00"
                          ]
                        },
                        "date_modified": {
                          "type": "string",
                          "format": "date-time",
                          "examples": [
                            "2023-04-01 00:00:00"
                          ]
                        },
                        "created_by": {
                          "type": "integer"
                        },
                        "modified_by": {
                          "type": "integer"
                        }
                      }
                    }
                  }
                }
              },
              "customer_card": {
                "type": "object",
                "properties": {
                  "customer_card_id": {
                    "type": "integer"
                  },
                  "card_type_id": {
                    "title": "Card Types",
                    "enum": [
                      null,
                      1,
                      2,
                      3,
                      4,
                      5,
                      6,
                      7
                    ],
                    "description": "* `1` - Mastercard\n* `2` - Visa\n* `3` - Discover\n* `4` - American Express\n* `5` - Digital Wallet\n* `6` - ACH\n* `7` - SEPA\n\n`null` `1` `2` `3` `4` `5` `6` `7`",
                    "type": [
                      "integer",
                      "null"
                    ]
                  },
                  "card_number": {
                    "type": "string"
                  },
                  "card_exp_month": {
                    "type": "integer"
                  },
                  "card_exp_year": {
                    "type": "integer"
                  },
                  "card_prepaid": {
                    "type": "boolean"
                  },
                  "customer_card_merchant_token": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "date_created": {
                    "type": "string",
                    "format": "date-time",
                    "examples": [
                      "2023-04-01 00:00:00"
                    ]
                  },
                  "date_modified": {
                    "type": "string",
                    "format": "date-time",
                    "examples": [
                      "2023-04-01 00:00:00"
                    ]
                  },
                  "created_by": {
                    "type": "integer"
                  },
                  "modified_by": {
                    "type": "integer"
                  }
                }
              },
              "customer_address_billing": {
                "type": "object",
                "properties": {
                  "customer_address_id": {
                    "type": "integer"
                  },
                  "fname": {
                    "type": "string"
                  },
                  "lname": {
                    "type": "string"
                  },
                  "organization": {
                    "type": "string"
                  },
                  "address1": {
                    "type": "string"
                  },
                  "address2": {
                    "type": "string"
                  },
                  "city": {
                    "type": "string"
                  },
                  "country": {
                    "type": "string"
                  },
                  "state": {
                    "type": "string"
                  },
                  "zipcode": {
                    "type": "string"
                  },
                  "address_valid": {
                    "type": "boolean"
                  },
                  "date_created": {
                    "type": "string",
                    "format": "date-time",
                    "examples": [
                      "2023-04-01 00:00:00"
                    ]
                  },
                  "date_modified": {
                    "type": "string",
                    "format": "date-time",
                    "examples": [
                      "2023-04-01 00:00:00"
                    ]
                  },
                  "created_by": {
                    "type": "integer"
                  },
                  "modified_by": {
                    "type": "integer"
                  }
                }
              },
              "customer_address_shipping": {
                "type": "object",
                "properties": {
                  "customer_address_id": {
                    "type": "integer"
                  },
                  "fname": {
                    "type": "string"
                  },
                  "lname": {
                    "type": "string"
                  },
                  "organization": {
                    "type": "string"
                  },
                  "address1": {
                    "type": "string"
                  },
                  "address2": {
                    "type": "string"
                  },
                  "city": {
                    "type": "string"
                  },
                  "country": {
                    "type": "string"
                  },
                  "state": {
                    "type": "string"
                  },
                  "zipcode": {
                    "type": "string"
                  },
                  "address_valid": {
                    "type": "boolean"
                  },
                  "date_created": {
                    "type": "string",
                    "format": "date-time",
                    "examples": [
                      "2023-04-01 00:00:00"
                    ]
                  },
                  "date_modified": {
                    "type": "string",
                    "format": "date-time",
                    "examples": [
                      "2023-04-01 00:00:00"
                    ]
                  },
                  "created_by": {
                    "type": "integer"
                  },
                  "modified_by": {
                    "type": "integer"
                  }
                }
              },
              "merchant": {
                "type": "object",
                "properties": {
                  "merchant_id": {
                    "type": "integer"
                  },
                  "merchant_name": {
                    "type": "string"
                  },
                  "gateway_id": {
                    "type": "integer"
                  },
                  "currency_id": {
                    "type": "integer",
                    "description": "Default currency"
                  },
                  "merchant_mid_id": {
                    "type": "string"
                  },
                  "merchant_descriptor": {
                    "type": "string"
                  },
                  "merchant_phone": {
                    "type": "string"
                  },
                  "merchant_url": {
                    "type": "string"
                  },
                  "merchant_active": {
                    "type": "boolean"
                  },
                  "merchant_processor": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "merchant_mcc_code": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "merchant_processing_limit": {
                    "type": "string",
                    "pattern": "^\\d*(\\.\\d{0,2})?$",
                    "default": "0.00"
                  },
                  "merchant_processing_inforce": {
                    "type": "boolean"
                  },
                  "merchant_daily_rebills_limit": {
                    "type": "string",
                    "pattern": "^\\d*(\\.\\d{0,2})?$",
                    "default": "0.00"
                  },
                  "merchant_state": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "merchant_tax": {
                    "type": "string",
                    "pattern": "^\\d*(\\.\\d{0,2})?$",
                    "default": "0.00"
                  },
                  "merchant_mtd_revenue": {
                    "type": "string",
                    "pattern": "^\\d*(\\.\\d{0,2})?$",
                    "default": "0.00"
                  },
                  "merchant_mtd_transactions": {
                    "type": "integer"
                  },
                  "merchant_mtd_initial": {
                    "type": "integer"
                  },
                  "merchant_processing_perc": {
                    "type": "string",
                    "pattern": "^\\d*(\\.\\d{0,2})?$",
                    "default": "0.00"
                  },
                  "primary_merchant_category_id": {
                    "type": "integer"
                  },
                  "secondary_merchant_category_id": {
                    "type": "integer"
                  },
                  "merchant_notes": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "date_created": {
                    "type": "string",
                    "format": "date-time",
                    "examples": [
                      "2023-04-01 00:00:00"
                    ]
                  },
                  "created_by": {
                    "type": "integer"
                  },
                  "date_modified": {
                    "type": "string",
                    "format": "date-time",
                    "examples": [
                      "2023-04-01 00:00:00"
                    ]
                  },
                  "modified_by": {
                    "type": "integer"
                  },
                  "merchant_currencies": {
                    "type": "array",
                    "items": {
                      "title": "currency",
                      "type": "object",
                      "properties": {
                        "currency_id": {
                          "type": "integer"
                        },
                        "currency_value": {
                          "type": "string"
                        }
                      }
                    }
                  },
                  "merchant_payment_methods": {
                    "type": "array",
                    "items": {
                      "title": "Payment method",
                      "type": "object",
                      "properties": {
                        "payment_method_id": {
                          "type": "integer"
                        },
                        "payment_method_name": {
                          "type": "string"
                        }
                      }
                    }
                  },
                  "merchant_card_types": {
                    "type": "array",
                    "items": {
                      "title": "Card Type",
                      "type": "object",
                      "properties": {
                        "card_type_id": {
                          "type": "integer"
                        },
                        "card_type_name": {
                          "type": "string"
                        }
                      }
                    }
                  },
                  "primary_merchant_category": {
                    "title": "Merchant category",
                    "type": [
                      "object",
                      "null"
                    ],
                    "properties": {
                      "merchant_category_id": {
                        "type": "integer"
                      },
                      "merchant_category_name": {
                        "type": "string"
                      }
                    }
                  },
                  "secondary_merchant_category": {
                    "title": "Merchant category",
                    "type": [
                      "object",
                      "null"
                    ],
                    "properties": {
                      "merchant_category_id": {
                        "type": "integer"
                      },
                      "merchant_category_name": {
                        "type": "string"
                      }
                    }
                  }
                }
              },
              "campaign": {
                "title": "campaign_simple",
                "type": "object",
                "properties": {
                  "campaign_id": {
                    "type": "integer"
                  },
                  "campaign_name": {
                    "type": "string"
                  }
                }
              },
              "sale": {
                "title": "Sale",
                "type": "object",
                "properties": {
                  "sale_id": {
                    "type": "integer"
                  },
                  "order_id": {
                    "type": "integer"
                  },
                  "customer_id": {
                    "type": "integer"
                  },
                  "customer_name": {
                    "type": "string"
                  },
                  "status": {
                    "type": "string"
                  },
                  "cycle": {
                    "type": "integer"
                  },
                  "currency_id": {
                    "type": "integer"
                  },
                  "price": {
                    "type": "string",
                    "pattern": "^\\d*(\\.\\d{0,2})?$",
                    "default": "0.00"
                  },
                  "discount_total": {
                    "type": "string",
                    "pattern": "^\\d*(\\.\\d{0,2})?$",
                    "default": "0.00"
                  },
                  "shipping": {
                    "type": "string",
                    "pattern": "^\\d*(\\.\\d{0,2})?$",
                    "default": "0.00"
                  },
                  "sub_total": {
                    "type": "string",
                    "pattern": "^\\d*(\\.\\d{0,2})?$",
                    "default": "0.00"
                  },
                  "tax": {
                    "type": "string",
                    "pattern": "^\\d*(\\.\\d{0,2})?$",
                    "default": "0.00"
                  },
                  "gift_card_applied": {
                    "type": "string",
                    "pattern": "^\\d*(\\.\\d{0,2})?$",
                    "default": "0.00"
                  },
                  "total": {
                    "type": "string",
                    "pattern": "^\\d*(\\.\\d{0,2})?$",
                    "default": "0.00"
                  },
                  "date_sale": {
                    "type": [
                      "string",
                      "null"
                    ],
                    "format": "date-time",
                    "examples": [
                      "2023-04-01 00:00:00"
                    ]
                  },
                  "date_attempt": {
                    "type": [
                      "string",
                      "null"
                    ],
                    "format": "date-time",
                    "examples": [
                      "2023-04-01 00:00:00"
                    ]
                  }
                }
              },
              "credits": {
                "type": "array",
                "items": {
                  "type": "object",
                  "description": "",
                  "properties": {
                    "transaction_id": {
                      "type": "integer"
                    },
                    "connection_transaction_id": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "customer_id": {
                      "type": "integer"
                    },
                    "order_id": {
                      "type": "integer"
                    },
                    "payment_method_id": {
                      "type": "integer",
                      "title": "Payment methods",
                      "description": "* `1` - Credit Card\n* `2` - Check\n* `3` - Google Pay\n* `4` - Apple Pay\n* `5` - Cash\n* `6` - Paypal\n* `7` - Alternative Payments Sofort\n* `8` - Alternative Payments POLi\n* `9` - Alternative Payments SEPA\n* `10` - ACH\n* `11` - Afterpay\n* `12` - Klarna\n* `13` - SEPA\n\n`1` `2` `3` `4` `5` `6` `7` `8` `9` `10` `11` `12` `13`",
                      "enum": [
                        1,
                        2,
                        3,
                        4,
                        5,
                        6,
                        7,
                        8,
                        9,
                        10,
                        11,
                        12,
                        13
                      ]
                    },
                    "transaction_type_id": {
                      "type": "integer",
                      "title": "Transaction types",
                      "enum": [
                        1,
                        2,
                        3,
                        4,
                        5,
                        6,
                        7,
                        8,
                        9,
                        10
                      ],
                      "description": "* `1` - Sale\n* `2` - Refund\n* `3` - Void\n* `4` - Chargeback\n* `5` - Alert\n* `6` - Auth\n* `7` - Capture\n* `8` - COD\n* `9` - Chargeback Reversal\n* `10` - Returned Check\n\n`1` `2` `3` `4` `5` `6` `7` `8` `9` `10`"
                    },
                    "transaction_cycle": {
                      "type": "integer"
                    },
                    "transaction_attempt": {
                      "type": "integer"
                    },
                    "transaction_declined": {
                      "type": "boolean"
                    },
                    "merchant_id": {
                      "type": "integer"
                    },
                    "transaction_merchant_descriptor": {
                      "type": "string"
                    },
                    "response_code": {
                      "type": [
                        "integer",
                        "null"
                      ]
                    },
                    "transaction_3ds_verified_status": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "gateway_response_id": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "gateway_auth_code": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "gateway_response_code": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "gateway_response_description": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "gateway_response_avs": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "gateway_response_cvv": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "processor_response_text": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "currency_id": {
                      "type": "integer"
                    },
                    "transaction_price": {
                      "type": "string",
                      "pattern": "^\\d*(\\.\\d{0,2})?$",
                      "default": "0.00"
                    },
                    "transaction_discount_total": {
                      "type": "string",
                      "pattern": "^\\d*(\\.\\d{0,2})?$",
                      "default": "0.00"
                    },
                    "transaction_shipping": {
                      "type": "string",
                      "pattern": "^\\d*(\\.\\d{0,2})?$",
                      "default": "0.00"
                    },
                    "transaction_sub_total": {
                      "type": "string",
                      "pattern": "^\\d*(\\.\\d{0,2})?$",
                      "default": "0.00"
                    },
                    "transaction_tax": {
                      "type": "string",
                      "pattern": "^\\d*(\\.\\d{0,2})?$",
                      "default": "0.00"
                    },
                    "transaction_fee": {
                      "type": "string",
                      "pattern": "^\\d*(\\.\\d{0,2})?$",
                      "default": "0.00"
                    },
                    "customer_balance_applied": {
                      "type": "string",
                      "pattern": "^\\d*(\\.\\d{0,2})?$",
                      "default": "0.00"
                    },
                    "gift_card_applied": {
                      "type": "string",
                      "pattern": "^\\d*(\\.\\d{0,2})?$",
                      "default": "0.00"
                    },
                    "transaction_total": {
                      "type": "string",
                      "pattern": "^\\d*(\\.\\d{0,2})?$",
                      "default": "0.00"
                    },
                    "order_discount_total": {
                      "type": "string",
                      "pattern": "^\\d*(\\.\\d{0,2})?$",
                      "default": "0.00"
                    },
                    "check_number": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "check_amount": {
                      "type": "string",
                      "pattern": "^\\d*(\\.\\d{0,2})?$",
                      "default": "0.00"
                    },
                    "dunning_cycle_id": {
                      "type": [
                        "integer",
                        "null"
                      ]
                    },
                    "dunning_cycle_total": {
                      "type": "string",
                      "pattern": "^\\d*(\\.\\d{0,2})?$",
                      "default": "0.00"
                    },
                    "quantity_discount_cycle_id": {
                      "type": [
                        "integer",
                        "null"
                      ]
                    },
                    "quantity_discount_cycle_total": {
                      "type": "string",
                      "pattern": "^\\d*(\\.\\d{0,2})?$",
                      "default": "0.00"
                    },
                    "discount_cycle_id": {
                      "type": [
                        "integer",
                        "null"
                      ]
                    },
                    "discount_cycle_total": {
                      "type": "string",
                      "pattern": "^\\d*(\\.\\d{0,2})?$",
                      "default": "0.00"
                    },
                    "date_scheduled": {
                      "type": "string",
                      "format": "date-time",
                      "examples": [
                        "2023-04-01 00:00:00"
                      ]
                    },
                    "date_complete": {
                      "type": [
                        "string",
                        "null"
                      ],
                      "format": "date-time",
                      "examples": [
                        "2023-04-01 00:00:00"
                      ]
                    },
                    "date_cancelled": {
                      "type": [
                        "string",
                        "null"
                      ],
                      "format": "date-time",
                      "examples": [
                        "2023-04-01 00:00:00"
                      ]
                    },
                    "date_skip": {
                      "type": [
                        "string",
                        "null"
                      ],
                      "format": "date-time",
                      "examples": [
                        "2023-04-01 00:00:00"
                      ]
                    },
                    "date_batch": {
                      "type": [
                        "string",
                        "null"
                      ],
                      "format": "date-time",
                      "examples": [
                        "2023-04-01 00:00:00"
                      ]
                    },
                    "date_deposit": {
                      "type": [
                        "string",
                        "null"
                      ],
                      "format": "date-time",
                      "examples": [
                        "2023-04-01 00:00:00"
                      ]
                    },
                    "date_request": {
                      "type": [
                        "string",
                        "null"
                      ],
                      "format": "date-time",
                      "examples": [
                        "2023-04-01 00:00:00"
                      ]
                    },
                    "date_response": {
                      "type": [
                        "string",
                        "null"
                      ],
                      "format": "date-time",
                      "examples": [
                        "2023-04-01 00:00:00"
                      ]
                    },
                    "rebill_date": {
                      "type": [
                        "string",
                        "null"
                      ],
                      "format": "date-time",
                      "examples": [
                        "2023-04-01 00:00:00"
                      ]
                    },
                    "original_attempt_date": {
                      "type": [
                        "string",
                        "null"
                      ],
                      "format": "date-time",
                      "examples": [
                        "2023-04-01 00:00:00"
                      ]
                    },
                    "transaction_parent_id": {
                      "type": [
                        "integer",
                        "null"
                      ]
                    },
                    "parent_date_complete": {
                      "type": [
                        "string",
                        "null"
                      ],
                      "format": "date-time",
                      "examples": [
                        "2023-04-01 00:00:00"
                      ]
                    },
                    "transaction_initial_id": {
                      "type": [
                        "integer",
                        "null"
                      ]
                    },
                    "is_prepaid": {
                      "type": "boolean"
                    },
                    "customer_card_type_id": {
                      "title": "Card Types",
                      "enum": [
                        null,
                        1,
                        2,
                        3,
                        4,
                        5,
                        6,
                        7
                      ],
                      "description": "* `1` - Mastercard\n* `2` - Visa\n* `3` - Discover\n* `4` - American Express\n* `5` - Digital Wallet\n* `6` - ACH\n* `7` - SEPA\n\n`null` `1` `2` `3` `4` `5` `6` `7`",
                      "type": [
                        "integer",
                        "null"
                      ]
                    },
                    "customer_card_bin": {
                      "type": "string"
                    },
                    "chargeback_date": {
                      "type": [
                        "string",
                        "null"
                      ],
                      "format": "date-time",
                      "examples": [
                        "2023-04-01 00:00:00"
                      ]
                    },
                    "chargeback_code": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "chargeback_reference_id": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "chargeback_case_id": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "transaction_total_usd": {
                      "type": "string",
                      "pattern": "^\\d*(\\.\\d{0,2})?$",
                      "default": "0.00"
                    },
                    "transaction_shipping_usd": {
                      "type": "string",
                      "pattern": "^\\d*(\\.\\d{0,2})?$",
                      "default": "0.00"
                    },
                    "transaction_tax_usd": {
                      "type": "string",
                      "pattern": "^\\d*(\\.\\d{0,2})?$",
                      "default": "0.00"
                    },
                    "transaction_price_usd": {
                      "type": "string",
                      "pattern": "^\\d*(\\.\\d{0,2})?$",
                      "default": "0.00"
                    },
                    "transaction_discount_total_usd": {
                      "type": "string",
                      "pattern": "^\\d*(\\.\\d{0,2})?$",
                      "default": "0.00"
                    },
                    "customer_balance_applied_usd": {
                      "type": "string",
                      "pattern": "^\\d*(\\.\\d{0,2})?$",
                      "default": "0.00"
                    },
                    "transaction_fee_usd": {
                      "type": "string",
                      "pattern": "^\\d*(\\.\\d{0,2})?$",
                      "default": "0.00"
                    },
                    "gift_card_applied_usd": {
                      "type": "string",
                      "pattern": "^\\d*(\\.\\d{0,2})?$",
                      "default": "0.00"
                    },
                    "date_created": {
                      "type": "string",
                      "format": "date-time",
                      "examples": [
                        "2023-04-01 00:00:00"
                      ]
                    },
                    "created_by": {
                      "type": "integer"
                    },
                    "modified_by": {
                      "type": "integer"
                    },
                    "date_modified": {
                      "type": "string",
                      "format": "date-time",
                      "examples": [
                        "2023-04-01 00:00:00"
                      ]
                    },
                    "transaction_notes": {
                      "type": [
                        "string",
                        "null"
                      ]
                    }
                  }
                }
              },
              "line_items": {
                "type": "array",
                "items": {
                  "title": "Line Item",
                  "type": "object",
                  "properties": {
                    "line_item_id": {
                      "type": "integer"
                    },
                    "customer_id": {
                      "type": "integer"
                    },
                    "order_id": {
                      "type": "integer"
                    },
                    "order_offer_id": {
                      "type": "integer"
                    },
                    "offer_id": {
                      "type": "integer"
                    },
                    "offer_name": {
                      "type": "string"
                    },
                    "offer_quantity": {
                      "type": "integer"
                    },
                    "item_id": {
                      "type": "integer"
                    },
                    "item_name": {
                      "type": "string"
                    },
                    "item_quantity": {
                      "type": "integer"
                    },
                    "campaign_id": {
                      "type": "integer"
                    },
                    "campaign_name": {
                      "type": "string"
                    },
                    "transaction_status": {
                      "type": "string"
                    },
                    "line_item_cycle": {
                      "type": "integer"
                    },
                    "currency_id": {
                      "type": "integer"
                    },
                    "is_test": {
                      "type": "boolean"
                    },
                    "is_upsell": {
                      "type": "boolean"
                    },
                    "status_type_id": {
                      "type": [
                        "integer",
                        "null"
                      ],
                      "title": "Status types",
                      "enum": [
                        null,
                        1,
                        2,
                        3,
                        4,
                        5,
                        6,
                        7,
                        8,
                        9,
                        10
                      ],
                      "description": "* `1` - Active\n* `2` - Cancelled\n* `3` - Complete\n* `4` - Partial\n* `5` - Declined\n* `6` - Archive\n* `7` - Rejected\n* `8` - Removed\n* `9` - Paused\n* `10` - Expired\n\n`null` `1` `2` `3` `4` `5` `6` `7` `8` `9` `10`"
                    },
                    "discount_code": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "line_item_price": {
                      "type": "string",
                      "pattern": "^\\d*(\\.\\d{0,2})?$",
                      "default": "0.00"
                    },
                    "line_item_discount_total": {
                      "type": "string",
                      "pattern": "^\\d*(\\.\\d{0,2})?$",
                      "default": "0.00"
                    },
                    "line_item_shipping": {
                      "type": "string",
                      "pattern": "^\\d*(\\.\\d{0,2})?$",
                      "default": "0.00"
                    },
                    "line_item_sub_total": {
                      "type": "string",
                      "pattern": "^\\d*(\\.\\d{0,2})?$",
                      "default": "0.00"
                    },
                    "line_item_tax": {
                      "type": "string",
                      "pattern": "^\\d*(\\.\\d{0,2})?$",
                      "default": "0.00"
                    },
                    "customer_balance_applied": {
                      "type": "string",
                      "pattern": "^\\d*(\\.\\d{0,2})?$",
                      "default": "0.00"
                    },
                    "gift_card_applied": {
                      "type": "string",
                      "pattern": "^\\d*(\\.\\d{0,2})?$",
                      "default": "0.00"
                    },
                    "line_item_total": {
                      "type": "string",
                      "pattern": "^\\d*(\\.\\d{0,2})?$",
                      "default": "0.00"
                    },
                    "line_item_price_usd": {
                      "type": "string",
                      "pattern": "^\\d*(\\.\\d{0,2})?$",
                      "default": "0.00"
                    },
                    "line_item_discount_total_usd": {
                      "type": "string",
                      "pattern": "^\\d*(\\.\\d{0,2})?$",
                      "default": "0.00"
                    },
                    "line_item_shipping_usd": {
                      "type": "string",
                      "pattern": "^\\d*(\\.\\d{0,2})?$",
                      "default": "0.00"
                    },
                    "line_item_tax_usd": {
                      "type": "string",
                      "pattern": "^\\d*(\\.\\d{0,2})?$",
                      "default": "0.00"
                    },
                    "customer_balance_applied_usd": {
                      "type": "string",
                      "pattern": "^\\d*(\\.\\d{0,2})?$",
                      "default": "0.00"
                    },
                    "gift_card_applied_usd": {
                      "type": "string",
                      "pattern": "^\\d*(\\.\\d{0,2})?$",
                      "default": "0.00"
                    },
                    "line_item_total_usd": {
                      "type": "string",
                      "pattern": "^\\d*(\\.\\d{0,2})?$",
                      "default": "0.00"
                    },
                    "date_complete": {
                      "type": [
                        "string",
                        "null"
                      ],
                      "format": "date-time",
                      "examples": [
                        "2023-04-01 00:00:00"
                      ]
                    },
                    "linked_order_offer_id": {
                      "type": [
                        "integer",
                        "null"
                      ]
                    },
                    "linked_transaction_cycle": {
                      "type": [
                        "integer",
                        "null"
                      ]
                    },
                    "linked_transaction_attempt": {
                      "type": [
                        "integer",
                        "null"
                      ]
                    },
                    "linked_status_type_id": {
                      "type": [
                        "integer",
                        "null"
                      ],
                      "title": "Status types",
                      "enum": [
                        null,
                        1,
                        2,
                        3,
                        4,
                        5,
                        6,
                        7,
                        8,
                        9,
                        10
                      ],
                      "description": "* `1` - Active\n* `2` - Cancelled\n* `3` - Complete\n* `4` - Partial\n* `5` - Declined\n* `6` - Archive\n* `7` - Rejected\n* `8` - Removed\n* `9` - Paused\n* `10` - Expired\n\n`null` `1` `2` `3` `4` `5` `6` `7` `8` `9` `10`"
                    },
                    "linked_is_recurring": {
                      "type": [
                        "boolean",
                        "null"
                      ]
                    },
                    "line_item_shipments": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "shipment_item_id": {
                            "type": "integer"
                          },
                          "quantity": {
                            "type": "integer"
                          },
                          "item_id": {
                            "type": "integer"
                          },
                          "item_name": {
                            "type": "string"
                          },
                          "item_description": {
                            "type": [
                              "string",
                              "null"
                            ]
                          },
                          "item_additional_description": {
                            "type": [
                              "string",
                              "null"
                            ]
                          },
                          "item_image": {
                            "type": [
                              "string",
                              "null"
                            ]
                          },
                          "shipment_item_sku": {
                            "type": [
                              "string",
                              "null"
                            ]
                          },
                          "items_option_variation_id": {
                            "type": [
                              "integer",
                              "null"
                            ]
                          }
                        }
                      }
                    }
                  }
                }
              },
              "shipments": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "shipment_id": {
                      "type": "integer"
                    },
                    "connection_shipment_id": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "customer_id": {
                      "type": "integer"
                    },
                    "order_id": {
                      "type": "integer"
                    },
                    "shipment_prepaid_cycle": {
                      "type": "integer"
                    },
                    "shipment_status_id": {
                      "type": "integer",
                      "title": "Shipment Status",
                      "enum": [
                        1,
                        2,
                        3,
                        4,
                        5,
                        6,
                        7,
                        8,
                        9
                      ],
                      "description": "* `1` - Pending Post\n* `2` - Pending Tracking\n* `3` - Cancelled\n* `4` - Shipped\n* `5` - Error\n* `6` - Delivered\n* `7` - Declined\n* `8` - Pending Transaction\n* `9` - Skipped\t\n\n`1` `2` `3` `4` `5` `6` `7` `8` `9`"
                    },
                    "transaction_charge_id": {
                      "type": "integer"
                    },
                    "connection_id": {
                      "type": [
                        "integer",
                        "null"
                      ]
                    },
                    "fulfillment_id": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "shipment_tracking_id": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "carrier_id": {
                      "type": [
                        "integer",
                        "null"
                      ],
                      "title": "Carriers",
                      "enum": [
                        null,
                        1,
                        2,
                        3,
                        4,
                        5,
                        6,
                        8,
                        9
                      ],
                      "description": "* `1` - USPS\n* `2` - UPS\n* `3` - FedEx\n* `4` - DHL eCommerce\n* `5` - UPS Mail Innovations\n* `6` - Canada Post\n* `8` - Australia Post\n* `9` - Hermes\n\n`null` `1` `2` `3` `4` `5` `6` `8` `9`"
                    },
                    "shipping_profile_id": {
                      "type": [
                        "integer",
                        "null"
                      ]
                    },
                    "date_cancel": {
                      "type": [
                        "string",
                        "null"
                      ],
                      "format": "date-time",
                      "examples": [
                        "2023-04-01 00:00:00"
                      ]
                    },
                    "date_scheduled": {
                      "type": "string",
                      "format": "date-time",
                      "examples": [
                        "2023-04-01 00:00:00"
                      ]
                    },
                    "date_complete": {
                      "type": [
                        "string",
                        "null"
                      ],
                      "format": "date-time",
                      "examples": [
                        "2023-04-01 00:00:00"
                      ]
                    },
                    "date_scan": {
                      "type": [
                        "string",
                        "null"
                      ],
                      "format": "date-time",
                      "examples": [
                        "2023-04-01 00:00:00"
                      ]
                    },
                    "date_deliver": {
                      "type": [
                        "string",
                        "null"
                      ],
                      "format": "date-time",
                      "examples": [
                        "2023-04-01 00:00:00"
                      ]
                    },
                    "date_return": {
                      "type": [
                        "string",
                        "null"
                      ],
                      "format": "date-time",
                      "examples": [
                        "2023-04-01 00:00:00"
                      ]
                    },
                    "date_skip": {
                      "type": [
                        "string",
                        "null"
                      ],
                      "format": "date-time",
                      "examples": [
                        "2023-04-01 00:00:00"
                      ]
                    },
                    "date_rma": {
                      "type": [
                        "string",
                        "null"
                      ],
                      "format": "date-time",
                      "examples": [
                        "2023-04-01 00:00:00"
                      ]
                    },
                    "shipment_rma": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "cancel_type_id": {
                      "type": [
                        "integer",
                        "null"
                      ]
                    },
                    "skip_type_id": {
                      "type": [
                        "integer",
                        "null"
                      ]
                    },
                    "shipping_reship_type_id": {
                      "type": [
                        "integer",
                        "null"
                      ],
                      "title": "Shipping reship types",
                      "enum": [
                        null,
                        1,
                        2,
                        3,
                        4
                      ],
                      "description": "* `1` - Did not receive package\n* `2` - Damaged Items\n* `3` - Items Incorrect\n* `4` - Quantity Incorrect\n\n`null` `1` `2` `3` `4`"
                    },
                    "shipment_parent_type_id": {
                      "type": [
                        "integer",
                        "null"
                      ],
                      "title": "Shipment parent types",
                      "enum": [
                        null,
                        1,
                        2,
                        3,
                        4
                      ],
                      "description": "* `1` - Reship\n* `2` - Reward\n* `3` - Gift\n* `4` - Free\n\n`null` `1` `2` `3` `4`"
                    },
                    "date_created": {
                      "type": "string",
                      "format": "date-time",
                      "examples": [
                        "2023-04-01 00:00:00"
                      ]
                    },
                    "created_by": {
                      "type": "integer"
                    },
                    "date_modified": {
                      "type": "string",
                      "format": "date-time",
                      "examples": [
                        "2023-04-01 00:00:00"
                      ]
                    },
                    "modified_by": {
                      "type": "integer"
                    },
                    "shipment_notes": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "connection_request_text": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "connection_response_text": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "shipment_items": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "shipment_item_id": {
                            "type": "integer"
                          },
                          "quantity": {
                            "type": "integer"
                          },
                          "item_id": {
                            "type": "integer"
                          },
                          "item_name": {
                            "type": "string"
                          },
                          "item_description": {
                            "type": [
                              "string",
                              "null"
                            ]
                          },
                          "item_additional_description": {
                            "type": [
                              "string",
                              "null"
                            ]
                          },
                          "item_image": {
                            "type": [
                              "string",
                              "null"
                            ]
                          },
                          "shipment_item_sku": {
                            "type": [
                              "string",
                              "null"
                            ]
                          },
                          "items_option_variation_id": {
                            "type": [
                              "integer",
                              "null"
                            ]
                          }
                        }
                      }
                    },
                    "customer_address_billing": {
                      "type": "object",
                      "properties": {
                        "customer_address_id": {
                          "type": "integer"
                        },
                        "fname": {
                          "type": "string"
                        },
                        "lname": {
                          "type": "string"
                        },
                        "organization": {
                          "type": "string"
                        },
                        "address1": {
                          "type": "string"
                        },
                        "address2": {
                          "type": "string"
                        },
                        "city": {
                          "type": "string"
                        },
                        "country": {
                          "type": "string"
                        },
                        "state": {
                          "type": "string"
                        },
                        "zipcode": {
                          "type": "string"
                        },
                        "address_valid": {
                          "type": "boolean"
                        },
                        "date_created": {
                          "type": "string",
                          "format": "date-time",
                          "examples": [
                            "2023-04-01 00:00:00"
                          ]
                        },
                        "date_modified": {
                          "type": "string",
                          "format": "date-time",
                          "examples": [
                            "2023-04-01 00:00:00"
                          ]
                        },
                        "created_by": {
                          "type": "integer"
                        },
                        "modified_by": {
                          "type": "integer"
                        }
                      }
                    },
                    "customer_address_shipping": {
                      "type": "object",
                      "properties": {
                        "customer_address_id": {
                          "type": "integer"
                        },
                        "fname": {
                          "type": "string"
                        },
                        "lname": {
                          "type": "string"
                        },
                        "organization": {
                          "type": "string"
                        },
                        "address1": {
                          "type": "string"
                        },
                        "address2": {
                          "type": "string"
                        },
                        "city": {
                          "type": "string"
                        },
                        "country": {
                          "type": "string"
                        },
                        "state": {
                          "type": "string"
                        },
                        "zipcode": {
                          "type": "string"
                        },
                        "address_valid": {
                          "type": "boolean"
                        },
                        "date_created": {
                          "type": "string",
                          "format": "date-time",
                          "examples": [
                            "2023-04-01 00:00:00"
                          ]
                        },
                        "date_modified": {
                          "type": "string",
                          "format": "date-time",
                          "examples": [
                            "2023-04-01 00:00:00"
                          ]
                        },
                        "created_by": {
                          "type": "integer"
                        },
                        "modified_by": {
                          "type": "integer"
                        }
                      }
                    },
                    "campaign": {
                      "title": "campaign_simple",
                      "type": "object",
                      "properties": {
                        "campaign_id": {
                          "type": "integer"
                        },
                        "campaign_name": {
                          "type": "string"
                        }
                      }
                    },
                    "connection": {
                      "title": "connection",
                      "type": [
                        "object",
                        "null"
                      ],
                      "properties": {
                        "connection_id": {
                          "type": "integer"
                        },
                        "connection_name": {
                          "type": "string"
                        }
                      }
                    },
                    "tracking_history": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "tracking_history_id": {
                            "type": "integer"
                          },
                          "carrier_id": {
                            "type": [
                              "integer",
                              "null"
                            ]
                          },
                          "date": {
                            "type": [
                              "string",
                              "null"
                            ],
                            "format": "date-time",
                            "examples": [
                              "2023-04-01 00:00:00"
                            ]
                          },
                          "category_id": {
                            "type": [
                              "integer",
                              "null"
                            ]
                          },
                          "category_name": {
                            "type": [
                              "string",
                              "null"
                            ]
                          },
                          "status_id": {
                            "type": [
                              "integer",
                              "null"
                            ]
                          },
                          "status_text": {
                            "type": [
                              "string",
                              "null"
                            ]
                          }
                        }
                      }
                    },
                    "actions": {
                      "type": "object",
                      "properties": {
                        "can_change_address": {
                          "type": "boolean"
                        },
                        "can_process": {
                          "type": "boolean"
                        },
                        "can_reschedule": {
                          "type": "boolean"
                        },
                        "can_rma": {
                          "type": "boolean"
                        },
                        "can_skip": {
                          "type": "boolean"
                        },
                        "can_swap": {
                          "type": "boolean"
                        },
                        "can_unskip": {
                          "type": "boolean"
                        }
                      }
                    }
                  }
                }
              },
              "route_logs": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "route_log_id": {
                      "type": "integer"
                    },
                    "route_id": {
                      "type": "integer"
                    },
                    "order_id": {
                      "type": "integer"
                    },
                    "merchant_id": {
                      "type": "integer"
                    },
                    "card_type_id": {
                      "title": "Card Types",
                      "enum": [
                        null,
                        1,
                        2,
                        3,
                        4,
                        5,
                        6,
                        7
                      ],
                      "description": "* `1` - Mastercard\n* `2` - Visa\n* `3` - Discover\n* `4` - American Express\n* `5` - Digital Wallet\n* `6` - ACH\n* `7` - SEPA\n\n`null` `1` `2` `3` `4` `5` `6` `7`",
                      "type": [
                        "integer",
                        "null"
                      ]
                    },
                    "card_type_name": {
                      "type": "string"
                    },
                    "reason": {
                      "type": "string"
                    },
                    "date_complete": {
                      "type": "string",
                      "format": "date-time",
                      "examples": [
                        "2023-04-01 00:00:00"
                      ]
                    },
                    "date_created": {
                      "type": "string",
                      "format": "date-time",
                      "examples": [
                        "2023-04-01 00:00:00"
                      ]
                    },
                    "created_by": {
                      "type": "integer"
                    }
                  }
                }
              },
              "actions": {
                "type": "object",
                "properties": {
                  "can_process": {
                    "type": "boolean"
                  },
                  "can_reorder": {
                    "type": "boolean"
                  },
                  "can_reschedule": {
                    "type": "boolean"
                  },
                  "can_skip": {
                    "type": "boolean"
                  },
                  "can_unskip": {
                    "type": "boolean"
                  }
                }
              }
            }
          }
        },
        "order_offer_gifts": {
          "type": "array",
          "items": {
            "title": "Order Offer Gift",
            "type": "object",
            "properties": {
              "order_offer_id": {
                "type": "integer"
              },
              "gift_card_code": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "gift_name": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "gift_message": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "gift_email": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "gift_phone": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "gift_date": {
                "type": [
                  "string",
                  "null"
                ],
                "format": "date-time",
                "examples": [
                  "2023-04-01 00:00:00"
                ]
              },
              "gift_date_sent": {
                "type": [
                  "string",
                  "null"
                ],
                "format": "date-time",
                "examples": [
                  "2023-04-01 00:00:00"
                ]
              },
              "gift_status": {
                "type": "string"
              }
            }
          }
        },
        "customer_address_billing": {
          "type": "object",
          "properties": {
            "customer_address_id": {
              "type": "integer"
            },
            "fname": {
              "type": "string"
            },
            "lname": {
              "type": "string"
            },
            "organization": {
              "type": "string"
            },
            "address1": {
              "type": "string"
            },
            "address2": {
              "type": "string"
            },
            "city": {
              "type": "string"
            },
            "country": {
              "type": "string"
            },
            "state": {
              "type": "string"
            },
            "zipcode": {
              "type": "string"
            },
            "address_valid": {
              "type": "boolean"
            },
            "date_created": {
              "type": "string",
              "format": "date-time",
              "examples": [
                "2023-04-01 00:00:00"
              ]
            },
            "date_modified": {
              "type": "string",
              "format": "date-time",
              "examples": [
                "2023-04-01 00:00:00"
              ]
            },
            "created_by": {
              "type": "integer"
            },
            "modified_by": {
              "type": "integer"
            }
          }
        },
        "customer_address_shipping": {
          "type": "object",
          "properties": {
            "customer_address_id": {
              "type": "integer"
            },
            "fname": {
              "type": "string"
            },
            "lname": {
              "type": "string"
            },
            "organization": {
              "type": "string"
            },
            "address1": {
              "type": "string"
            },
            "address2": {
              "type": "string"
            },
            "city": {
              "type": "string"
            },
            "country": {
              "type": "string"
            },
            "state": {
              "type": "string"
            },
            "zipcode": {
              "type": "string"
            },
            "address_valid": {
              "type": "boolean"
            },
            "date_created": {
              "type": "string",
              "format": "date-time",
              "examples": [
                "2023-04-01 00:00:00"
              ]
            },
            "date_modified": {
              "type": "string",
              "format": "date-time",
              "examples": [
                "2023-04-01 00:00:00"
              ]
            },
            "created_by": {
              "type": "integer"
            },
            "modified_by": {
              "type": "integer"
            }
          }
        },
        "campaign": {
          "title": "campaign_simple",
          "type": "object",
          "properties": {
            "campaign_id": {
              "type": "integer"
            },
            "campaign_name": {
              "type": "string"
            }
          }
        },
        "actions": {
          "type": "object",
          "properties": {
            "can_cancel": {
              "type": "boolean"
            },
            "can_change_frequency": {
              "type": "boolean"
            },
            "can_change_quantity": {
              "type": "boolean"
            },
            "can_edit_gift": {
              "type": "boolean"
            },
            "can_manage": {
              "type": "boolean"
            },
            "can_pause": {
              "type": "boolean"
            },
            "can_reactivate": {
              "type": "boolean"
            },
            "can_resend_gift": {
              "type": "boolean"
            },
            "can_swap": {
              "type": "boolean"
            },
            "can_unpause": {
              "type": "boolean"
            },
            "is_subscription": {
              "type": "boolean"
            }
          }
        }
      },
      "$schema": "http://json-schema.org/draft-04/schema#"
    },
    "400": {
      "type": "object",
      "properties": {
        "error": {
          "type": "object",
          "properties": {
            "code": {
              "type": "string"
            },
            "message": {
              "type": "string"
            }
          }
        }
      },
      "$schema": "http://json-schema.org/draft-04/schema#"
    },
    "401": {
      "type": "object",
      "properties": {
        "error": {
          "type": "object",
          "properties": {
            "code": {
              "type": "string"
            },
            "message": {
              "type": "string"
            }
          }
        }
      },
      "$schema": "http://json-schema.org/draft-04/schema#"
    },
    "403": {
      "type": "object",
      "properties": {
        "error": {
          "type": "object",
          "properties": {
            "code": {
              "type": "string"
            },
            "message": {
              "type": "string"
            }
          }
        }
      },
      "$schema": "http://json-schema.org/draft-04/schema#"
    },
    "500": {
      "type": "object",
      "properties": {
        "error": {
          "type": "object",
          "properties": {
            "code": {
              "type": "string"
            },
            "message": {
              "type": "string"
            }
          }
        }
      },
      "$schema": "http://json-schema.org/draft-04/schema#"
    }
  }
} as const;
export default PostOrderOffersIdSwap
