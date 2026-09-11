const PostTransactionsIdAlert = {
  "body": {
    "type": "object",
    "properties": {
      "date": {
        "type": "string",
        "format": "date",
        "description": "Set the date of the alert."
      },
      "amount": {
        "type": "string",
        "pattern": "^\\d*(\\.\\d{0,2})?$",
        "description": "Amount. If amount is not passed, the full amount of the transaction will be used."
      },
      "refund_transaction": {
        "type": "boolean",
        "description": "Should the original transaction be automatically refunded at the gateway."
      },
      "code": {
        "type": "string",
        "description": "Alert code."
      },
      "alert_case_id": {
        "type": "string",
        "description": "Alert case ID."
      },
      "cancel_all_customer_order_offer": {
        "type": "boolean",
        "description": "Pass this flag if you would like to cancel All active order offers associated with the customer, not just the ones associated with the charge."
      },
      "cancel_active_shipment": {
        "type": "boolean",
        "description": "Cancel any active shipment associated with the transaction."
      },
      "transaction_notes": {
        "type": "string",
        "description": "Apply note to the history of this transaction."
      }
    },
    "required": [
      "date"
    ],
    "$schema": "http://json-schema.org/draft-04/schema#"
  },
  "metadata": {
    "allOf": [
      {
        "$schema": "http://json-schema.org/draft-04/schema#",
        "type": "object",
        "properties": {
          "transaction_id": {
            "type": "integer"
          }
        },
        "required": [
          "transaction_id"
        ]
      }
    ]
  },
  "response": {
    "200": {
      "title": "Transaction Process",
      "type": "object",
      "properties": {
        "success": {
          "type": "boolean"
        },
        "response_code": {
          "type": "integer"
        },
        "response": {
          "type": "string"
        },
        "gateway_response_id": {
          "type": "string"
        },
        "gateway_response_gateway_id": {
          "type": "string"
        },
        "gateway_response_code": {
          "type": "string"
        },
        "gateway_auth_code": {
          "type": "string"
        },
        "gateway_response_cvv": {
          "type": "string"
        },
        "gateway_response_avs": {
          "type": "string"
        },
        "gateway_response_text": {
          "type": "string"
        },
        "gateway_request_text": {
          "type": "string"
        },
        "processor_response_text": {
          "type": "string"
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
        "merchant_id": {
          "type": "integer"
        },
        "merchant_descriptor": {
          "type": [
            "string",
            "null"
          ]
        },
        "reason": {
          "type": [
            "string",
            "null"
          ],
          "description": "Reason in case of merchant error."
        },
        "gateway_response_description": {
          "type": "string"
        },
        "gateway_hard_decline": {
          "type": "string"
        },
        "transaction_id": {
          "type": "integer"
        },
        "transaction_total": {
          "type": "string",
          "pattern": "^\\d*(\\.\\d{0,2})?$",
          "default": "0.00"
        },
        "post_data": {
          "type": [
            "string",
            "null"
          ]
        },
        "shipment_id": {
          "type": [
            "integer",
            "null"
          ]
        },
        "reattempt_data": {
          "type": "array",
          "items": {
            "title": "Transaction Process",
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "response_code": {
                "type": "integer"
              },
              "response": {
                "type": "string"
              },
              "gateway_response_id": {
                "type": "string"
              },
              "gateway_response_gateway_id": {
                "type": "string"
              },
              "gateway_response_code": {
                "type": "string"
              },
              "gateway_auth_code": {
                "type": "string"
              },
              "gateway_response_cvv": {
                "type": "string"
              },
              "gateway_response_avs": {
                "type": "string"
              },
              "gateway_response_text": {
                "type": "string"
              },
              "gateway_request_text": {
                "type": "string"
              },
              "processor_response_text": {
                "type": "string"
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
              "merchant_id": {
                "type": "integer"
              },
              "merchant_descriptor": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "reason": {
                "type": [
                  "string",
                  "null"
                ],
                "description": "Reason in case of merchant error."
              },
              "gateway_response_description": {
                "type": "string"
              },
              "gateway_hard_decline": {
                "type": "string"
              },
              "transaction_id": {
                "type": "integer"
              },
              "transaction_total": {
                "type": "string",
                "pattern": "^\\d*(\\.\\d{0,2})?$",
                "default": "0.00"
              },
              "post_data": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "shipment_id": {
                "type": [
                  "integer",
                  "null"
                ]
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
export default PostTransactionsIdAlert
