const PostCustomersIdCards = {
  "body": {
    "type": "object",
    "properties": {
      "card_type_id": {
        "enum": [
          null,
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "description": "Required when passing payment method ID = 1 and when not passing a customer card ID.\n* `1` - Mastercard\n* `2` - Visa\n* `3` - Discover\n* `4` - American Express\n* `5` - Digital Wallet\n* `6` - ACH",
        "type": "integer"
      },
      "card_number": {
        "type": "string",
        "description": "Full Card Number."
      },
      "card_exp_month": {
        "type": "integer",
        "description": "Card Expiration month (08)."
      },
      "card_exp_year": {
        "type": "integer",
        "description": "Card Expiration year (2018)."
      },
      "card_cvv": {
        "type": "string",
        "description": "Card Security Card."
      },
      "make_default": {
        "type": "boolean",
        "description": "Pass as true to card the address on recurring and pending orders."
      },
      "orders": {
        "type": "array",
        "items": {
          "type": "integer"
        },
        "description": "Pass an array of order ids to update."
      },
      "customers_address_billing_id": {
        "type": "integer",
        "description": "Pass a billing address to associate with that card."
      }
    },
    "required": [
      "card_type_id",
      "card_number",
      "card_exp_month",
      "card_exp_year",
      "card_cvv"
    ],
    "$schema": "http://json-schema.org/draft-04/schema#"
  },
  "metadata": {
    "allOf": [
      {
        "$schema": "http://json-schema.org/draft-04/schema#",
        "type": "object",
        "properties": {
          "customer_id": {
            "type": "string"
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
export default PostCustomersIdCards
