const PostSalesIdReprocess = {
  "body": {
    "type": "object",
    "properties": {
      "transaction_id": {
        "type": "integer",
        "description": "Pass an optional transaction_id to attempt to process a specific transaction. If not passed, the most recent transaction will be reattempted."
      },
      "sale_notes": {
        "type": "string",
        "description": "Apply note to the history of this sale."
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
          "sale_id": {
            "type": "integer"
          }
        },
        "required": [
          "sale_id"
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
export default PostSalesIdReprocess
