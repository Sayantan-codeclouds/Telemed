const GetOrderOffersIdGift = {
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
export default GetOrderOffersIdGift
