const PostOrdersIdCapture = {
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
      }
    ]
  },
  "response": {
    "200": {
      "title": "Order Process",
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
        },
        "customer_id": {
          "type": "integer"
        },
        "order_id": {
          "type": "integer"
        },
        "order": {
          "title": "Order",
          "type": "object",
          "properties": {
            "order_id": {
              "type": "integer"
            },
            "connection_order_id": {
              "type": [
                "string",
                "null"
              ]
            },
            "campaign_id": {
              "type": "integer"
            },
            "status_type_id": {
              "type": [
                "integer",
                "null"
              ],
              "title": "Status types",
              "enum": [
                null,
                1,
                2,
                3,
                4,
                5,
                6,
                7,
                8,
                9,
                10
              ],
              "description": "* `1` - Active\n* `2` - Cancelled\n* `3` - Complete\n* `4` - Partial\n* `5` - Declined\n* `6` - Archive\n* `7` - Rejected\n* `8` - Removed\n* `9` - Paused\n* `10` - Expired\n\n`null` `1` `2` `3` `4` `5` `6` `7` `8` `9` `10`"
            },
            "customer_card_id": {
              "type": [
                "integer",
                "null"
              ]
            },
            "customer_id": {
              "type": "integer"
            },
            "customers_address_billing_id": {
              "type": [
                "integer",
                "null"
              ]
            },
            "customers_address_shipping_id": {
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
            "date_authorized": {
              "type": [
                "string",
                "null"
              ],
              "format": "date-time",
              "examples": [
                "2023-04-01 00:00:00"
              ]
            },
            "date_auto_capture": {
              "type": [
                "string",
                "null"
              ],
              "format": "date-time",
              "examples": [
                "2023-04-01 00:00:00"
              ]
            },
            "date_ordered": {
              "type": [
                "string",
                "null"
              ],
              "format": "date-time",
              "examples": [
                "2023-04-01 00:00:00"
              ]
            },
            "date_capture": {
              "type": [
                "string",
                "null"
              ],
              "format": "date-time",
              "examples": [
                "2023-04-01 00:00:00"
              ]
            },
            "is_test": {
              "type": "boolean"
            },
            "ip_address": {
              "type": [
                "string",
                "null"
              ]
            },
            "order_discount": {
              "type": "string",
              "pattern": "^\\d*(\\.\\d{0,2})?$",
              "default": "0.00"
            },
            "order_pixel": {
              "type": "boolean"
            },
            "cart_token": {
              "type": [
                "string",
                "null"
              ]
            },
            "order_pixel_block": {
              "type": [
                "string",
                "null"
              ]
            },
            "order_notes": {
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
            "user_agent": {
              "type": [
                "string",
                "null"
              ]
            },
            "cart": {
              "title": "cart",
              "type": [
                "object",
                "null"
              ],
              "properties": {
                "cart_token": {
                  "type": "string"
                },
                "editable": {
                  "type": "boolean"
                },
                "checkout_url": {
                  "type": [
                    "string",
                    "null"
                  ]
                },
                "total_items": {
                  "type": "string",
                  "default": "0.00",
                  "pattern": "^\\d*(\\.\\d{0,2})?$",
                  "description": "Total for items with discount"
                },
                "total_offer_shipping": {
                  "type": "string",
                  "pattern": "^\\d*(\\.\\d{0,2})?$",
                  "default": "0.00",
                  "description": "Total offer level shipping with shipping"
                },
                "total_campaign_shipping": {
                  "type": "string",
                  "pattern": "^\\d*(\\.\\d{0,2})?$",
                  "default": "0.00",
                  "description": "Total campaign level shipping with shipping discount"
                },
                "total_shipping": {
                  "type": "string",
                  "pattern": "^\\d*(\\.\\d{0,2})?$",
                  "default": "0.00",
                  "description": "Total shipping including discount"
                },
                "total_offer_shipping_discount": {
                  "type": "string",
                  "pattern": "^\\d*(\\.\\d{0,2})?$",
                  "default": "0.00",
                  "description": "Total offer shipping discount"
                },
                "total_campaign_shipping_discount": {
                  "type": "string",
                  "pattern": "^\\d*(\\.\\d{0,2})?$",
                  "default": "0.00",
                  "description": "Total campaign shipping discount"
                },
                "total_shipping_discount": {
                  "type": "string",
                  "pattern": "^\\d*(\\.\\d{0,2})?$",
                  "default": "0.00",
                  "description": "Total shipping discount"
                },
                "total_tax": {
                  "type": "string",
                  "pattern": "^\\d*(\\.\\d{0,2})?$",
                  "default": "0.00"
                },
                "total_discount": {
                  "type": "string",
                  "pattern": "^\\d*(\\.\\d{0,2})?$",
                  "default": "0.00"
                },
                "total_gift_cards": {
                  "type": "string",
                  "pattern": "^\\d*(\\.\\d{0,2})?$",
                  "default": "0.00"
                },
                "subtotal_items": {
                  "type": "string",
                  "pattern": "^\\d*(\\.\\d{0,2})?$",
                  "default": "0.00",
                  "description": "Total for items pre discount"
                },
                "subtotal_offer_shipping": {
                  "type": "string",
                  "pattern": "^\\d*(\\.\\d{0,2})?$",
                  "default": "0.00",
                  "description": "Total offer level shipping pre shipping discount"
                },
                "subtotal_campaign_shipping": {
                  "type": "string",
                  "pattern": "^\\d*(\\.\\d{0,2})?$",
                  "default": "0.00",
                  "description": "Total campaign level shipping pre shipping discount"
                },
                "subtotal_shipping": {
                  "type": "string",
                  "pattern": "^\\d*(\\.\\d{0,2})?$",
                  "default": "0.00",
                  "description": "Total shipping pre shipping discount"
                },
                "subtotal": {
                  "type": "string",
                  "pattern": "^\\d*(\\.\\d{0,2})?$",
                  "default": "0.00",
                  "description": "Order total pre tax"
                },
                "total": {
                  "type": "string",
                  "pattern": "^\\d*(\\.\\d{0,2})?$",
                  "default": "0.00",
                  "description": "Order Total with tax"
                },
                "discount_label": {
                  "type": [
                    "string",
                    "null"
                  ]
                },
                "currency_label": {
                  "type": "string"
                },
                "currency_value": {
                  "type": "string"
                },
                "campaign": {
                  "type": "object",
                  "properties": {
                    "connection_id": {
                      "type": "integer"
                    },
                    "campaign_id": {
                      "type": "integer"
                    },
                    "countries_with_states": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "code": {
                            "type": "string"
                          },
                          "name": {
                            "type": "string"
                          },
                          "states": {
                            "type": "array",
                            "items": {
                              "type": "object",
                              "properties": {
                                "code": {
                                  "type": "string"
                                },
                                "name": {
                                  "type": "string"
                                }
                              }
                            }
                          }
                        }
                      }
                    },
                    "campaign_storefront_url": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "campaign_cart_url": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "campaign_checkout_confirm_url": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "campaign_company_name": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "campaign_logo_primary": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "campaign_logo_secondary": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "campaign_logo_icon": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "campaign_checkout_title": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "campaign_checkout_privacy_policy_url": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "campaign_checkout_contact_url": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "campaign_checkout_opt_in_text": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "campaign_auto_check_terms": {
                      "type": "boolean"
                    },
                    "campaign_checkout_terms_url": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "campaign_phone_required": {
                      "type": "boolean"
                    },
                    "campaign_checkout_mobile_cart_display": {
                      "type": "boolean"
                    },
                    "campaign_primary_font": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "campaign_primary_font_color": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "campaign_secondary_font": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "campaign_secondary_font_color": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "campaign_primary_color": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "campaign_secondary_color": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "campaign_checkout_header_color": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "campaign_checkout_footer_color": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "campaign_checkout_google_tag_manager": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "campaign_checkout_type_id": {
                      "type": [
                        "integer",
                        "null"
                      ]
                    },
                    "campaign_checkout_style": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "campaign_checkout_upsell": {
                      "type": [
                        "object",
                        "null"
                      ],
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
                    },
                    "campaign_auto_capture_trigger_id": {
                      "type": [
                        "integer",
                        "null"
                      ]
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
                    },
                    "payment_method_ids": {
                      "type": "array",
                      "items": {
                        "type": "integer",
                        "title": "Payment methods",
                        "description": "* `1` - Credit Card\n* `2` - Check\n* `3` - Google Pay\n* `4` - Apple Pay\n* `5` - Cash\n* `6` - Paypal\n* `7` - Alternative Payments Sofort\n* `8` - Alternative Payments POLi\n* `9` - Alternative Payments SEPA\n* `10` - ACH\n* `11` - Afterpay\n* `12` - Klarna\n* `13` - SEPA\n\n`1` `2` `3` `4` `5` `6` `7` `8` `9` `10` `11` `12` `13`",
                        "enum": [
                          1,
                          2,
                          3,
                          4,
                          5,
                          6,
                          7,
                          8,
                          9,
                          10,
                          11,
                          12,
                          13
                        ]
                      }
                    },
                    "card_type_ids": {
                      "type": "array",
                      "items": {
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
                      }
                    },
                    "merchants": {
                      "type": "object",
                      "properties": {
                        "stripe": {
                          "type": "array",
                          "items": {
                            "title": "merchant_simple",
                            "type": "object",
                            "properties": {
                              "merchant_id": {
                                "type": "integer"
                              },
                              "gateway_id": {
                                "type": "integer"
                              },
                              "gateway_variable_2": {
                                "type": [
                                  "string",
                                  "null"
                                ]
                              },
                              "gateway_variable_4": {
                                "type": [
                                  "string",
                                  "null"
                                ]
                              },
                              "gateway_variable_5": {
                                "type": [
                                  "string",
                                  "null"
                                ]
                              },
                              "client_token": {
                                "type": [
                                  "string",
                                  "null"
                                ]
                              },
                              "payment_method_id": {
                                "type": "integer"
                              }
                            }
                          }
                        },
                        "braintree": {
                          "type": "array",
                          "items": {
                            "title": "merchant_simple",
                            "type": "object",
                            "properties": {
                              "merchant_id": {
                                "type": "integer"
                              },
                              "gateway_id": {
                                "type": "integer"
                              },
                              "gateway_variable_2": {
                                "type": [
                                  "string",
                                  "null"
                                ]
                              },
                              "gateway_variable_4": {
                                "type": [
                                  "string",
                                  "null"
                                ]
                              },
                              "gateway_variable_5": {
                                "type": [
                                  "string",
                                  "null"
                                ]
                              },
                              "client_token": {
                                "type": [
                                  "string",
                                  "null"
                                ]
                              },
                              "payment_method_id": {
                                "type": "integer"
                              }
                            }
                          }
                        },
                        "other": {
                          "type": "array",
                          "items": {
                            "title": "merchant_simple",
                            "type": "object",
                            "properties": {
                              "merchant_id": {
                                "type": "integer"
                              },
                              "gateway_id": {
                                "type": "integer"
                              },
                              "gateway_variable_2": {
                                "type": [
                                  "string",
                                  "null"
                                ]
                              },
                              "gateway_variable_4": {
                                "type": [
                                  "string",
                                  "null"
                                ]
                              },
                              "gateway_variable_5": {
                                "type": [
                                  "string",
                                  "null"
                                ]
                              },
                              "client_token": {
                                "type": [
                                  "string",
                                  "null"
                                ]
                              },
                              "payment_method_id": {
                                "type": "integer"
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                },
                "order": {
                  "type": "object",
                  "properties": {
                    "order_id": {
                      "type": [
                        "integer",
                        "null"
                      ]
                    },
                    "date_authorized": {
                      "type": [
                        "string",
                        "null"
                      ],
                      "format": "date-time",
                      "examples": [
                        "2023-04-01 00:00:00"
                      ]
                    },
                    "date_ordered": {
                      "type": [
                        "string",
                        "null"
                      ],
                      "format": "date-time",
                      "examples": [
                        "2023-04-01 00:00:00"
                      ]
                    },
                    "default_shipping_country": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "default_shipping_profile_id": {
                      "type": [
                        "integer",
                        "null"
                      ]
                    },
                    "customers_address_billing_id": {
                      "type": [
                        "integer",
                        "null"
                      ]
                    },
                    "customers_address_shipping_id": {
                      "type": [
                        "integer",
                        "null"
                      ]
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
                    "discount_code": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "gift_cards": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "gift_card_code": {
                            "type": "string"
                          }
                        }
                      }
                    },
                    "referral_token": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "is_recurring": {
                      "type": "boolean"
                    },
                    "shipping_information_required": {
                      "type": "boolean"
                    },
                    "shipping_profile_required": {
                      "type": "boolean"
                    },
                    "shipping_profiles": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "shipping_profile_id": {
                            "type": "integer"
                          },
                          "shipping_profile_name": {
                            "type": "string"
                          },
                          "shipping_profile_description": {
                            "type": "string"
                          },
                          "shipping_profile_price": {
                            "type": "string",
                            "pattern": "^\\d*(\\.\\d{0,2})?$",
                            "default": "0.00"
                          },
                          "carrier_name": {
                            "type": "string"
                          }
                        }
                      }
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
                    "order_pixel_block": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "transaction_id": {
                      "type": [
                        "integer",
                        "null"
                      ]
                    },
                    "gateway_transaction_id": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "auto_capture_trigger_id": {
                      "type": [
                        "integer",
                        "null"
                      ]
                    }
                  }
                },
                "customer": {
                  "type": [
                    "object",
                    "null"
                  ],
                  "properties": {
                    "customer_id": {
                      "type": "integer"
                    },
                    "email": {
                      "type": "string"
                    },
                    "phone": {
                      "type": "string"
                    },
                    "first_name": {
                      "type": "string"
                    },
                    "last_name": {
                      "type": "string"
                    },
                    "optout": {
                      "type": "boolean"
                    },
                    "same_address": {
                      "type": "boolean"
                    },
                    "bill_fname": {
                      "type": "string"
                    },
                    "bill_lname": {
                      "type": "string"
                    },
                    "bill_organization": {
                      "type": "string"
                    },
                    "bill_address1": {
                      "type": "string"
                    },
                    "bill_address2": {
                      "type": "string"
                    },
                    "bill_zipcode": {
                      "type": "string"
                    },
                    "bill_city": {
                      "type": "string"
                    },
                    "bill_state": {
                      "type": "string"
                    },
                    "bill_country": {
                      "type": "string"
                    },
                    "ship_fname": {
                      "type": "string"
                    },
                    "ship_lname": {
                      "type": "string"
                    },
                    "ship_organization": {
                      "type": "string"
                    },
                    "ship_address1": {
                      "type": "string"
                    },
                    "ship_address2": {
                      "type": "string"
                    },
                    "ship_zipcode": {
                      "type": "string"
                    },
                    "ship_city": {
                      "type": "string"
                    },
                    "ship_state": {
                      "type": "string"
                    },
                    "ship_country": {
                      "type": "string"
                    }
                  }
                },
                "offers": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "id": {
                        "type": "string"
                      },
                      "order_offer_id": {
                        "type": [
                          "integer",
                          "null"
                        ]
                      },
                      "campaign_item_id": {
                        "type": [
                          "integer",
                          "null"
                        ]
                      },
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
                      "formatted_name": {
                        "type": "string"
                      },
                      "item_id": {
                        "type": [
                          "integer",
                          "null"
                        ]
                      },
                      "item_name": {
                        "type": "string"
                      },
                      "item_slug": {
                        "type": [
                          "string",
                          "null"
                        ]
                      },
                      "items_option_variation_name": {
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
                      "item_price": {
                        "type": "string",
                        "pattern": "^\\d*(\\.\\d{0,2})?$",
                        "default": "0.00"
                      },
                      "order_offer_price": {
                        "type": [
                          "string",
                          "null"
                        ],
                        "pattern": "^\\d*(\\.\\d{0,2})?$",
                        "default": "0.00"
                      },
                      "item_description": {
                        "type": [
                          "string",
                          "null"
                        ]
                      },
                      "item_category_id": {
                        "type": [
                          "integer",
                          "null"
                        ]
                      },
                      "item_category_name": {
                        "type": [
                          "string",
                          "null"
                        ]
                      },
                      "order_offer_quantity": {
                        "type": "integer"
                      },
                      "order_offer_item_options": {
                        "type": "array",
                        "items": {
                          "title": "ItemOption",
                          "type": "object",
                          "description": "When an Item has options, or variants, determine which options should be applied. Each option will have a subset option value. Example: size is an option, Small - Medium - Large is the option value.",
                          "properties": {
                            "item_option_id": {
                              "type": "integer",
                              "description": "The option to be applied to the item."
                            },
                            "item_option_name": {
                              "type": "string"
                            },
                            "item_option_value_id": {
                              "type": "integer",
                              "description": "The value to be used for the item option ID passed."
                            },
                            "item_option_value_name": {
                              "type": "string"
                            }
                          }
                        }
                      },
                      "override_initial_item_id": {
                        "type": [
                          "integer",
                          "null"
                        ]
                      },
                      "override_initial_item_name": {
                        "type": [
                          "string",
                          "null"
                        ]
                      },
                      "override_initial_item_slug": {
                        "type": [
                          "string",
                          "null"
                        ]
                      },
                      "override_initial_item_image": {
                        "type": [
                          "string",
                          "null"
                        ]
                      },
                      "override_initial_item_option_variation_name": {
                        "type": [
                          "string",
                          "null"
                        ]
                      },
                      "override_initial_item_options": {
                        "type": "array",
                        "items": {
                          "title": "ItemOption",
                          "type": "object",
                          "description": "When an Item has options, or variants, determine which options should be applied. Each option will have a subset option value. Example: size is an option, Small - Medium - Large is the option value.",
                          "properties": {
                            "item_option_id": {
                              "type": "integer",
                              "description": "The option to be applied to the item."
                            },
                            "item_option_name": {
                              "type": "string"
                            },
                            "item_option_value_id": {
                              "type": "integer",
                              "description": "The value to be used for the item option ID passed."
                            },
                            "item_option_value_name": {
                              "type": "string"
                            }
                          }
                        }
                      },
                      "is_gift": {
                        "type": "boolean"
                      },
                      "gift_message": {
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
                      "discount_code": {
                        "type": [
                          "string",
                          "null"
                        ]
                      },
                      "discount_label": {
                        "type": [
                          "string",
                          "null"
                        ]
                      },
                      "discount": {
                        "type": "string",
                        "pattern": "^\\d*(\\.\\d{0,2})?$",
                        "default": "0.00"
                      },
                      "shipping_discount": {
                        "type": "string",
                        "pattern": "^\\d*(\\.\\d{0,2})?$",
                        "default": "0.00"
                      },
                      "subtotal_shipping": {
                        "type": "string",
                        "pattern": "^\\d*(\\.\\d{0,2})?$",
                        "default": "0.00",
                        "description": "Offer level shipping cost pre shipping discount"
                      },
                      "shipping": {
                        "type": "string",
                        "pattern": "^\\d*(\\.\\d{0,2})?$",
                        "default": "0.00",
                        "description": "Offer level shipping cost with shipping discount"
                      },
                      "subtotal_offer": {
                        "type": "string",
                        "pattern": "^\\d*(\\.\\d{0,2})?$",
                        "default": "0.00",
                        "description": "Offer total pre discount"
                      },
                      "total_offer": {
                        "type": "string",
                        "pattern": "^\\d*(\\.\\d{0,2})?$",
                        "default": "0.00",
                        "description": "Offer total"
                      },
                      "subtotal": {
                        "type": "string",
                        "pattern": "^\\d*(\\.\\d{0,2})?$",
                        "default": "0.00",
                        "description": "Offer total with shipping pre discount"
                      },
                      "total": {
                        "type": "string",
                        "pattern": "^\\d*(\\.\\d{0,2})?$",
                        "default": "0.00",
                        "description": "Offer total with shipping and discount"
                      },
                      "order_offer_upsell": {
                        "type": "boolean"
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
                      }
                    }
                  }
                }
              }
            },
            "order_offers": {
              "type": "array",
              "items": {
                "title": "Order Offer",
                "type": "object",
                "properties": {
                  "order_offer_id": {
                    "type": "integer"
                  },
                  "connection_order_offer_id": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "status_type_id": {
                    "type": [
                      "integer",
                      "null"
                    ],
                    "title": "Status types",
                    "enum": [
                      null,
                      1,
                      2,
                      3,
                      4,
                      5,
                      6,
                      7,
                      8,
                      9,
                      10
                    ],
                    "description": "* `1` - Active\n* `2` - Cancelled\n* `3` - Complete\n* `4` - Partial\n* `5` - Declined\n* `6` - Archive\n* `7` - Rejected\n* `8` - Removed\n* `9` - Paused\n* `10` - Expired\n\n`null` `1` `2` `3` `4` `5` `6` `7` `8` `9` `10`"
                  },
                  "linked_status_type_id": {
                    "type": [
                      "integer",
                      "null"
                    ],
                    "title": "Status types",
                    "enum": [
                      null,
                      1,
                      2,
                      3,
                      4,
                      5,
                      6,
                      7,
                      8,
                      9,
                      10
                    ],
                    "description": "* `1` - Active\n* `2` - Cancelled\n* `3` - Complete\n* `4` - Partial\n* `5` - Declined\n* `6` - Archive\n* `7` - Rejected\n* `8` - Removed\n* `9` - Paused\n* `10` - Expired\n\n`null` `1` `2` `3` `4` `5` `6` `7` `8` `9` `10`"
                  },
                  "date_cancel": {
                    "type": [
                      "string",
                      "null"
                    ],
                    "format": "date-time",
                    "examples": [
                      "2023-04-01 00:00:00"
                    ]
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
                  "date_ordered": {
                    "type": [
                      "string",
                      "null"
                    ],
                    "format": "date-time",
                    "examples": [
                      "2023-04-01 00:00:00"
                    ]
                  },
                  "date_reactivate": {
                    "type": [
                      "string",
                      "null"
                    ],
                    "format": "date-time",
                    "examples": [
                      "2023-04-01 00:00:00"
                    ]
                  },
                  "date_pause": {
                    "type": [
                      "string",
                      "null"
                    ],
                    "format": "date-time",
                    "examples": [
                      "2023-04-01 00:00:00"
                    ]
                  },
                  "date_unpause": {
                    "type": [
                      "string",
                      "null"
                    ],
                    "format": "date-time",
                    "examples": [
                      "2023-04-01 00:00:00"
                    ]
                  },
                  "is_gift": {
                    "type": "boolean"
                  },
                  "is_recurring": {
                    "type": "boolean"
                  },
                  "is_test": {
                    "type": "boolean"
                  },
                  "offer_id": {
                    "type": "integer"
                  },
                  "offer_name": {
                    "type": "string"
                  },
                  "order_id": {
                    "type": "integer"
                  },
                  "order_offer_price": {
                    "type": "string",
                    "pattern": "^\\d*(\\.\\d{0,2})?$",
                    "default": "0.00"
                  },
                  "order_offer_quantity": {
                    "type": "integer"
                  },
                  "cancel_type_id": {
                    "type": [
                      "integer",
                      "null"
                    ]
                  },
                  "cancel_by": {
                    "type": [
                      "integer",
                      "null"
                    ]
                  },
                  "discount_id": {
                    "type": [
                      "integer",
                      "null"
                    ]
                  },
                  "order_offer_upsell": {
                    "type": "boolean"
                  },
                  "parent_order_offer_id": {
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
                  "charge_timeframe_name": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "offer_cycle_multiple_shipments_count": {
                    "type": "integer"
                  },
                  "fulfillment_delay_timeframe_id": {
                    "type": [
                      "integer",
                      "null"
                    ]
                  },
                  "total_shipments_count": {
                    "type": "integer"
                  },
                  "shipped_shipments_count": {
                    "type": "integer"
                  },
                  "current_shipment_prepaid_cycle": {
                    "type": [
                      "integer",
                      "null"
                    ]
                  },
                  "current_shipment_id": {
                    "type": [
                      "integer",
                      "null"
                    ]
                  },
                  "connection_status_type_name": {
                    "type": "string"
                  },
                  "last_recurring_date": {
                    "type": [
                      "string",
                      "null"
                    ],
                    "format": "date-time",
                    "examples": [
                      "2023-04-01 00:00:00"
                    ]
                  },
                  "last_recurring_amount": {
                    "type": "string",
                    "pattern": "^\\d*(\\.\\d{0,2})?$",
                    "default": "0.00"
                  },
                  "next_recurring_date": {
                    "type": [
                      "string",
                      "null"
                    ],
                    "format": "date-time",
                    "examples": [
                      "2023-04-01 00:00:00"
                    ]
                  },
                  "next_recurring_amount": {
                    "type": "string",
                    "pattern": "^\\d*(\\.\\d{0,2})?$",
                    "default": "0.00"
                  },
                  "next_recurring_price": {
                    "type": "string",
                    "pattern": "^\\d*(\\.\\d{0,2})?$",
                    "default": "0.00"
                  },
                  "next_recurring_charge": {
                    "type": [
                      "integer",
                      "null"
                    ]
                  },
                  "next_recurring_last_four": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "extra_fields": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "order_offer_notes": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "order_offer_shipments": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "shipment_id": {
                          "type": "integer"
                        },
                        "connection_shipment_id": {
                          "type": [
                            "string",
                            "null"
                          ]
                        },
                        "customer_id": {
                          "type": "integer"
                        },
                        "order_id": {
                          "type": "integer"
                        },
                        "shipment_prepaid_cycle": {
                          "type": "integer"
                        },
                        "shipment_status_id": {
                          "type": "integer",
                          "title": "Shipment Status",
                          "enum": [
                            1,
                            2,
                            3,
                            4,
                            5,
                            6,
                            7,
                            8,
                            9
                          ],
                          "description": "* `1` - Pending Post\n* `2` - Pending Tracking\n* `3` - Cancelled\n* `4` - Shipped\n* `5` - Error\n* `6` - Delivered\n* `7` - Declined\n* `8` - Pending Transaction\n* `9` - Skipped\t\n\n`1` `2` `3` `4` `5` `6` `7` `8` `9`"
                        },
                        "transaction_charge_id": {
                          "type": "integer"
                        },
                        "connection_id": {
                          "type": [
                            "integer",
                            "null"
                          ]
                        },
                        "fulfillment_id": {
                          "type": [
                            "string",
                            "null"
                          ]
                        },
                        "shipment_tracking_id": {
                          "type": [
                            "string",
                            "null"
                          ]
                        },
                        "carrier_id": {
                          "type": [
                            "integer",
                            "null"
                          ],
                          "title": "Carriers",
                          "enum": [
                            null,
                            1,
                            2,
                            3,
                            4,
                            5,
                            6,
                            8,
                            9
                          ],
                          "description": "* `1` - USPS\n* `2` - UPS\n* `3` - FedEx\n* `4` - DHL eCommerce\n* `5` - UPS Mail Innovations\n* `6` - Canada Post\n* `8` - Australia Post\n* `9` - Hermes\n\n`null` `1` `2` `3` `4` `5` `6` `8` `9`"
                        },
                        "shipping_profile_id": {
                          "type": [
                            "integer",
                            "null"
                          ]
                        },
                        "date_cancel": {
                          "type": [
                            "string",
                            "null"
                          ],
                          "format": "date-time",
                          "examples": [
                            "2023-04-01 00:00:00"
                          ]
                        },
                        "date_scheduled": {
                          "type": "string",
                          "format": "date-time",
                          "examples": [
                            "2023-04-01 00:00:00"
                          ]
                        },
                        "date_complete": {
                          "type": [
                            "string",
                            "null"
                          ],
                          "format": "date-time",
                          "examples": [
                            "2023-04-01 00:00:00"
                          ]
                        },
                        "date_scan": {
                          "type": [
                            "string",
                            "null"
                          ],
                          "format": "date-time",
                          "examples": [
                            "2023-04-01 00:00:00"
                          ]
                        },
                        "date_deliver": {
                          "type": [
                            "string",
                            "null"
                          ],
                          "format": "date-time",
                          "examples": [
                            "2023-04-01 00:00:00"
                          ]
                        },
                        "date_return": {
                          "type": [
                            "string",
                            "null"
                          ],
                          "format": "date-time",
                          "examples": [
                            "2023-04-01 00:00:00"
                          ]
                        },
                        "date_skip": {
                          "type": [
                            "string",
                            "null"
                          ],
                          "format": "date-time",
                          "examples": [
                            "2023-04-01 00:00:00"
                          ]
                        },
                        "date_rma": {
                          "type": [
                            "string",
                            "null"
                          ],
                          "format": "date-time",
                          "examples": [
                            "2023-04-01 00:00:00"
                          ]
                        },
                        "shipment_rma": {
                          "type": [
                            "string",
                            "null"
                          ]
                        },
                        "cancel_type_id": {
                          "type": [
                            "integer",
                            "null"
                          ]
                        },
                        "skip_type_id": {
                          "type": [
                            "integer",
                            "null"
                          ]
                        },
                        "shipping_reship_type_id": {
                          "type": [
                            "integer",
                            "null"
                          ],
                          "title": "Shipping reship types",
                          "enum": [
                            null,
                            1,
                            2,
                            3,
                            4
                          ],
                          "description": "* `1` - Did not receive package\n* `2` - Damaged Items\n* `3` - Items Incorrect\n* `4` - Quantity Incorrect\n\n`null` `1` `2` `3` `4`"
                        },
                        "shipment_parent_type_id": {
                          "type": [
                            "integer",
                            "null"
                          ],
                          "title": "Shipment parent types",
                          "enum": [
                            null,
                            1,
                            2,
                            3,
                            4
                          ],
                          "description": "* `1` - Reship\n* `2` - Reward\n* `3` - Gift\n* `4` - Free\n\n`null` `1` `2` `3` `4`"
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
                        "shipment_notes": {
                          "type": [
                            "string",
                            "null"
                          ]
                        },
                        "connection_request_text": {
                          "type": [
                            "string",
                            "null"
                          ]
                        },
                        "connection_response_text": {
                          "type": [
                            "string",
                            "null"
                          ]
                        },
                        "shipment_items": {
                          "type": "array",
                          "items": {
                            "type": "object",
                            "properties": {
                              "shipment_item_id": {
                                "type": "integer"
                              },
                              "quantity": {
                                "type": "integer"
                              },
                              "item_id": {
                                "type": "integer"
                              },
                              "item_name": {
                                "type": "string"
                              },
                              "item_description": {
                                "type": [
                                  "string",
                                  "null"
                                ]
                              },
                              "item_additional_description": {
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
                              "shipment_item_sku": {
                                "type": [
                                  "string",
                                  "null"
                                ]
                              },
                              "items_option_variation_id": {
                                "type": [
                                  "integer",
                                  "null"
                                ]
                              }
                            }
                          }
                        }
                      }
                    }
                  },
                  "order_offer_items": {
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
                        }
                      }
                    }
                  },
                  "order_offer_gifts": {
                    "type": "array",
                    "items": {
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
                      }
                    }
                  }
                }
              }
            },
            "customer_card": {
              "type": [
                "object",
                "null"
              ],
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
          }
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
export default PostOrdersIdCapture
