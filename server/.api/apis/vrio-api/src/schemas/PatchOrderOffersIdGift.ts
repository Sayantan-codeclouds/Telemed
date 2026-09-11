const PatchOrderOffersIdGift = {
  "body": {
    "type": "object",
    "properties": {
      "gift_message": {
        "type": "string",
        "description": "Message to use for gift communication. Required if is_gift is true."
      },
      "gift_name": {
        "type": "string",
        "description": "Name for the person receiving the gift. Required if is_gift is true."
      },
      "gift_date": {
        "type": "string",
        "format": "date-time",
        "description": "Date to send gift communication. Required if is_gift is true.",
        "examples": [
          "2023-04-01 00:00:00"
        ]
      },
      "gift_email": {
        "type": "string",
        "description": "Email for the person receiving the gift. Required if is_gift is true."
      },
      "gift_phone": {
        "type": "string",
        "description": "Phone for the person receiving the gift. Required if is_gift is true."
      },
      "order_offer_notes": {
        "type": "string",
        "description": "Apply note to the history of this order offer."
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
export default PatchOrderOffersIdGift
