const PostCustomersIdAddresses = {
  "body": {
    "type": "object",
    "properties": {
      "fname": {
        "type": "string",
        "description": "Address first name."
      },
      "lname": {
        "type": "string",
        "description": "Address last name."
      },
      "organization": {
        "type": "string",
        "description": "Address organization."
      },
      "address1": {
        "type": "string",
        "description": "Address line 1."
      },
      "address2": {
        "type": "string",
        "description": "Address line 2."
      },
      "city": {
        "type": "string",
        "description": "Address city."
      },
      "country": {
        "type": "string",
        "description": "Address country code, 2 letters (example : US)."
      },
      "state": {
        "type": "string",
        "description": "Address state. Required when customers address billing ID is empty and bill_county is US or CA."
      },
      "zipcode": {
        "type": "string",
        "description": "Address zipcode."
      },
      "make_default": {
        "type": "boolean",
        "description": "Pass as true to update the address on recurring and pending orders."
      },
      "orders": {
        "type": "array",
        "items": {
          "type": "integer"
        },
        "description": "Pass an array of order ids to update."
      },
      "address_type": {
        "type": "string",
        "enum": [
          "shipping",
          "billing",
          "both"
        ],
        "description": "Define which address to update or both. Updating the shipping address on an order will also update any pending shipments associated with the order. Required when passing make_default or orders."
      }
    },
    "required": [
      "fname",
      "lname",
      "address1",
      "city",
      "country",
      "zipcode"
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
export default PostCustomersIdAddresses
