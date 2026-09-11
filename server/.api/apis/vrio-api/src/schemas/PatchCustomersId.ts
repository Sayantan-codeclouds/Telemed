const PatchCustomersId = {
  "body": {
    "title": "Patch Customers",
    "description": "",
    "type": "object",
    "properties": {
      "first_name": {
        "type": "string",
        "description": "First name for customer."
      },
      "last_name": {
        "type": "string",
        "description": "Last name for customer."
      },
      "email": {
        "type": "string",
        "description": "Email address of the customer. This is what creates a unique customer ID."
      },
      "phone": {
        "type": "string",
        "description": "Telephone number of the customer."
      },
      "birthday": {
        "type": "string",
        "description": "Customer birthdate. YYYY-MM-DD",
        "format": "date"
      },
      "gender": {
        "type": "string",
        "description": "Customer gender."
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
        "description": "* `1` - he/him\n* `2` - she/her\n* `3` - they/them\n* `4` - rather not say"
      },
      "is_blacklist": {
        "type": "boolean",
        "description": "Should the customer be blacklisted."
      },
      "is_fraud": {
        "type": "boolean",
        "description": "Should the customer be flagged as fraud."
      },
      "tracking1": {
        "type": "string",
        "description": "Custom Tracking Variable Option 1 for the customer"
      },
      "tracking2": {
        "type": "string",
        "description": "Custom Tracking Variable Option 2 for the customer"
      },
      "tracking3": {
        "type": "string",
        "description": "Custom Tracking Variable Option 3 for the customer"
      },
      "tracking4": {
        "type": "string",
        "description": "Custom Tracking Variable Option 4 for the customer"
      },
      "tracking5": {
        "type": "string",
        "description": "Custom Tracking Variable Option 5 for the customer"
      },
      "tracking6": {
        "type": "string",
        "description": "Custom Tracking Variable Option 6 for the customer"
      },
      "tracking7": {
        "type": "string",
        "description": "Custom Tracking Variable Option 7 for the customer"
      },
      "tracking8": {
        "type": "string",
        "description": "Custom Tracking Variable Option 8 for the customer"
      },
      "tracking9": {
        "type": "string",
        "description": "Custom Tracking Variable Option 9 for the customer"
      },
      "tracking10": {
        "type": "string",
        "description": "Custom Tracking Variable Option 10 for the customer"
      },
      "tracking11": {
        "type": "string",
        "description": "Custom Tracking Variable Option 11 for the customer"
      },
      "tracking12": {
        "type": "string",
        "description": "Custom Tracking Variable Option 12 for the customer"
      },
      "tracking13": {
        "type": "string",
        "description": "Custom Tracking Variable Option 13 for the customer"
      },
      "tracking14": {
        "type": "string",
        "description": "Custom Tracking Variable Option 14 for the customer"
      },
      "tracking15": {
        "type": "string",
        "description": "Custom Tracking Variable Option 15 for the customer"
      },
      "tracking16": {
        "type": "string",
        "description": "Custom Tracking Variable Option 16 for the customer"
      },
      "tracking17": {
        "type": "string",
        "description": "Custom Tracking Variable Option 17 for the customer"
      },
      "tracking18": {
        "type": "string",
        "description": "Custom Tracking Variable Option 18 for the customer"
      },
      "tracking19": {
        "type": "string",
        "description": "Custom Tracking Variable Option 19 for the customer"
      },
      "tracking20": {
        "type": "string",
        "description": "Custom Tracking Variable Option 20 for the customer"
      },
      "customer_notes": {
        "type": "string",
        "description": "Apply note to the history of this customer."
      }
    },
    "$schema": "http://json-schema.org/draft-04/schema#"
  },
  "metadata": {
    "allOf": [
      {
        "$schema": "http://json-schema.org/draft-04/schema#",
        "type": "object",
        "properties": {
          "customer_id": {
            "type": "integer"
          }
        },
        "required": [
          "customer_id"
        ]
      }
    ]
  },
  "response": {
    "200": {
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
export default PatchCustomersId
