import type * as types from './types.js';
import type { ConfigOptions, FetchResponse } from '@readme/api-core/types';
import APICore from '@readme/api-core';
import definition from '../openapi.json' with {
  type: 'json'
};

export default class SDK {
  core: APICore;

  constructor() {
    this.core = new APICore(definition, 'vrio-api/1.0 (api/7.0.2)');
  }

  /**
   * Optionally configure various options that the SDK allows.
   *
   * @param config Object of supported SDK options and toggles.
   * @param config.timeout Override the default `fetch` request timeout of 30 seconds. This number
   * should be represented in milliseconds.
   */
  config(config: ConfigOptions) {
    this.core.setConfig(config);
  }

  /**
   * If the API you're using requires authentication you can supply the required credentials
   * through this method and the library will magically determine how they should be used
   * within your API request.
   *
   * With the exception of OpenID and MutualTLS, it supports all forms of authentication
   * supported by the OpenAPI specification.
   *
   * @example <caption>HTTP Basic auth</caption>
   * sdk.auth('username', 'password');
   *
   * @example <caption>Bearer tokens (HTTP or OAuth 2)</caption>
   * sdk.auth('myBearerToken');
   *
   * @example <caption>API Keys</caption>
   * sdk.auth('myApiKey');
   *
   * @see {@link https://spec.openapis.org/oas/v3.0.3#fixed-fields-22}
   * @see {@link https://spec.openapis.org/oas/v3.1.0#fixed-fields-22}
   * @param values Your auth credentials for the API; can specify up to two strings or numbers.
   */
  auth(...values: string[] | number[]) {
    this.core.setAuth(...values);
    return this;
  }

  /**
   * If the API you're using offers alternate server URLs, and server variables, you can tell
   * the SDK which one to use with this method. To use it you can supply either one of the
   * server URLs that are contained within the OpenAPI definition (along with any server
   * variables), or you can pass it a fully qualified URL to use (that may or may not exist
   * within the OpenAPI definition).
   *
   * @example <caption>Server URL with server variables</caption>
   * sdk.server('https://{region}.api.example.com/{basePath}', {
   *   name: 'eu',
   *   basePath: 'v14',
   * });
   *
   * @example <caption>Fully qualified server URL</caption>
   * sdk.server('https://eu.api.example.com/v14');
   *
   * @param url Server URL
   * @param variables An object of variables to replace into the server URL.
   */
  server(url: string, variables = {}) {
    this.core.setServer(url, variables);
  }

  /**
   * Return detailed information on specific customer criteria.
   *
   * @summary Search customers
   * @throws FetchError<401, types.GetCustomersResponse401> Unauthorized response
   * @throws FetchError<403, types.GetCustomersResponse403> Forbidden response
   * @throws FetchError<413, types.GetCustomersResponse413> Payload Too Large response
   * @throws FetchError<500, types.GetCustomersResponse500> Error response
   */
  get_customers(metadata?: types.GetCustomersMetadataParam): Promise<FetchResponse<200, types.GetCustomersResponse200>> {
    return this.core.fetch('/customers', 'get', metadata);
  }

  /**
   * Add new customer
   *
   * @summary Create customer
   * @throws FetchError<400, types.PostCustomersResponse400> Error response
   * @throws FetchError<401, types.PostCustomersResponse401> Unauthorized response
   * @throws FetchError<403, types.PostCustomersResponse403> Forbidden response
   * @throws FetchError<500, types.PostCustomersResponse500> Error response
   */
  post_customers(body: types.PostCustomersBodyParam): Promise<FetchResponse<200, types.PostCustomersResponse200>> {
    return this.core.fetch('/customers', 'post', body);
  }

  /**
   * Get customer by id
   *
   * @summary Get a customer
   * @throws FetchError<401, types.CustomersIdResponse401> Unauthorized response
   * @throws FetchError<403, types.CustomersIdResponse403> Forbidden response
   * @throws FetchError<404, types.CustomersIdResponse404> Not Found response
   * @throws FetchError<500, types.CustomersIdResponse500> Error response
   */
  customers_id(metadata: types.CustomersIdMetadataParam): Promise<FetchResponse<200, types.CustomersIdResponse200>> {
    return this.core.fetch('/customers/{customer_id}', 'get', metadata);
  }

  /**
   * Edit customer
   *
   * @summary Edit customer
   * @throws FetchError<400, types.PatchCustomersIdResponse400> Error response
   * @throws FetchError<401, types.PatchCustomersIdResponse401> Unauthorized response
   * @throws FetchError<403, types.PatchCustomersIdResponse403> Forbidden response
   * @throws FetchError<500, types.PatchCustomersIdResponse500> Error response
   */
  patch_customers_id(body: types.PatchCustomersIdBodyParam, metadata: types.PatchCustomersIdMetadataParam): Promise<FetchResponse<200, types.PatchCustomersIdResponse200>>;
  patch_customers_id(metadata: types.PatchCustomersIdMetadataParam): Promise<FetchResponse<200, types.PatchCustomersIdResponse200>>;
  patch_customers_id(body?: types.PatchCustomersIdBodyParam | types.PatchCustomersIdMetadataParam, metadata?: types.PatchCustomersIdMetadataParam): Promise<FetchResponse<200, types.PatchCustomersIdResponse200>> {
    return this.core.fetch('/customers/{customer_id}', 'patch', body, metadata);
  }

  /**
   * Add new customer address
   *
   * @summary Create customer address
   * @throws FetchError<400, types.PostCustomersIdAddressesResponse400> Error response
   * @throws FetchError<401, types.PostCustomersIdAddressesResponse401> Unauthorized response
   * @throws FetchError<403, types.PostCustomersIdAddressesResponse403> Forbidden response
   * @throws FetchError<500, types.PostCustomersIdAddressesResponse500> Error response
   */
  post_customers_id_addresses(body: types.PostCustomersIdAddressesBodyParam, metadata: types.PostCustomersIdAddressesMetadataParam): Promise<FetchResponse<200, types.PostCustomersIdAddressesResponse200>> {
    return this.core.fetch('/customers/{customer_id}/addresses', 'post', body, metadata);
  }

  /**
   * Add new customer card. When a new card is added, Vrio will attempt an authorization on
   * merchants for pending transactions to tokenize the card for recurring transactions.
   *
   * @summary Create customer card
   * @throws FetchError<400, types.PostCustomersIdCardsResponse400> Error response
   * @throws FetchError<401, types.PostCustomersIdCardsResponse401> Unauthorized response
   * @throws FetchError<403, types.PostCustomersIdCardsResponse403> Forbidden response
   * @throws FetchError<500, types.PostCustomersIdCardsResponse500> Error response
   */
  post_customers_id_cards(body: types.PostCustomersIdCardsBodyParam, metadata: types.PostCustomersIdCardsMetadataParam): Promise<FetchResponse<200, types.PostCustomersIdCardsResponse200>> {
    return this.core.fetch('/customers/{customer_id}/cards', 'post', body, metadata);
  }

  /**
   * Delete a customer card
   *
   * @summary Delete customer card
   * @throws FetchError<400, types.DeleteCustomersIdCardsCardIdResponse400> Error response
   * @throws FetchError<401, types.DeleteCustomersIdCardsCardIdResponse401> Unauthorized response
   * @throws FetchError<403, types.DeleteCustomersIdCardsCardIdResponse403> Forbidden response
   * @throws FetchError<500, types.DeleteCustomersIdCardsCardIdResponse500> Error response
   */
  delete_customers_id_cards_card_id(metadata: types.DeleteCustomersIdCardsCardIdMetadataParam): Promise<FetchResponse<number, unknown>> {
    return this.core.fetch('/customers/{customer_id}/cards/{customer_card_id}', 'delete', metadata);
  }

  /**
   * Get customer balance
   *
   * @summary Get customer balance
   * @throws FetchError<401, types.GetCustomersIdBalanceResponse401> Unauthorized response
   * @throws FetchError<403, types.GetCustomersIdBalanceResponse403> Forbidden response
   * @throws FetchError<500, types.GetCustomersIdBalanceResponse500> Error response
   */
  get_customers_id_balance(metadata: types.GetCustomersIdBalanceMetadataParam): Promise<FetchResponse<200, types.GetCustomersIdBalanceResponse200>> {
    return this.core.fetch('/customers/{customer_id}/balance', 'get', metadata);
  }

  /**
   * Edit a store credit entry
   *
   * @summary Edit store credit
   * @throws FetchError<400, types.PatchCustomersIdBalanceIdResponse400> Error response
   * @throws FetchError<401, types.PatchCustomersIdBalanceIdResponse401> Unauthorized response
   * @throws FetchError<403, types.PatchCustomersIdBalanceIdResponse403> Forbidden response
   * @throws FetchError<404, types.PatchCustomersIdBalanceIdResponse404> Not Found response
   * @throws FetchError<500, types.PatchCustomersIdBalanceIdResponse500> Error response
   */
  patch_customers_id_balance_id(body: types.PatchCustomersIdBalanceIdBodyParam, metadata: types.PatchCustomersIdBalanceIdMetadataParam): Promise<FetchResponse<200, types.PatchCustomersIdBalanceIdResponse200>>;
  patch_customers_id_balance_id(metadata: types.PatchCustomersIdBalanceIdMetadataParam): Promise<FetchResponse<200, types.PatchCustomersIdBalanceIdResponse200>>;
  patch_customers_id_balance_id(body?: types.PatchCustomersIdBalanceIdBodyParam | types.PatchCustomersIdBalanceIdMetadataParam, metadata?: types.PatchCustomersIdBalanceIdMetadataParam): Promise<FetchResponse<200, types.PatchCustomersIdBalanceIdResponse200>> {
    return this.core.fetch('/customers/{customer_id}/balance/{balance_history_id}', 'patch', body, metadata);
  }

  /**
   * Add Credit
   *
   * @summary Add Credit
   * @throws FetchError<400, types.PostCustomersIdCreditsResponse400> Error response
   * @throws FetchError<401, types.PostCustomersIdCreditsResponse401> Unauthorized response
   * @throws FetchError<403, types.PostCustomersIdCreditsResponse403> Forbidden response
   * @throws FetchError<500, types.PostCustomersIdCreditsResponse500> Error response
   */
  post_customers_id_credits(body: types.PostCustomersIdCreditsBodyParam, metadata: types.PostCustomersIdCreditsMetadataParam): Promise<FetchResponse<200, types.PostCustomersIdCreditsResponse200>> {
    return this.core.fetch('/customers/{customer_id}/credits', 'post', body, metadata);
  }

  /**
   * Search line items
   *
   * @summary Search line items
   * @throws FetchError<401, types.GetLineItemsResponse401> Unauthorized response
   * @throws FetchError<403, types.GetLineItemsResponse403> Forbidden response
   * @throws FetchError<413, types.GetLineItemsResponse413> Payload Too Large response
   * @throws FetchError<500, types.GetLineItemsResponse500> Error response
   */
  get_line_items(metadata?: types.GetLineItemsMetadataParam): Promise<FetchResponse<200, types.GetLineItemsResponse200>> {
    return this.core.fetch('/line_items', 'get', metadata);
  }

  /**
   * &nbsp;
   *
   * @summary Search order offers
   * @throws FetchError<401, types.GetOrderOffersResponse401> Unauthorized response
   * @throws FetchError<403, types.GetOrderOffersResponse403> Forbidden response
   * @throws FetchError<413, types.GetOrderOffersResponse413> Payload Too Large response
   * @throws FetchError<500, types.GetOrderOffersResponse500> Error response
   */
  get_order_offers(metadata?: types.GetOrderOffersMetadataParam): Promise<FetchResponse<200, types.GetOrderOffersResponse200>> {
    return this.core.fetch('/order_offers', 'get', metadata);
  }

  /**
   * Add new order offer(s) to an existing order. Order offers are the individual line items
   * of an order. The essential components of an Order Offer is: Price, billing schedule and
   * shipment details
   *
   * @summary Add an order offer
   * @throws FetchError<400, types.PostOrderOffersResponse400> Error response
   * @throws FetchError<401, types.PostOrderOffersResponse401> Unauthorized response
   * @throws FetchError<403, types.PostOrderOffersResponse403> Forbidden response
   * @throws FetchError<500, types.PostOrderOffersResponse500> Error response
   */
  post_order_offers(body: types.PostOrderOffersBodyParam): Promise<FetchResponse<200, types.PostOrderOffersResponse200>> {
    return this.core.fetch('/order_offers', 'post', body);
  }

  /**
   * &nbsp;
   *
   * @summary Get an order offer
   * @throws FetchError<401, types.OrderOffersIdResponse401> Unauthorized response
   * @throws FetchError<403, types.OrderOffersIdResponse403> Forbidden response
   * @throws FetchError<404, types.OrderOffersIdResponse404> Not Found response
   * @throws FetchError<500, types.OrderOffersIdResponse500> Error response
   */
  order_offers_id(metadata: types.OrderOffersIdMetadataParam): Promise<FetchResponse<200, types.OrderOffersIdResponse200>> {
    return this.core.fetch('/order_offers/{order_offer_id}', 'get', metadata);
  }

  /**
   * &nbsp;
   *
   * @summary Update an order offer
   * @throws FetchError<400, types.PatchOrderOffersIdResponse400> Error response
   * @throws FetchError<401, types.PatchOrderOffersIdResponse401> Unauthorized response
   * @throws FetchError<403, types.PatchOrderOffersIdResponse403> Forbidden response
   * @throws FetchError<500, types.PatchOrderOffersIdResponse500> Error response
   */
  patch_order_offers_id(body: types.PatchOrderOffersIdBodyParam, metadata: types.PatchOrderOffersIdMetadataParam): Promise<FetchResponse<200, types.PatchOrderOffersIdResponse200>> {
    return this.core.fetch('/order_offers/{order_offer_id}', 'patch', body, metadata);
  }

  /**
   * Edit order offer map. Mapped offers relate to Retention Settings when utilizing a parent
   * child relationship between unique offers. This feature is specific to analytics only.
   * See more on Retention Settings <a
   * href='https://sublytics.zendesk.com/hc/en-us/articles/4415981616397-Retention-Settings'
   * target='_blank'>here</a>.
   *
   * @summary Edit mapped status
   * @throws FetchError<400, types.PutOrderOffersIdMapResponse400> Error response
   * @throws FetchError<401, types.PutOrderOffersIdMapResponse401> Unauthorized response
   * @throws FetchError<403, types.PutOrderOffersIdMapResponse403> Forbidden response
   * @throws FetchError<500, types.PutOrderOffersIdMapResponse500> Error response
   */
  put_order_offers_id_map(body: types.PutOrderOffersIdMapBodyParam, metadata: types.PutOrderOffersIdMapMetadataParam): Promise<FetchResponse<200, types.PutOrderOffersIdMapResponse200>> {
    return this.core.fetch('/order_offers/{order_offer_id}/map', 'put', body, metadata);
  }

  /**
   * &nbsp;
   *
   * @summary Cancel an order offer
   * @throws FetchError<400, types.PostOrderOffersIdCancelResponse400> Error response
   * @throws FetchError<401, types.PostOrderOffersIdCancelResponse401> Unauthorized response
   * @throws FetchError<403, types.PostOrderOffersIdCancelResponse403> Forbidden response
   * @throws FetchError<500, types.PostOrderOffersIdCancelResponse500> Error response
   */
  post_order_offers_id_cancel(body: types.PostOrderOffersIdCancelBodyParam, metadata: types.PostOrderOffersIdCancelMetadataParam): Promise<FetchResponse<200, types.PostOrderOffersIdCancelResponse200>> {
    return this.core.fetch('/order_offers/{order_offer_id}/cancel', 'post', body, metadata);
  }

  /**
   * &nbsp;
   *
   * @summary Reactivate an order offer
   * @throws FetchError<400, types.PostOrderOffersIdReactivateResponse400> Error response
   * @throws FetchError<401, types.PostOrderOffersIdReactivateResponse401> Unauthorized response
   * @throws FetchError<403, types.PostOrderOffersIdReactivateResponse403> Forbidden response
   * @throws FetchError<500, types.PostOrderOffersIdReactivateResponse500> Error response
   */
  post_order_offers_id_reactivate(body: types.PostOrderOffersIdReactivateBodyParam, metadata: types.PostOrderOffersIdReactivateMetadataParam): Promise<FetchResponse<200, types.PostOrderOffersIdReactivateResponse200>>;
  post_order_offers_id_reactivate(metadata: types.PostOrderOffersIdReactivateMetadataParam): Promise<FetchResponse<200, types.PostOrderOffersIdReactivateResponse200>>;
  post_order_offers_id_reactivate(body?: types.PostOrderOffersIdReactivateBodyParam | types.PostOrderOffersIdReactivateMetadataParam, metadata?: types.PostOrderOffersIdReactivateMetadataParam): Promise<FetchResponse<200, types.PostOrderOffersIdReactivateResponse200>> {
    return this.core.fetch('/order_offers/{order_offer_id}/reactivate', 'post', body, metadata);
  }

  /**
   * Pause an existing order offer. This is a configurable option within the Offer setup.
   *
   * @summary Pause an order offer
   * @throws FetchError<400, types.PostOrderOffersIdPauseResponse400> Error response
   * @throws FetchError<401, types.PostOrderOffersIdPauseResponse401> Unauthorized response
   * @throws FetchError<403, types.PostOrderOffersIdPauseResponse403> Forbidden response
   * @throws FetchError<500, types.PostOrderOffersIdPauseResponse500> Error response
   */
  post_order_offers_id_pause(body: types.PostOrderOffersIdPauseBodyParam, metadata: types.PostOrderOffersIdPauseMetadataParam): Promise<FetchResponse<200, types.PostOrderOffersIdPauseResponse200>>;
  post_order_offers_id_pause(metadata: types.PostOrderOffersIdPauseMetadataParam): Promise<FetchResponse<200, types.PostOrderOffersIdPauseResponse200>>;
  post_order_offers_id_pause(body?: types.PostOrderOffersIdPauseBodyParam | types.PostOrderOffersIdPauseMetadataParam, metadata?: types.PostOrderOffersIdPauseMetadataParam): Promise<FetchResponse<200, types.PostOrderOffersIdPauseResponse200>> {
    return this.core.fetch('/order_offers/{order_offer_id}/pause', 'post', body, metadata);
  }

  /**
   * Add a new free shipment for an existing order offer.
   *
   * @summary Add a shipment to an order offer
   * @throws FetchError<400, types.PostOrderOffersIdShipmentResponse400> Error response
   * @throws FetchError<401, types.PostOrderOffersIdShipmentResponse401> Unauthorized response
   * @throws FetchError<403, types.PostOrderOffersIdShipmentResponse403> Forbidden response
   * @throws FetchError<500, types.PostOrderOffersIdShipmentResponse500> Error response
   */
  post_order_offers_id_shipment(body: types.PostOrderOffersIdShipmentBodyParam, metadata: types.PostOrderOffersIdShipmentMetadataParam): Promise<FetchResponse<200, types.PostOrderOffersIdShipmentResponse200>>;
  post_order_offers_id_shipment(metadata: types.PostOrderOffersIdShipmentMetadataParam): Promise<FetchResponse<200, types.PostOrderOffersIdShipmentResponse200>>;
  post_order_offers_id_shipment(body?: types.PostOrderOffersIdShipmentBodyParam | types.PostOrderOffersIdShipmentMetadataParam, metadata?: types.PostOrderOffersIdShipmentMetadataParam): Promise<FetchResponse<200, types.PostOrderOffersIdShipmentResponse200>> {
    return this.core.fetch('/order_offers/{order_offer_id}/shipment', 'post', body, metadata);
  }

  /**
   * Unpause an exisitng order offer. This is applicable if the Offer is configured to allow
   * pausing.
   *
   * @summary Unpause an order offer
   * @throws FetchError<400, types.PostOrderOffersIdUnpauseResponse400> Error response
   * @throws FetchError<401, types.PostOrderOffersIdUnpauseResponse401> Unauthorized response
   * @throws FetchError<403, types.PostOrderOffersIdUnpauseResponse403> Forbidden response
   * @throws FetchError<500, types.PostOrderOffersIdUnpauseResponse500> Error response
   */
  post_order_offers_id_unpause(body: types.PostOrderOffersIdUnpauseBodyParam, metadata: types.PostOrderOffersIdUnpauseMetadataParam): Promise<FetchResponse<200, types.PostOrderOffersIdUnpauseResponse200>>;
  post_order_offers_id_unpause(metadata: types.PostOrderOffersIdUnpauseMetadataParam): Promise<FetchResponse<200, types.PostOrderOffersIdUnpauseResponse200>>;
  post_order_offers_id_unpause(body?: types.PostOrderOffersIdUnpauseBodyParam | types.PostOrderOffersIdUnpauseMetadataParam, metadata?: types.PostOrderOffersIdUnpauseMetadataParam): Promise<FetchResponse<200, types.PostOrderOffersIdUnpauseResponse200>> {
    return this.core.fetch('/order_offers/{order_offer_id}/unpause', 'post', body, metadata);
  }

  /**
   * &nbsp;
   *
   * @summary Expire an order offer
   * @throws FetchError<400, types.PostOrderOffersIdExpireResponse400> Error response
   * @throws FetchError<401, types.PostOrderOffersIdExpireResponse401> Unauthorized response
   * @throws FetchError<403, types.PostOrderOffersIdExpireResponse403> Forbidden response
   * @throws FetchError<500, types.PostOrderOffersIdExpireResponse500> Error response
   */
  post_order_offers_id_expire(body: types.PostOrderOffersIdExpireBodyParam, metadata: types.PostOrderOffersIdExpireMetadataParam): Promise<FetchResponse<200, types.PostOrderOffersIdExpireResponse200>>;
  post_order_offers_id_expire(metadata: types.PostOrderOffersIdExpireMetadataParam): Promise<FetchResponse<200, types.PostOrderOffersIdExpireResponse200>>;
  post_order_offers_id_expire(body?: types.PostOrderOffersIdExpireBodyParam | types.PostOrderOffersIdExpireMetadataParam, metadata?: types.PostOrderOffersIdExpireMetadataParam): Promise<FetchResponse<200, types.PostOrderOffersIdExpireResponse200>> {
    return this.core.fetch('/order_offers/{order_offer_id}/expire', 'post', body, metadata);
  }

  /**
   * Get available offer swap options configured for an order offer. This is configured
   * within the original offer and determines what swap options are available.
   *
   * @summary Get swap options
   * @throws FetchError<400, types.GetOrderOffersIdSwapOptionsResponse400> Error response
   * @throws FetchError<401, types.GetOrderOffersIdSwapOptionsResponse401> Unauthorized response
   * @throws FetchError<403, types.GetOrderOffersIdSwapOptionsResponse403> Forbidden response
   * @throws FetchError<500, types.GetOrderOffersIdSwapOptionsResponse500> Error response
   */
  get_order_offers_id_swap_options(metadata: types.GetOrderOffersIdSwapOptionsMetadataParam): Promise<FetchResponse<200, types.GetOrderOffersIdSwapOptionsResponse200>> {
    return this.core.fetch('/order_offers/{order_offer_id}/swap_options', 'get', metadata);
  }

  /**
   * Swap from an existing Offer to a new offer. This is based on the available swap options
   * of the existing offer.
   *
   * @summary Swap an order offer
   * @throws FetchError<400, types.PostOrderOffersIdSwapResponse400> Error response
   * @throws FetchError<401, types.PostOrderOffersIdSwapResponse401> Unauthorized response
   * @throws FetchError<403, types.PostOrderOffersIdSwapResponse403> Forbidden response
   * @throws FetchError<500, types.PostOrderOffersIdSwapResponse500> Error response
   */
  post_order_offers_id_swap(body: types.PostOrderOffersIdSwapBodyParam, metadata: types.PostOrderOffersIdSwapMetadataParam): Promise<FetchResponse<200, types.PostOrderOffersIdSwapResponse200>> {
    return this.core.fetch('/order_offers/{order_offer_id}/swap', 'post', body, metadata);
  }

  /**
   * Swap the item on an order offer
   *
   * @summary Swap an order offer item
   * @throws FetchError<400, types.PostOrderOffersIdSwapItemResponse400> Error response
   * @throws FetchError<401, types.PostOrderOffersIdSwapItemResponse401> Unauthorized response
   * @throws FetchError<403, types.PostOrderOffersIdSwapItemResponse403> Forbidden response
   * @throws FetchError<500, types.PostOrderOffersIdSwapItemResponse500> Error response
   */
  post_order_offers_id_swap_item(body: types.PostOrderOffersIdSwapItemBodyParam, metadata: types.PostOrderOffersIdSwapItemMetadataParam): Promise<FetchResponse<200, types.PostOrderOffersIdSwapItemResponse200>> {
    return this.core.fetch('/order_offers/{order_offer_id}/swap_item', 'post', body, metadata);
  }

  /**
   * Get available offer frequency change options configured for an order offer. This is
   * configured within the original Offer and determines what frequencies are available.
   *
   * @summary Get frequency options
   * @throws FetchError<400, types.GetOrderOffersIdFrequencyOptionsResponse400> Error response
   * @throws FetchError<401, types.GetOrderOffersIdFrequencyOptionsResponse401> Unauthorized response
   * @throws FetchError<403, types.GetOrderOffersIdFrequencyOptionsResponse403> Forbidden response
   * @throws FetchError<500, types.GetOrderOffersIdFrequencyOptionsResponse500> Error response
   */
  get_order_offers_id_frequency_options(metadata: types.GetOrderOffersIdFrequencyOptionsMetadataParam): Promise<FetchResponse<200, types.GetOrderOffersIdFrequencyOptionsResponse200>> {
    return this.core.fetch('/order_offers/{order_offer_id}/frequency_options', 'get', metadata);
  }

  /**
   * Edit the order offer frequency. Available frequency options are configured on the Offer.
   *
   * @summary Change order offer frequency
   * @throws FetchError<400, types.PutOrderOffersIdFreqencyResponse400> Error response
   * @throws FetchError<401, types.PutOrderOffersIdFreqencyResponse401> Unauthorized response
   * @throws FetchError<403, types.PutOrderOffersIdFreqencyResponse403> Forbidden response
   * @throws FetchError<500, types.PutOrderOffersIdFreqencyResponse500> Error response
   */
  put_order_offers_id_freqency(body: types.PutOrderOffersIdFreqencyBodyParam, metadata: types.PutOrderOffersIdFreqencyMetadataParam): Promise<FetchResponse<200, types.PutOrderOffersIdFreqencyResponse200>> {
    return this.core.fetch('/order_offers/{order_offer_id}/frequency', 'put', body, metadata);
  }

  /**
   * &nbsp;
   *
   * @summary Change order offer quantity
   * @throws FetchError<400, types.PutOrderOffersIdQuantityResponse400> Error response
   * @throws FetchError<401, types.PutOrderOffersIdQuantityResponse401> Unauthorized response
   * @throws FetchError<403, types.PutOrderOffersIdQuantityResponse403> Forbidden response
   * @throws FetchError<500, types.PutOrderOffersIdQuantityResponse500> Error response
   */
  put_order_offers_id_quantity(body: types.PutOrderOffersIdQuantityBodyParam, metadata: types.PutOrderOffersIdQuantityMetadataParam): Promise<FetchResponse<200, types.PutOrderOffersIdQuantityResponse200>> {
    return this.core.fetch('/order_offers/{order_offer_id}/quantity', 'put', body, metadata);
  }

  /**
   * Get the gift information related to an order offer.
   *
   * @summary Get order offer gift details
   * @throws FetchError<401, types.GetOrderOffersIdGiftResponse401> Unauthorized response
   * @throws FetchError<403, types.GetOrderOffersIdGiftResponse403> Forbidden response
   * @throws FetchError<500, types.GetOrderOffersIdGiftResponse500> Error response
   */
  get_order_offers_id_gift(metadata: types.GetOrderOffersIdGiftMetadataParam): Promise<FetchResponse<200, types.GetOrderOffersIdGiftResponse200>> {
    return this.core.fetch('/order_offers/{order_offer_id}/gift', 'get', metadata);
  }

  /**
   * Edit order offer gift details.
   *
   * @summary Edit order offer gift details
   * @throws FetchError<400, types.PatchOrderOffersIdGiftResponse400> Error response
   * @throws FetchError<401, types.PatchOrderOffersIdGiftResponse401> Unauthorized response
   * @throws FetchError<403, types.PatchOrderOffersIdGiftResponse403> Forbidden response
   * @throws FetchError<500, types.PatchOrderOffersIdGiftResponse500> Error response
   */
  patch_order_offers_id_gift(body: types.PatchOrderOffersIdGiftBodyParam, metadata: types.PatchOrderOffersIdGiftMetadataParam): Promise<FetchResponse<200, types.PatchOrderOffersIdGiftResponse200>>;
  patch_order_offers_id_gift(metadata: types.PatchOrderOffersIdGiftMetadataParam): Promise<FetchResponse<200, types.PatchOrderOffersIdGiftResponse200>>;
  patch_order_offers_id_gift(body?: types.PatchOrderOffersIdGiftBodyParam | types.PatchOrderOffersIdGiftMetadataParam, metadata?: types.PatchOrderOffersIdGiftMetadataParam): Promise<FetchResponse<200, types.PatchOrderOffersIdGiftResponse200>> {
    return this.core.fetch('/order_offers/{order_offer_id}/gift', 'patch', body, metadata);
  }

  /**
   * Resend order offer gift details.
   *
   * @summary Resend order offer gift
   * @throws FetchError<401, types.PostOrderOffersIdResendGiftResponse401> Unauthorized response
   * @throws FetchError<403, types.PostOrderOffersIdResendGiftResponse403> Forbidden response
   * @throws FetchError<500, types.PostOrderOffersIdResendGiftResponse500> Error response
   */
  post_order_offers_id_resend_gift(metadata: types.PostOrderOffersIdResendGiftMetadataParam): Promise<FetchResponse<200, types.PostOrderOffersIdResendGiftResponse200>> {
    return this.core.fetch('/order_offers/{order_offer_id}/resend_gift', 'post', metadata);
  }

  /**
   * Add note to an existing order offer.
   *
   * @summary Add notes
   * @throws FetchError<401, types.PostOrderOffersIdNotesResponse401> Unauthorized response
   * @throws FetchError<403, types.PostOrderOffersIdNotesResponse403> Forbidden response
   * @throws FetchError<500, types.PostOrderOffersIdNotesResponse500> Error response
   */
  post_order_offers_id_notes(body: types.PostOrderOffersIdNotesBodyParam, metadata: types.PostOrderOffersIdNotesMetadataParam): Promise<FetchResponse<200, types.PostOrderOffersIdNotesResponse200>> {
    return this.core.fetch('/order_offers/{order_offer_id}/notes', 'post', body, metadata);
  }

  /**
   * Search for specific order details or get all existing order details. Expand on the
   * information returned by including 'with' in the query parameters to include additional
   * details of the orders.
   *
   * @summary Search orders
   * @throws FetchError<401, types.GetOrdersResponse401> Unauthorized response
   * @throws FetchError<403, types.GetOrdersResponse403> Forbidden response
   * @throws FetchError<413, types.GetOrdersResponse413> Payload Too Large response
   * @throws FetchError<500, types.GetOrdersResponse500> Error response
   */
  get_orders(metadata?: types.GetOrdersMetadataParam): Promise<FetchResponse<200, types.GetOrdersResponse200>> {
    return this.core.fetch('/orders', 'get', metadata);
  }

  /**
   * Add a new order. A unique order can have one or multiple Offers, or line items,
   * associated with it.<br /><br />An order can be created and processed or authorized at
   * the same time. When passing an <strong>action</strong> value, there are more fields that
   * would be required on the order, these fields are tagged with <span
   * id='required-action'>required with action</span> and <span
   * id='conditionally-required-action'>conditionally required with action</span><br /><br
   * />When passing an <strong>action</strong> value, a <code>response_code=100</code> will
   * indicate that the charge has been processed successfully with the gateway and there is
   * no further action required. A <code>response_code=101</code> will indicate that there
   * are more actions that need to be done in order to complete the charge. This is typical
   * when using PayPal, AfterPay, Klarna or when using a 3 step redirect for 3DS
   * transactions. To complete the transaction you will need to use the
   * <code>/order/{order_id}/complete</code> method. Learn more <a
   * href='https://docs.vrio.com/docs/handling-101-response-codes' target='_blank'>here</a>.
   *
   * @summary Add an order
   * @throws FetchError<400, types.PostOrdersResponse400> Error response
   * @throws FetchError<401, types.PostOrdersResponse401> Unauthorized response
   * @throws FetchError<403, types.PostOrdersResponse403> Forbidden response
   * @throws FetchError<500, types.PostOrdersResponse500> Error response
   */
  post_orders(body: types.PostOrdersBodyParam): Promise<FetchResponse<200, types.PostOrdersResponse200>> {
    return this.core.fetch('/orders', 'post', body);
  }

  /**
   * Get order details by specific order ID. Query params will determine the level of order
   * details returned. Expand on the information returned by including 'with' in the query
   * parameters to include additional details of the orders. For multiple attributes,
   * separate with a comma (example : with=customer,order_offers) 
   *
   * @summary Get an order
   * @throws FetchError<401, types.OrdersIdResponse401> Unauthorized response
   * @throws FetchError<403, types.OrdersIdResponse403> Forbidden response
   * @throws FetchError<404, types.OrdersIdResponse404> Not Found response
   * @throws FetchError<500, types.OrdersIdResponse500> Error response
   */
  orders_id(metadata: types.OrdersIdMetadataParam): Promise<FetchResponse<200, types.OrdersIdResponse200>> {
    return this.core.fetch('/orders/{order_id}', 'get', metadata);
  }

  /**
   * Edit an existing order's information using the unique order ID
   *
   * @summary Edit an order
   * @throws FetchError<400, types.PatchOrdersIdResponse400> Error response
   * @throws FetchError<401, types.PatchOrdersIdResponse401> Unauthorized response
   * @throws FetchError<403, types.PatchOrdersIdResponse403> Forbidden response
   * @throws FetchError<500, types.PatchOrdersIdResponse500> Error response
   */
  patch_orders_id(body: types.PatchOrdersIdBodyParam, metadata: types.PatchOrdersIdMetadataParam): Promise<FetchResponse<200, types.PatchOrdersIdResponse200>>;
  patch_orders_id(metadata: types.PatchOrdersIdMetadataParam): Promise<FetchResponse<200, types.PatchOrdersIdResponse200>>;
  patch_orders_id(body?: types.PatchOrdersIdBodyParam | types.PatchOrdersIdMetadataParam, metadata?: types.PatchOrdersIdMetadataParam): Promise<FetchResponse<200, types.PatchOrdersIdResponse200>> {
    return this.core.fetch('/orders/{order_id}', 'patch', body, metadata);
  }

  /**
   * &nbsp;
   *
   * @summary Authorize an order
   * @throws FetchError<400, types.PostOrdersIdAuthorizeResponse400> Process Error response
   * @throws FetchError<401, types.PostOrdersIdAuthorizeResponse401> Unauthorized response
   * @throws FetchError<403, types.PostOrdersIdAuthorizeResponse403> Forbidden response
   * @throws FetchError<500, types.PostOrdersIdAuthorizeResponse500> Error response
   */
  post_orders_id_authorize(body: types.PostOrdersIdAuthorizeBodyParam, metadata: types.PostOrdersIdAuthorizeMetadataParam): Promise<FetchResponse<200, types.PostOrdersIdAuthorizeResponse200>>;
  post_orders_id_authorize(metadata: types.PostOrdersIdAuthorizeMetadataParam): Promise<FetchResponse<200, types.PostOrdersIdAuthorizeResponse200>>;
  post_orders_id_authorize(body?: types.PostOrdersIdAuthorizeBodyParam | types.PostOrdersIdAuthorizeMetadataParam, metadata?: types.PostOrdersIdAuthorizeMetadataParam): Promise<FetchResponse<200, types.PostOrdersIdAuthorizeResponse200>> {
    return this.core.fetch('/orders/{order_id}/authorize', 'post', body, metadata);
  }

  /**
   * Capture an existing order that has already been authorized.
   *
   * @summary Capture an order
   * @throws FetchError<400, types.PostOrdersIdCaptureResponse400> Process Error response
   * @throws FetchError<401, types.PostOrdersIdCaptureResponse401> Unauthorized response
   * @throws FetchError<403, types.PostOrdersIdCaptureResponse403> Forbidden response
   * @throws FetchError<500, types.PostOrdersIdCaptureResponse500> Error response
   */
  post_orders_id_capture(metadata: types.PostOrdersIdCaptureMetadataParam): Promise<FetchResponse<200, types.PostOrdersIdCaptureResponse200>> {
    return this.core.fetch('/orders/{order_id}/capture', 'post', metadata);
  }

  /**
   * Note: A <code>response_code=100</code> will indicate that the charge has been processed
   * successfully with the gateway and there is no further action required. A
   * <code>response_code=101</code> will indicate that there are more actions that need to be
   * done in order to complete the charge. This is typical when using PayPal, AfterPay,
   * Klarna or when using a 3 step redirect for 3DS transactions. To complete the transaction
   * you will need to use the <code>/order/{order_id}/complete</code> method. Learn more <a
   * href='https://docs.vrio.com/docs/handling-101-response-codes' target='_blank'>here</a>.
   *
   * @summary Process an order
   * @throws FetchError<400, types.PostOrdersIdProcessResponse400> Process Error response
   * @throws FetchError<401, types.PostOrdersIdProcessResponse401> Unauthorized response
   * @throws FetchError<403, types.PostOrdersIdProcessResponse403> Forbidden response
   * @throws FetchError<500, types.PostOrdersIdProcessResponse500> Error response
   */
  post_orders_id_process(body: types.PostOrdersIdProcessBodyParam, metadata: types.PostOrdersIdProcessMetadataParam): Promise<FetchResponse<200, types.PostOrdersIdProcessResponse200>>;
  post_orders_id_process(metadata: types.PostOrdersIdProcessMetadataParam): Promise<FetchResponse<200, types.PostOrdersIdProcessResponse200>>;
  post_orders_id_process(body?: types.PostOrdersIdProcessBodyParam | types.PostOrdersIdProcessMetadataParam, metadata?: types.PostOrdersIdProcessMetadataParam): Promise<FetchResponse<200, types.PostOrdersIdProcessResponse200>> {
    return this.core.fetch('/orders/{order_id}/process', 'post', body, metadata);
  }

  /**
   * When a process call returns a 101 response, this method will be used to complete the
   * order.  This is typical when using PayPal, AfterPay, Klarna or when using a 3 step
   * redirect for 3DS transactions. Learn more <a
   * href='https://docs.vrio.com/docs/handling-101-response-codes' target='_blank'>here</a>.
   *
   * @summary Complete an order
   * @throws FetchError<400, types.PostOrdersIdCompleteResponse400> Process Error response
   * @throws FetchError<401, types.PostOrdersIdCompleteResponse401> Unauthorized response
   * @throws FetchError<403, types.PostOrdersIdCompleteResponse403> Forbidden response
   * @throws FetchError<500, types.PostOrdersIdCompleteResponse500> Error response
   */
  post_orders_id_complete(body: types.PostOrdersIdCompleteBodyParam, metadata: types.PostOrdersIdCompleteMetadataParam): Promise<FetchResponse<200, types.PostOrdersIdCompleteResponse200>> {
    return this.core.fetch('/orders/{order_id}/complete', 'post', body, metadata);
  }

  /**
   * &nbsp;
   *
   * @summary Add notes
   * @throws FetchError<401, types.PostOrdersIdNotesResponse401> Unauthorized response
   * @throws FetchError<403, types.PostOrdersIdNotesResponse403> Forbidden response
   * @throws FetchError<500, types.PostOrdersIdNotesResponse500> Error response
   */
  post_orders_id_notes(body: types.PostOrdersIdNotesBodyParam, metadata: types.PostOrdersIdNotesMetadataParam): Promise<FetchResponse<200, types.PostOrdersIdNotesResponse200>> {
    return this.core.fetch('/orders/{order_id}/notes', 'post', body, metadata);
  }

  /**
   * Get upsells available for an order.
   *
   * @summary Get order upsells
   * @throws FetchError<400, types.GetOrdersIdUpsellsResponse400> Error response
   * @throws FetchError<401, types.GetOrdersIdUpsellsResponse401> Unauthorized response
   * @throws FetchError<403, types.GetOrdersIdUpsellsResponse403> Forbidden response
   * @throws FetchError<500, types.GetOrdersIdUpsellsResponse500> Error response
   */
  get_orders_id_upsells(metadata: types.GetOrdersIdUpsellsMetadataParam): Promise<FetchResponse<200, types.GetOrdersIdUpsellsResponse200>> {
    return this.core.fetch('/orders/{order_id}/upsells', 'get', metadata);
  }

  /**
   * Search sales
   *
   * @summary Search sales
   * @throws FetchError<401, types.GetSalesResponse401> Unauthorized response
   * @throws FetchError<403, types.GetSalesResponse403> Forbidden response
   * @throws FetchError<413, types.GetSalesResponse413> Payload Too Large response
   * @throws FetchError<500, types.GetSalesResponse500> Error response
   */
  get_sales(metadata?: types.GetSalesMetadataParam): Promise<FetchResponse<200, types.GetSalesResponse200>> {
    return this.core.fetch('/sales', 'get', metadata);
  }

  /**
   * Get sale details by specific sale ID. Query params will determine the level of sale
   * details returned. Expand on the information returned by including 'with' in the query
   * parameters to include additional details of the sale. For multiple attributes, separate
   * with a comma (example : with=customer,transactions)
   *
   * @summary Get a sale
   * @throws FetchError<401, types.SalesIdResponse401> Unauthorized response
   * @throws FetchError<403, types.SalesIdResponse403> Forbidden response
   * @throws FetchError<500, types.SalesIdResponse500> Error response
   */
  sales_id(metadata: types.SalesIdMetadataParam): Promise<FetchResponse<200, types.SalesIdResponse200>> {
    return this.core.fetch('/sales/{sale_id}', 'get', metadata);
  }

  /**
   * Reprocess a sale where all transaction attempts have declined and is in the Failed
   * status.
   *
   * @summary Reprocess a sale
   * @throws FetchError<400, types.PostSalesIdReprocessResponse400> Process Error response
   * @throws FetchError<401, types.PostSalesIdReprocessResponse401> Unauthorized response
   * @throws FetchError<403, types.PostSalesIdReprocessResponse403> Forbidden response
   * @throws FetchError<500, types.PostSalesIdReprocessResponse500> Error response
   */
  post_sales_id_reprocess(body: types.PostSalesIdReprocessBodyParam, metadata: types.PostSalesIdReprocessMetadataParam): Promise<FetchResponse<200, types.PostSalesIdReprocessResponse200>>;
  post_sales_id_reprocess(metadata: types.PostSalesIdReprocessMetadataParam): Promise<FetchResponse<200, types.PostSalesIdReprocessResponse200>>;
  post_sales_id_reprocess(body?: types.PostSalesIdReprocessBodyParam | types.PostSalesIdReprocessMetadataParam, metadata?: types.PostSalesIdReprocessMetadataParam): Promise<FetchResponse<200, types.PostSalesIdReprocessResponse200>> {
    return this.core.fetch('/sales/{sale_id}/reprocess', 'post', body, metadata);
  }

  /**
   * Search transactions
   *
   * @summary Search transactions
   * @throws FetchError<401, types.GetTransactionsResponse401> Unauthorized response
   * @throws FetchError<403, types.GetTransactionsResponse403> Forbidden response
   * @throws FetchError<413, types.GetTransactionsResponse413> Payload Too Large response
   * @throws FetchError<500, types.GetTransactionsResponse500> Error response
   */
  get_transactions(metadata?: types.GetTransactionsMetadataParam): Promise<FetchResponse<200, types.GetTransactionsResponse200>> {
    return this.core.fetch('/transactions', 'get', metadata);
  }

  /**
   * Get transaction details by specific transaction ID. Query params will determine the
   * level of transaction details returned. Expand on the information returned by including
   * 'with' in the query parameters to include additional details of the transaction. For
   * multiple attributes, separate with a comma (example : with=sale,credits)
   *
   * @summary Get a transaction
   * @throws FetchError<401, types.TransactionsIdResponse401> Unauthorized response
   * @throws FetchError<403, types.TransactionsIdResponse403> Forbidden response
   * @throws FetchError<404, types.TransactionsIdResponse404> Not Found response
   * @throws FetchError<500, types.TransactionsIdResponse500> Error response
   */
  transactions_id(metadata: types.TransactionsIdMetadataParam): Promise<FetchResponse<200, types.TransactionsIdResponse200>> {
    return this.core.fetch('/transactions/{transaction_id}', 'get', metadata);
  }

  /**
   * This will override the existing scheduled date and process the charge immediately.
   *
   * @summary Process a transaction
   * @throws FetchError<400, types.PostTransactionsIdProcessResponse400> Process Error response
   * @throws FetchError<401, types.PostTransactionsIdProcessResponse401> Unauthorized response
   * @throws FetchError<403, types.PostTransactionsIdProcessResponse403> Forbidden response
   * @throws FetchError<500, types.PostTransactionsIdProcessResponse500> Error response
   */
  post_transactions_id_process(body: types.PostTransactionsIdProcessBodyParam, metadata: types.PostTransactionsIdProcessMetadataParam): Promise<FetchResponse<200, types.PostTransactionsIdProcessResponse200>>;
  post_transactions_id_process(metadata: types.PostTransactionsIdProcessMetadataParam): Promise<FetchResponse<200, types.PostTransactionsIdProcessResponse200>>;
  post_transactions_id_process(body?: types.PostTransactionsIdProcessBodyParam | types.PostTransactionsIdProcessMetadataParam, metadata?: types.PostTransactionsIdProcessMetadataParam): Promise<FetchResponse<200, types.PostTransactionsIdProcessResponse200>> {
    return this.core.fetch('/transactions/{transaction_id}/process', 'post', body, metadata);
  }

  /**
   * Process a refund on a transaction.
   *
   * @summary Refund a transaction
   * @throws FetchError<400, types.PostTransactionsIdRefundResponse400> Process Error response
   * @throws FetchError<401, types.PostTransactionsIdRefundResponse401> Unauthorized response
   * @throws FetchError<403, types.PostTransactionsIdRefundResponse403> Forbidden response
   * @throws FetchError<500, types.PostTransactionsIdRefundResponse500> Error response
   */
  post_transactions_id_refund(body: types.PostTransactionsIdRefundBodyParam, metadata: types.PostTransactionsIdRefundMetadataParam): Promise<FetchResponse<200, types.PostTransactionsIdRefundResponse200>> {
    return this.core.fetch('/transactions/{transaction_id}/refund', 'post', body, metadata);
  }

  /**
   * This is only available during the allotted timeframe allowed by the gateway to complete
   * a void.
   *
   * @summary Void a transaction
   * @throws FetchError<400, types.PostTransactionsIdVoidResponse400> Process Error response
   * @throws FetchError<401, types.PostTransactionsIdVoidResponse401> Unauthorized response
   * @throws FetchError<403, types.PostTransactionsIdVoidResponse403> Forbidden response
   * @throws FetchError<500, types.PostTransactionsIdVoidResponse500> Error response
   */
  post_transactions_id_void(body: types.PostTransactionsIdVoidBodyParam, metadata: types.PostTransactionsIdVoidMetadataParam): Promise<FetchResponse<200, types.PostTransactionsIdVoidResponse200>>;
  post_transactions_id_void(metadata: types.PostTransactionsIdVoidMetadataParam): Promise<FetchResponse<200, types.PostTransactionsIdVoidResponse200>>;
  post_transactions_id_void(body?: types.PostTransactionsIdVoidBodyParam | types.PostTransactionsIdVoidMetadataParam, metadata?: types.PostTransactionsIdVoidMetadataParam): Promise<FetchResponse<200, types.PostTransactionsIdVoidResponse200>> {
    return this.core.fetch('/transactions/{transaction_id}/void', 'post', body, metadata);
  }

  /**
   * By default, Vrio will flag the customer as Blacklisted and cancel any active order
   * offers associated with the charge.
   *
   * @summary Mark transaction as chargeback
   * @throws FetchError<400, types.PostTransactionsIdChargebackResponse400> Process Error response
   * @throws FetchError<401, types.PostTransactionsIdChargebackResponse401> Unauthorized response
   * @throws FetchError<403, types.PostTransactionsIdChargebackResponse403> Forbidden response
   * @throws FetchError<500, types.PostTransactionsIdChargebackResponse500> Error response
   */
  post_transactions_id_chargeback(body: types.PostTransactionsIdChargebackBodyParam, metadata: types.PostTransactionsIdChargebackMetadataParam): Promise<FetchResponse<200, types.PostTransactionsIdChargebackResponse200>> {
    return this.core.fetch('/transactions/{transaction_id}/chargeback', 'post', body, metadata);
  }

  /**
   * By default, Vrio will flag the customer as Blacklisted and cancel any active order
   * offers associated with the charge. Note - if the Alert Refund happens outside of the
   * gateway, leave refund_transaction=0. Learn more <a
   * href='https://vrio.zendesk.com/hc/en-us/articles/16089666241815-Disputes-Alert-Handling'
   * target='_blank'>here</a>.
   *
   * @summary Mark transaction as alert
   * @throws FetchError<400, types.PostTransactionsIdAlertResponse400> Process Error response
   * @throws FetchError<401, types.PostTransactionsIdAlertResponse401> Unauthorized response
   * @throws FetchError<403, types.PostTransactionsIdAlertResponse403> Forbidden response
   * @throws FetchError<500, types.PostTransactionsIdAlertResponse500> Error response
   */
  post_transactions_id_alert(body: types.PostTransactionsIdAlertBodyParam, metadata: types.PostTransactionsIdAlertMetadataParam): Promise<FetchResponse<200, types.PostTransactionsIdAlertResponse200>> {
    return this.core.fetch('/transactions/{transaction_id}/alert', 'post', body, metadata);
  }

  /**
   * This is only applicable when transaction status = scheduled or pending.
   *
   * @summary Edit a transaction schedule date
   * @throws FetchError<400, types.PostTransactionsIdScheduleResponse400> Error response
   * @throws FetchError<401, types.PostTransactionsIdScheduleResponse401> Unauthorized response
   * @throws FetchError<403, types.PostTransactionsIdScheduleResponse403> Forbidden response
   * @throws FetchError<500, types.PostTransactionsIdScheduleResponse500> Error response
   */
  post_transactions_id_schedule(body: types.PostTransactionsIdScheduleBodyParam, metadata: types.PostTransactionsIdScheduleMetadataParam): Promise<FetchResponse<200, types.PostTransactionsIdScheduleResponse200>> {
    return this.core.fetch('/transactions/{transaction_id}/schedule', 'post', body, metadata);
  }

  /**
   * This is a configurable option within the Offer Cycle setup This is only applicable if
   * configured and when transaction status = scheduled
   *
   * @summary Skip a transaction
   * @throws FetchError<400, types.PostTransactionsIdSkipResponse400> Error response
   * @throws FetchError<401, types.PostTransactionsIdSkipResponse401> Unauthorized response
   * @throws FetchError<403, types.PostTransactionsIdSkipResponse403> Forbidden response
   * @throws FetchError<500, types.PostTransactionsIdSkipResponse500> Error response
   */
  post_transactions_id_skip(body: types.PostTransactionsIdSkipBodyParam, metadata: types.PostTransactionsIdSkipMetadataParam): Promise<FetchResponse<200, types.PostTransactionsIdSkipResponse200>>;
  post_transactions_id_skip(metadata: types.PostTransactionsIdSkipMetadataParam): Promise<FetchResponse<200, types.PostTransactionsIdSkipResponse200>>;
  post_transactions_id_skip(body?: types.PostTransactionsIdSkipBodyParam | types.PostTransactionsIdSkipMetadataParam, metadata?: types.PostTransactionsIdSkipMetadataParam): Promise<FetchResponse<200, types.PostTransactionsIdSkipResponse200>> {
    return this.core.fetch('/transactions/{transaction_id}/skip', 'post', body, metadata);
  }

  /**
   * This is only applicable  transaction status = skipped.
   *
   * @summary Unskip a transaction
   * @throws FetchError<400, types.PostTransactionsIdUnskipResponse400> Error response
   * @throws FetchError<401, types.PostTransactionsIdUnskipResponse401> Unauthorized response
   * @throws FetchError<403, types.PostTransactionsIdUnskipResponse403> Forbidden response
   * @throws FetchError<500, types.PostTransactionsIdUnskipResponse500> Error response
   */
  post_transactions_id_unskip(body: types.PostTransactionsIdUnskipBodyParam, metadata: types.PostTransactionsIdUnskipMetadataParam): Promise<FetchResponse<200, types.PostTransactionsIdUnskipResponse200>>;
  post_transactions_id_unskip(metadata: types.PostTransactionsIdUnskipMetadataParam): Promise<FetchResponse<200, types.PostTransactionsIdUnskipResponse200>>;
  post_transactions_id_unskip(body?: types.PostTransactionsIdUnskipBodyParam | types.PostTransactionsIdUnskipMetadataParam, metadata?: types.PostTransactionsIdUnskipMetadataParam): Promise<FetchResponse<200, types.PostTransactionsIdUnskipResponse200>> {
    return this.core.fetch('/transactions/{transaction_id}/unskip', 'post', body, metadata);
  }

  /**
   * This is only applicable when transaction status = scheduled or pending.
   *
   * @summary Update the transaction's price
   * @throws FetchError<400, types.PostTransactionsIdPriceResponse400> Error response
   * @throws FetchError<401, types.PostTransactionsIdPriceResponse401> Unauthorized response
   * @throws FetchError<403, types.PostTransactionsIdPriceResponse403> Forbidden response
   * @throws FetchError<500, types.PostTransactionsIdPriceResponse500> Error response
   */
  post_transactions_id_price(body: types.PostTransactionsIdPriceBodyParam, metadata: types.PostTransactionsIdPriceMetadataParam): Promise<FetchResponse<200, types.PostTransactionsIdPriceResponse200>> {
    return this.core.fetch('/transactions/{transaction_id}/price', 'post', body, metadata);
  }

  /**
   * This is only applicable when transaction status = scheduled or pending.
   *
   * @summary Apply Balance
   * @throws FetchError<400, types.PostTransactionsIdApplyBalanceResponse400> Error response
   * @throws FetchError<401, types.PostTransactionsIdApplyBalanceResponse401> Unauthorized response
   * @throws FetchError<403, types.PostTransactionsIdApplyBalanceResponse403> Forbidden response
   * @throws FetchError<500, types.PostTransactionsIdApplyBalanceResponse500> Error response
   */
  post_transactions_id_apply_balance(body: types.PostTransactionsIdApplyBalanceBodyParam, metadata: types.PostTransactionsIdApplyBalanceMetadataParam): Promise<FetchResponse<200, types.PostTransactionsIdApplyBalanceResponse200>> {
    return this.core.fetch('/transactions/{transaction_id}/apply_balance', 'post', body, metadata);
  }
}
