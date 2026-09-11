const GetOrderOffersIdSwapOptions = {
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
      },
      {
        "$schema": "http://json-schema.org/draft-04/schema#",
        "type": "object",
        "properties": {
          "with": {
            "type": "string",
            "enum": [
              "initial_item_options"
            ],
            "description": "Expand on the information returned by including 'with' in the query parameters. (example : with=initial_item_options) "
          }
        }
      }
    ]
  },
  "response": {
    "200": {
      "description": "",
      "type": "object",
      "properties": {
        "total": {
          "type": "integer"
        },
        "offers": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "offer_id": {
                "type": "integer"
              },
              "offer_name": {
                "type": "string"
              },
              "offer_title": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "offer_code": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "primary_offer_category_id": {
                "type": [
                  "integer",
                  "null"
                ]
              },
              "secondary_offer_category_id": {
                "type": [
                  "integer",
                  "null"
                ]
              },
              "offer_type_id": {
                "type": "integer",
                "title": "Offer types",
                "enum": [
                  1,
                  2
                ],
                "description": "* `1` - One Time Sale\n* `2` - Recurring\n\n`1` `2`"
              },
              "offer_configuration": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "offer_price": {
                "type": "string",
                "pattern": "^\\d*(\\.\\d{0,2})?$",
                "default": "0.00",
                "description": "Returns the price for the initial cycle of the offer. If null, then the offer has multiple items associated with it, to get full pricing for the offer, pass “with=offer_cycles”"
              },
              "offer_description": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "offer_global": {
                "type": "boolean"
              },
              "offer_url": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "initial_item_id": {
                "type": [
                  "integer",
                  "null"
                ]
              },
              "offer_notes": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "offer_active": {
                "type": "boolean"
              },
              "date_created": {
                "type": "string",
                "format": "date-time",
                "examples": [
                  "2023-04-01 00:00:00"
                ]
              },
              "created_by": {
                "type": "integer"
              },
              "date_modified": {
                "type": "string",
                "format": "date-time",
                "examples": [
                  "2023-04-01 00:00:00"
                ]
              },
              "modified_by": {
                "type": "integer"
              },
              "initial_item_options": {
                "type": "array",
                "items": {
                  "title": "item_option",
                  "type": "object",
                  "properties": {
                    "item_option_id": {
                      "type": "integer"
                    },
                    "item_option_name": {
                      "type": "string"
                    },
                    "item_option_values": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "item_option_value_id": {
                            "type": "integer"
                          },
                          "item_option_value_name": {
                            "type": "string"
                          }
                        }
                      }
                    }
                  }
                }
              },
              "offer_cycles": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "offer_cycle_id": {
                      "type": "integer"
                    },
                    "offer_cycle_weight": {
                      "type": "integer"
                    },
                    "offer_cycle_product_type_id": {
                      "type": "integer",
                      "title": "Offer cycle product types",
                      "enum": [
                        1,
                        2,
                        3,
                        4,
                        5,
                        6
                      ],
                      "description": "* `1` - Item Bundle\n* `2` - Item\n* `3` - Reward\n* `4` - Gift Card\n* `5` - Dynamic Item\n* `6` - Other (Used for Digital or Charge Only)\n\n`1` `2` `3` `4` `5` `6`"
                    },
                    "item_bundle_id": {
                      "type": [
                        "integer",
                        "null"
                      ]
                    },
                    "item_id": {
                      "type": [
                        "integer",
                        "null"
                      ]
                    },
                    "offer_cycle_price": {
                      "type": "string",
                      "pattern": "^\\d*(\\.\\d{0,2})?$",
                      "default": "0.00"
                    },
                    "offer_cycle_length": {
                      "type": [
                        "integer",
                        "null"
                      ]
                    },
                    "charge_timeframe_id": {
                      "type": [
                        "integer",
                        "null"
                      ]
                    },
                    "offer_cycle_trigger_type_id": {
                      "type": [
                        "integer",
                        "null"
                      ],
                      "title": "Offer cycle trigger types",
                      "enum": [
                        null,
                        1,
                        2
                      ],
                      "description": "* `1` - Time of Charge\n* `2` - Delivered Package\n\n`null` `1` `2`"
                    },
                    "offer_cycle_trigger_hour": {
                      "type": "integer"
                    },
                    "offer_cycle_multiple_shipments": {
                      "type": "boolean"
                    },
                    "offer_cycle_multiple_shipments_count": {
                      "type": "integer"
                    },
                    "offer_cycle_multiple_shipments_interval": {
                      "type": "integer"
                    },
                    "fulfillment_delay": {
                      "type": "integer"
                    },
                    "fulfillment_delay_timeframe_disable": {
                      "type": "boolean"
                    },
                    "offer_cycle_reward_type_id": {
                      "type": [
                        "integer",
                        "null"
                      ],
                      "title": "Offer cycle reward types",
                      "enum": [
                        null,
                        1,
                        2,
                        3
                      ],
                      "description": "* `1` - Flate Rate\n* `2` - Order Percentage\n* `3` - Flat Rate / Order Percentage\n\n`null` `1` `2` `3`"
                    },
                    "offer_cycle_reward_flat_rate": {
                      "type": "string",
                      "pattern": "^\\d*(\\.\\d{0,2})?$",
                      "default": "0.00"
                    },
                    "offer_cycle_reward_percentage": {
                      "type": "integer"
                    },
                    "offer_cycle_reward_expiration": {
                      "type": "integer"
                    },
                    "offer_cycle_gift_card_total": {
                      "type": "string",
                      "pattern": "^\\d*(\\.\\d{0,2})?$",
                      "default": "0.00"
                    },
                    "offer_cycle_gift_card_expiration": {
                      "type": "integer"
                    },
                    "offer_cycle_final": {
                      "type": "boolean"
                    },
                    "offer_cycle_active": {
                      "type": "boolean"
                    },
                    "quantity_discount_id": {
                      "type": [
                        "integer",
                        "null"
                      ]
                    },
                    "offer_cycle_price_minimum": {
                      "type": "string",
                      "pattern": "^\\d*(\\.\\d{0,2})?$",
                      "default": "0.00"
                    },
                    "discount_calculation_total": {
                      "type": "boolean"
                    },
                    "offer_cycle_shipping_price": {
                      "type": "string",
                      "pattern": "^\\d*(\\.\\d{0,2})?$",
                      "default": "0.00"
                    },
                    "offer_cycle_shipment_skippable": {
                      "type": "boolean"
                    },
                    "charge_responder_id_bypass": {
                      "type": "boolean"
                    },
                    "offer_cycle_deliver_extend_value": {
                      "type": "integer"
                    },
                    "offer_cycle_skippable": {
                      "type": "boolean"
                    },
                    "offer_cycle_trial": {
                      "type": "boolean"
                    },
                    "offer_cycle_auth_next_charge": {
                      "type": "boolean"
                    },
                    "date_created": {
                      "type": "string",
                      "format": "date-time",
                      "examples": [
                        "2023-04-01 00:00:00"
                      ]
                    },
                    "created_by": {
                      "type": "integer"
                    },
                    "date_modified": {
                      "type": "string",
                      "format": "date-time",
                      "examples": [
                        "2023-04-01 00:00:00"
                      ]
                    },
                    "modified_by": {
                      "type": "integer"
                    },
                    "offer_cycle_items": {
                      "type": "array",
                      "items": {
                        "title": "Item",
                        "type": "object",
                        "properties": {
                          "item_id": {
                            "type": "integer"
                          },
                          "item_name": {
                            "type": "string"
                          },
                          "item_category_id": {
                            "type": [
                              "integer",
                              "null"
                            ]
                          },
                          "item_description": {
                            "type": [
                              "string",
                              "null"
                            ]
                          },
                          "item_image": {
                            "type": [
                              "string",
                              "null"
                            ]
                          },
                          "item_active": {
                            "type": "boolean"
                          },
                          "item_price": {
                            "type": [
                              "string",
                              "null"
                            ],
                            "pattern": "^\\d*(\\.\\d{0,2})?$",
                            "default": "0.00"
                          },
                          "item_msrp": {
                            "type": [
                              "string",
                              "null"
                            ],
                            "pattern": "^\\d*(\\.\\d{0,2})?$",
                            "default": "0.00"
                          },
                          "item_cost": {
                            "type": [
                              "string",
                              "null"
                            ],
                            "pattern": "^\\d*(\\.\\d{0,2})?$",
                            "default": "0.00"
                          },
                          "item_shippable": {
                            "type": "boolean"
                          },
                          "item_sku": {
                            "type": [
                              "string",
                              "null"
                            ]
                          },
                          "item_weight": {
                            "type": [
                              "string",
                              "null"
                            ],
                            "pattern": "^\\d*(\\.\\d{0,2})?$",
                            "default": "0.00"
                          },
                          "item_upc": {
                            "type": [
                              "string",
                              "null"
                            ]
                          },
                          "item_slug": {
                            "type": [
                              "string",
                              "null"
                            ]
                          },
                          "item_quantity": {
                            "type": "integer"
                          },
                          "connection_id": {
                            "type": [
                              "integer",
                              "null"
                            ]
                          },
                          "out_of_stock_block": {
                            "type": "boolean"
                          },
                          "item_turnaround_time": {
                            "type": "integer"
                          },
                          "item_additional_description": {
                            "type": [
                              "string",
                              "null"
                            ]
                          },
                          "item_ingredients": {
                            "type": [
                              "string",
                              "null"
                            ]
                          },
                          "item_video": {
                            "type": [
                              "string",
                              "null"
                            ]
                          },
                          "item_sales_page": {
                            "type": [
                              "string",
                              "null"
                            ]
                          },
                          "item_perishable": {
                            "type": "boolean"
                          },
                          "item_tax_code": {
                            "type": [
                              "string",
                              "null"
                            ]
                          },
                          "item_additional_details_1": {
                            "type": [
                              "string",
                              "null"
                            ]
                          },
                          "item_additional_details_2": {
                            "type": [
                              "string",
                              "null"
                            ]
                          },
                          "item_additional_details_3": {
                            "type": [
                              "string",
                              "null"
                            ]
                          },
                          "item_additional_details_4": {
                            "type": [
                              "string",
                              "null"
                            ]
                          },
                          "item_additional_details_5": {
                            "type": [
                              "string",
                              "null"
                            ]
                          },
                          "date_created": {
                            "type": "string",
                            "format": "date-time",
                            "examples": [
                              "2023-04-01 00:00:00"
                            ]
                          },
                          "created_by": {
                            "type": "integer"
                          },
                          "date_modified": {
                            "type": "string",
                            "format": "date-time",
                            "examples": [
                              "2023-04-01 00:00:00"
                            ]
                          },
                          "modified_by": {
                            "type": "integer"
                          },
                          "item_notes": {
                            "type": [
                              "string",
                              "null"
                            ]
                          },
                          "offer_cycle_item_variation_prices": {
                            "type": "array",
                            "items": {
                              "type": "object",
                              "properties": {
                                "items_option_variation_id": {
                                  "type": "integer"
                                },
                                "items_option_variation_name": {
                                  "type": "string"
                                },
                                "items_option_variation_sku": {
                                  "type": [
                                    "string",
                                    "null"
                                  ]
                                },
                                "price": {
                                  "type": [
                                    "string",
                                    "null"
                                  ],
                                  "pattern": "^\\d*(\\.\\d{0,2})?$"
                                }
                              }
                            }
                          }
                        }
                      }
                    },
                    "quantity_discount_configs": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "quantity_discount_cycle_id": {
                            "type": "integer"
                          },
                          "quantity_discount_cycle_type_id": {
                            "type": "integer",
                            "title": "Quantity Discount Cycles types",
                            "enum": [
                              1,
                              2
                            ],
                            "description": "* `1` - Percentage\n* `2` - Flat Rate\n\n`1` `2`"
                          },
                          "quantity_discount_cycle_weight": {
                            "type": "integer"
                          },
                          "quantity_discount_cycle_percentage": {
                            "type": [
                              "string",
                              "null"
                            ],
                            "pattern": "^\\d*(\\.\\d{0,2})?$",
                            "default": "0.00"
                          },
                          "quantity_discount_cycle_flat_rate": {
                            "type": [
                              "string",
                              "null"
                            ],
                            "pattern": "^\\d*(\\.\\d{0,2})?$",
                            "default": "0.00"
                          },
                          "quantity_discount_cycle_name": {
                            "type": [
                              "string",
                              "null"
                            ]
                          },
                          "quantity_discount_cycle_active": {
                            "type": "boolean"
                          }
                        }
                      }
                    },
                    "charge_timeframe": {
                      "type": [
                        "object",
                        "null"
                      ],
                      "properties": {
                        "timeframe_id": {
                          "type": "integer"
                        },
                        "timeframe_name": {
                          "type": "string"
                        },
                        "timeframe_frequency": {
                          "type": "boolean"
                        },
                        "date_created": {
                          "type": [
                            "string",
                            "null"
                          ],
                          "format": "date-time",
                          "examples": [
                            "2023-04-01 00:00:00"
                          ]
                        },
                        "created_by": {
                          "type": [
                            "integer",
                            "null"
                          ]
                        },
                        "date_modified": {
                          "type": [
                            "string",
                            "null"
                          ],
                          "format": "date-time",
                          "examples": [
                            "2023-04-01 00:00:00"
                          ]
                        },
                        "modified_by": {
                          "type": [
                            "integer",
                            "null"
                          ]
                        }
                      }
                    }
                  }
                }
              },
              "offer_timeframes": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "timeframe_id": {
                      "type": "integer"
                    },
                    "timeframe_name": {
                      "type": "string"
                    },
                    "timeframe_frequency": {
                      "type": "boolean"
                    },
                    "date_created": {
                      "type": [
                        "string",
                        "null"
                      ],
                      "format": "date-time",
                      "examples": [
                        "2023-04-01 00:00:00"
                      ]
                    },
                    "created_by": {
                      "type": [
                        "integer",
                        "null"
                      ]
                    },
                    "date_modified": {
                      "type": [
                        "string",
                        "null"
                      ],
                      "format": "date-time",
                      "examples": [
                        "2023-04-01 00:00:00"
                      ]
                    },
                    "modified_by": {
                      "type": [
                        "integer",
                        "null"
                      ]
                    }
                  }
                }
              },
              "primary_offer_category": {
                "title": "offer category",
                "type": [
                  "object",
                  "null"
                ],
                "properties": {
                  "offer_category_id": {
                    "type": "integer"
                  },
                  "offer_category_name": {
                    "type": "string"
                  }
                }
              },
              "secondary_offer_category": {
                "title": "offer category",
                "type": [
                  "object",
                  "null"
                ],
                "properties": {
                  "offer_category_id": {
                    "type": "integer"
                  },
                  "offer_category_name": {
                    "type": "string"
                  }
                }
              },
              "offer_swap_options": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "swap_offer_id": {
                      "type": "integer"
                    },
                    "swap_offer_type_id": {
                      "type": "integer",
                      "title": "Swap offer types",
                      "enum": [
                        1,
                        2,
                        3
                      ],
                      "description": "* `1` - In Cart Only\n* `2` - Ongoing Subscription\n* `3` - Both\n\n`1` `2` `3`"
                    },
                    "swap_offer_description": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "created_by": {
                      "type": "integer"
                    },
                    "modified_by": {
                      "type": "integer"
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
export default GetOrderOffersIdSwapOptions
