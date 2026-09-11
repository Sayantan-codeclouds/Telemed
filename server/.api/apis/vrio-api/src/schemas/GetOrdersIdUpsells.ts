const GetOrdersIdUpsells = {
  "metadata": {
    "allOf": [
      {
        "$schema": "http://json-schema.org/draft-04/schema#",
        "type": "object",
        "properties": {
          "order_id": {
            "type": "integer"
          }
        },
        "required": [
          "order_id"
        ]
      },
      {
        "$schema": "http://json-schema.org/draft-04/schema#",
        "type": "object",
        "properties": {
          "upsell_type": {
            "type": "string",
            "enum": [
              "in_cart",
              "post_cart"
            ],
            "description": "Select the type of upsell offers to return."
          },
          "exclude": {
            "type": "boolean",
            "description": "Exclude already present offers that are already on the order."
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
        "upsells": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "offer_id": {
                "type": "integer"
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
              "offer_name": {
                "type": "string"
              },
              "offer_image": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "offer_upsell_title": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "offer_upsell_description": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "offer_url": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "parent_offer_id": {
                "type": "integer"
              },
              "parent_order_offer_id": {
                "type": "integer"
              },
              "offer_price": {
                "type": "string",
                "pattern": "^\\d*(\\.\\d{0,2})?$",
                "default": "0.00"
              },
              "subtotal": {
                "type": "string",
                "pattern": "^\\d*(\\.\\d{0,2})?$",
                "default": "0.00"
              },
              "total": {
                "type": "string",
                "pattern": "^\\d*(\\.\\d{0,2})?$",
                "default": "0.00"
              },
              "discount_label": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "offer_options": {
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
              "restricted_quantities": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "quantity": {
                      "type": "integer"
                    },
                    "label": {
                      "type": "string"
                    }
                  }
                }
              },
              "items": {
                "type": "array",
                "items": {
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
                    "item_options": {
                      "type": [
                        "array",
                        "null"
                      ],
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
                    "item_option_variations": {
                      "type": [
                        "array",
                        "null"
                      ],
                      "items": {
                        "type": "object",
                        "properties": {
                          "items_option_variation_id": {
                            "type": "integer"
                          },
                          "items_option_variation_key": {
                            "type": "string"
                          },
                          "items_option_variation_name": {
                            "type": "string"
                          },
                          "items_option_variation_quantity": {
                            "type": "integer"
                          },
                          "items_option_variation_sku": {
                            "type": [
                              "string",
                              "null"
                            ]
                          },
                          "items_option_variation_price": {
                            "type": "string",
                            "pattern": "^\\d*(\\.\\d{0,2})?$",
                            "default": "0.00"
                          },
                          "items_option_variation_msrp": {
                            "type": "string",
                            "pattern": "^\\d*(\\.\\d{0,2})?$",
                            "default": "0.00"
                          },
                          "items_option_variation_cost": {
                            "type": [
                              "string",
                              "null"
                            ],
                            "pattern": "^\\d*(\\.\\d{0,2})?$",
                            "default": "0.00"
                          },
                          "items_option_variation_weight": {
                            "type": [
                              "string",
                              "null"
                            ],
                            "pattern": "^\\d*(\\.\\d{0,2})?$",
                            "default": "0.00"
                          },
                          "items_option_variation_upc": {
                            "type": [
                              "string",
                              "null"
                            ]
                          },
                          "items_option_variation_image": {
                            "type": [
                              "string",
                              "null"
                            ]
                          },
                          "items_option_variation_images": {
                            "type": "array",
                            "items": {
                              "title": "image",
                              "type": "object",
                              "properties": {
                                "image_id": {
                                  "type": "integer"
                                },
                                "image_url": {
                                  "type": "string"
                                }
                              }
                            }
                          }
                        }
                      }
                    },
                    "item_images": {
                      "type": [
                        "array",
                        "null"
                      ],
                      "items": {
                        "title": "image",
                        "type": "object",
                        "properties": {
                          "image_id": {
                            "type": "integer"
                          },
                          "image_url": {
                            "type": "string"
                          }
                        }
                      }
                    },
                    "item_tags": {
                      "type": [
                        "array",
                        "null"
                      ],
                      "items": {
                        "title": "tag",
                        "type": "object",
                        "properties": {
                          "tag_id": {
                            "type": "integer"
                          },
                          "tag_name": {
                            "type": "string"
                          },
                          "tag_slug": {
                            "type": "string"
                          },
                          "tag_image": {
                            "type": [
                              "string",
                              "null"
                            ]
                          }
                        }
                      }
                    },
                    "item_swap_options": {
                      "type": [
                        "array",
                        "null"
                      ],
                      "items": {
                        "type": "object",
                        "properties": {
                          "swap_item_id": {
                            "type": "integer"
                          },
                          "swap_item_name": {
                            "type": "string"
                          },
                          "swap_item_image": {
                            "type": [
                              "string",
                              "null"
                            ]
                          },
                          "swap_item_type_id": {
                            "type": "integer"
                          },
                          "swap_item_description": {
                            "type": [
                              "string",
                              "null"
                            ]
                          },
                          "item_options": {
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
                          "item_option_variations": {
                            "type": "array",
                            "items": {
                              "type": "object",
                              "properties": {
                                "items_option_variation_id": {
                                  "type": "integer"
                                },
                                "items_option_variation_key": {
                                  "type": "string"
                                },
                                "items_option_variation_name": {
                                  "type": "string"
                                },
                                "items_option_variation_quantity": {
                                  "type": "integer"
                                },
                                "items_option_variation_sku": {
                                  "type": [
                                    "string",
                                    "null"
                                  ]
                                },
                                "items_option_variation_price": {
                                  "type": "string",
                                  "pattern": "^\\d*(\\.\\d{0,2})?$",
                                  "default": "0.00"
                                },
                                "items_option_variation_msrp": {
                                  "type": "string",
                                  "pattern": "^\\d*(\\.\\d{0,2})?$",
                                  "default": "0.00"
                                },
                                "items_option_variation_cost": {
                                  "type": [
                                    "string",
                                    "null"
                                  ],
                                  "pattern": "^\\d*(\\.\\d{0,2})?$",
                                  "default": "0.00"
                                },
                                "items_option_variation_weight": {
                                  "type": [
                                    "string",
                                    "null"
                                  ],
                                  "pattern": "^\\d*(\\.\\d{0,2})?$",
                                  "default": "0.00"
                                },
                                "items_option_variation_upc": {
                                  "type": [
                                    "string",
                                    "null"
                                  ]
                                },
                                "items_option_variation_image": {
                                  "type": [
                                    "string",
                                    "null"
                                  ]
                                },
                                "items_option_variation_images": {
                                  "type": "array",
                                  "items": {
                                    "title": "image",
                                    "type": "object",
                                    "properties": {
                                      "image_id": {
                                        "type": "integer"
                                      },
                                      "image_url": {
                                        "type": "string"
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    },
                    "connection": {
                      "title": "connection",
                      "type": [
                        "object",
                        "null"
                      ],
                      "properties": {
                        "connection_id": {
                          "type": "integer"
                        },
                        "connection_name": {
                          "type": "string"
                        }
                      }
                    }
                  }
                }
              },
              "terms": {
                "title": "Term",
                "type": "object",
                "properties": {
                  "optional": {
                    "type": "array",
                    "items": {
                      "type": "string"
                    }
                  }
                }
              }
            }
          }
        },
        "order": {
          "type": [
            "object",
            "null"
          ],
          "properties": {
            "order_id": {
              "type": "integer"
            },
            "customer_card_id": {
              "type": [
                "integer",
                "null"
              ]
            },
            "shipping_profile_id": {
              "type": [
                "integer",
                "null"
              ]
            },
            "payment_method_id": {
              "type": [
                "integer",
                "null"
              ]
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
export default GetOrdersIdUpsells
