const CustomersId = {
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
      },
      {
        "$schema": "http://json-schema.org/draft-04/schema#",
        "type": "object",
        "properties": {
          "with": {
            "type": "string",
            "enum": [
              "customer_cards",
              "customer_addresses"
            ],
            "description": "Expand on the information returned by including 'with' in the query parameters. For multiple attributes, separate with a comma (example : with=customer_cards,customer_addresses) "
          }
        }
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
    "404": {
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
export default CustomersId
