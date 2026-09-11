const GetCustomers = {
  "metadata": {
    "allOf": [
      {
        "$schema": "http://json-schema.org/draft-04/schema#",
        "type": "object",
        "properties": {
          "customer_id": {
            "type": "string",
            "description": "Search for specific Customer ID(s). Comma separate for multiple."
          },
          "connection_id": {
            "type": "integer",
            "description": "Search customers that belong to a specific connection."
          },
          "first_name": {
            "type": "string",
            "description": "Search for customers by first name."
          },
          "last_name": {
            "type": "string",
            "description": "Search for customers by last name."
          },
          "email": {
            "type": "string",
            "description": "Search for customers by email."
          },
          "phone": {
            "type": "string",
            "description": "Search for customers by telephone number."
          },
          "ip_address": {
            "type": "string",
            "description": "Search customers with orders using a specific IP Address."
          },
          "date_created_from": {
            "type": "string",
            "format": "date-time",
            "examples": [
              "2023-04-01 00:00:00"
            ],
            "description": "Search customers that were created on or after this date. A date to and from field is required when not passing customer ID(s) or customer email."
          },
          "date_created_to": {
            "type": "string",
            "format": "date-time",
            "examples": [
              "2023-04-01 00:00:00"
            ],
            "description": "Search customers that were created on or before this date. Required when passing date_created_from. Maximum date range: 31 days."
          },
          "date_modified_from": {
            "type": "string",
            "format": "date-time",
            "examples": [
              "2023-04-01 00:00:00"
            ],
            "description": "Search customers that were modified on or after this date. A date to and from field is required when not passing customer ID(s) or customer email."
          },
          "date_modified_to": {
            "type": "string",
            "format": "date-time",
            "examples": [
              "2023-04-01 00:00:00"
            ],
            "description": "Search customers that were modified on or before this date. Required when passing date_modified_from. Maximum date range: 31 days."
          },
          "order_id": {
            "type": "integer",
            "description": "Search for customers by a specific  order ID."
          },
          "campaign_id": {
            "type": "integer",
            "description": "Search customers that have orders associated with a specific campaign ID."
          },
          "transaction_id": {
            "type": "integer",
            "description": "Search for customers using the transaction ID."
          },
          "offer_id": {
            "type": "integer",
            "description": "Search customers that have orders that contain specific offers."
          },
          "order_offer_id": {
            "type": "integer",
            "description": "Search for customers using the order offer ID."
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
            "description": "Search customers that have offers in a specific status.\n* `1` - Active\n* `2` - Cancelled\n* `3` - Complete\n* `4` - Partial\n* `5` - Declined\n* `6` - Archive\n* `7` - Rejected\n* `8` - Removed\n* `9` - Paused\n* `10` - Expired"
          },
          "is_recurring": {
            "type": "boolean",
            "description": "Search customers that have recurring offers."
          },
          "merchant_id": {
            "type": "integer",
            "description": "Search customers that have transactions using a specific merchant ID."
          },
          "card_bin": {
            "type": "integer",
            "description": "Search customers that have cards that have a specific BIN number."
          },
          "card_last_4": {
            "type": "integer",
            "description": "Search customers that have cards that have specific last 4 digits."
          },
          "is_blacklist": {
            "type": "boolean",
            "description": "Search for only blacklisted customers."
          },
          "is_test": {
            "type": "boolean",
            "description": "Search customers that have test orders."
          },
          "discount_code": {
            "type": "string",
            "description": "Search customers that have used a specific discount code."
          },
          "ship_address": {
            "type": "string",
            "description": "Search customers using the ship address."
          },
          "ship_city": {
            "type": "string",
            "description": "Search customers using the ship city."
          },
          "ship_state": {
            "type": "string",
            "description": "Search customers using the ship state."
          },
          "ship_zipcode": {
            "type": "string",
            "description": "Search customers using the ship zipcode."
          },
          "ship_country": {
            "type": "string",
            "description": "Search customers using the ship country."
          },
          "bill_address": {
            "type": "string",
            "description": "Search customers using the bill address."
          },
          "bill_city": {
            "type": "string",
            "description": "Search customers using the bill city."
          },
          "bill_state": {
            "type": "string",
            "description": "Search customers using the bill state."
          },
          "bill_zipcode": {
            "type": "string",
            "description": "Search customers using the bill zipcode."
          },
          "bill_country": {
            "type": "string",
            "description": "Search customers using the bill country."
          },
          "shipment_id": {
            "type": "integer",
            "description": "Search for customers by a specific shipment ID."
          },
          "shipment_tracking_id": {
            "type": "string",
            "description": "Search for customers by using a tracking number from a shipment."
          },
          "tracking1-20": {
            "type": "string",
            "description": "Custom Tracking Variable Options 1-20 that would be on a customer order."
          },
          "with": {
            "type": "string",
            "enum": [
              "customer_cards",
              "customer_addresses"
            ],
            "description": "Expand on the information returned by including 'with' in the query parameters. For multiple attributes, separate with a comma (example : with=customer_cards,customer_addresses) "
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
      "title": "Customers",
      "type": "object",
      "properties": {
        "total": {
          "type": "integer"
        },
        "customers": {
          "type": "array",
          "items": {
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
export default GetCustomers
