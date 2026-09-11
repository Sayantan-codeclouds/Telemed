const GetLineItems = {
  "metadata": {
    "allOf": [
      {
        "$schema": "http://json-schema.org/draft-04/schema#",
        "type": "object",
        "properties": {
          "line_item_id": {
            "type": "string",
            "description": "Search for specific line item ID(s). Comma separate for multiple."
          },
          "order_id": {
            "type": "integer",
            "description": "Search for line items that belong to a specific order."
          },
          "customer_id": {
            "type": "integer",
            "description": "Search for line items that belong to a specific customer."
          },
          "date_complete_from": {
            "type": "string",
            "format": "date-time",
            "examples": [
              "2023-04-01 00:00:00"
            ],
            "description": "Return only line items that were completed on or after this date. A date to and from field is required when not passing line item ID(s), a customer ID or an order ID."
          },
          "date_complete_to": {
            "type": "string",
            "format": "date-time",
            "examples": [
              "2023-04-01 00:00:00"
            ],
            "description": "Return only line items that were completed on or before this date. Required when passing date_complete_from. Maximum date range: 31 days."
          },
          "date_scheduled_from": {
            "type": "string",
            "format": "date-time",
            "examples": [
              "2023-04-01 00:00:00"
            ],
            "description": "Return only line items that were scheduled on or after this date. A date to and from field is required when not passing line item ID(s), a customer ID or an order ID."
          },
          "date_scheduled_to": {
            "type": "string",
            "format": "date-time",
            "examples": [
              "2023-04-01 00:00:00"
            ],
            "description": "Return only line items that were delivered on or before this date. Required when passing date_scheduled_from. Maximum date range: 31 days."
          },
          "campaign_id": {
            "type": "integer",
            "description": "Search line items that are tied to orders of a specific campaign."
          },
          "offer_id": {
            "type": "integer",
            "description": "Search line items that are tied to orders of a specific offer."
          },
          "item_id": {
            "type": "integer",
            "description": "Search line items that are tied to a specific item."
          },
          "discount_code": {
            "type": "integer",
            "description": "Search line items that are tied to orders with a specific discount code."
          },
          "transaction_success": {
            "type": "integer",
            "description": "Search line items by success status."
          },
          "with": {
            "type": "string",
            "enum": [
              "order",
              "customer",
              "transaction",
              "item",
              "line_item_shipments"
            ],
            "description": "Expand on the information returned by including 'with' in the query parameters. For multiple attributes, separate with a comma (example : with=order,customer) "
          },
          "limit": {
            "type": "integer",
            "description": "Limit the number of results. Default: 25, max: 200."
          },
          "offset": {
            "type": "integer",
            "description": "Offset the results"
          },
          "sort_by": {
            "type": "string",
            "description": "Field to sort result by"
          },
          "order": {
            "type": "string",
            "enum": [
              "asc",
              "desc"
            ],
            "description": "Order by asc or desc"
          }
        }
      }
    ]
  },
  "response": {
    "200": {
      "title": "Line Items",
      "type": "object",
      "properties": {
        "total": {
          "type": "integer"
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
              "transaction": {
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
              "item": {
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
    "413": {
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
export default GetLineItems
