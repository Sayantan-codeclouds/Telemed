const PatchCustomersIdBalanceId = {
  "body": {
    "title": "Patch Balance",
    "type": "object",
    "properties": {
      "credit_total": {
        "type": "string",
        "pattern": "^\\d*(\\.\\d{0,2})?$"
      },
      "auto_apply": {
        "type": "boolean"
      },
      "date_expire": {
        "type": "string",
        "format": "date"
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
            "type": "string"
          },
          "balance_history_id": {
            "type": "integer"
          }
        },
        "required": [
          "customer_id",
          "balance_history_id"
        ]
      }
    ]
  },
  "response": {
    "200": {
      "title": "Balance",
      "type": "object",
      "properties": {
        "customer_balance": {
          "type": "string",
          "pattern": "^\\d*(\\.\\d{0,2})?$",
          "default": "0.00"
        },
        "balance_history": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "balance_history_id": {
                "type": "integer"
              },
              "order_id": {
                "type": "integer"
              },
              "order_offer_id": {
                "type": [
                  "integer",
                  "null"
                ]
              },
              "credit_type": {
                "type": "string"
              },
              "credit_source": {
                "type": [
                  "integer",
                  "null"
                ]
              },
              "credit_total": {
                "type": "string",
                "pattern": "^\\d*(\\.\\d{0,2})?$",
                "default": "0.00"
              },
              "credit_total_used": {
                "type": "string",
                "pattern": "^\\d*(\\.\\d{0,2})?$",
                "default": "0.00"
              },
              "auto_apply": {
                "type": "boolean"
              },
              "transaction_cycle": {
                "type": [
                  "integer",
                  "null"
                ]
              },
              "date_expire": {
                "type": [
                  "string",
                  "null"
                ],
                "examples": [
                  "2023-04-01 00:00:00"
                ]
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
export default PatchCustomersIdBalanceId
