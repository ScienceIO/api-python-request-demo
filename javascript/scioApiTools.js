const INFERENCE_URL =
  process.env.SCIENCEIO_INFERENCE_URL || 'https://api.aws.science.io/v2/';

/**
 * Get API credentials (key, secret) from env
 * @return {Object} { apiKeyId, apiKeySecret }  API credentials
 */
function getCredentials() {
  const apiKeyId = process.env.SCIENCEIO_KEY_ID;
  const apiKeySecret = process.env.SCIENCEIO_KEY_SECRET;
  return { apiKeyId, apiKeySecret };
}

/**
 * Sleep for ms milliseconds
 * @param  {Number} ms time to sleep in milliseconds
 * @return {Promise}    Promise that resolves after ms milliseconds
 * */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Poll the ScienceIO endpoint for a response.
 * The ScienceIO API is asynchronous, so we poll
 * with a timeDelay until the response is ready.
 * After each poll, the timeDelay increases
 * by a multiplicative factor (expBackoff).
 * @param  {String} baseUrl      url for the api endpoint
 * @param  {String} requestId    id for the request being polled
 * @param  {Number} maxAttempts  maximum polls to make [default: 8]
 * @param  {Number} timeDelay    time to wait between each poll in secs [default: 1]
 * @param  {Number} expBackoff   each poll will increase by expBackoff*timeDelay [default: True]
 * @return {Promise}             Promise that resolves to the response from the API
 */
async function pollForResponse(
  baseUrl,
  requestId,
  maxAttempts = 8,
  timeDelay = 1.0,
  expBackoff = 1.5
) {
  // get credetnials
  const { apiKeyId, apiKeySecret } = getCredentials();

  // create the URL and headers for the poll request

  const url = `${baseUrl}/${requestId}`;
  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': apiKeyId,
    'x-api-secret': apiKeySecret,
  };

  for (let i = 0; i < maxAttempts; i++) {
    // make the request
    const response = await fetch(url, { method: 'GET', headers });
    const result = await response.json();

    // get the inference status or null if it doesn't exist
    const inferenceStatus = result['inference_status'] || null;

    // check if the response is ready
    if (inferenceStatus === 'COMPLETED') {
      return result['inference_result'];
    } else if (inferenceStatus === 'ERRORED') {
      throw new Error(result['detail']);
    } else if (inferenceStatus === null) {
      throw new Error('Could not poll');
    }

    // wait for timeDelay seconds before making the next request
    await sleep(timeDelay * 1000);
    timeDelay *= expBackoff;
  }

  throw new Error('Maximum number of attempts made. Try again soon.');
}

/**
 * Call the ScienceIO API to perform inference.
 * Submit text to a ScienceIO model for inference
 * and retrieve results via API.
 * @param  {String} model model name
 * @param  {String} text  text to be inferred
 * @return {Promise}      Promise that resolves to the response from the API
 **/
export async function callApi(model, text) {
  // get credentials
  const { apiKeyId, apiKeySecret } = getCredentials();

  // create the URL and headers for the inference request
  const url = `${INFERENCE_URL}/${model}`;
  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': apiKeyId,
    'x-api-secret': apiKeySecret,
  };

  // make the request
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ text }),
  });

  const result = await response.json();

  // get the request id or null if it doesn't exist
  const requestId = result['request_id'] || null;

  // check if the request was successful
  if (requestId === null) {
    throw new Error('Could not submit request');
  }

  // poll for the response
  const inferenceResult = await pollForResponse(url, requestId);

  return inferenceResult;
}
