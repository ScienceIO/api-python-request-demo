import os
import time
from typing import Tuple

import requests


def get_credentials() -> Tuple[str, str]:
    """Get API credentials (key, secret) from env

    Returns:
        Tuple[str, str]: API key and API secret
    """
    api_key_id = os.getenv("SCIENCEIO_KEY_ID")
    api_key_secret = os.getenv("SCIENCEIO_KEY_SECRET")
    return api_key_id, api_key_secret


def poll_for_response(
    base_url: str,
    request_id: str,
    max_attempts: int = 8,
    time_delay: float = 1.0,
    exp_backoff: float = 1.5,
) -> dict:
    """Poll the ScienceIO endpoint for a response.

    The ScienceIO API is asynchronous, so we poll
    with a time_delay until the response is ready.
    After each poll, the time_delay increases
    by a multiplicative factor (exp_backoff).

    Args:
        base_url (str):
            url for the api endpoint
        request_id (str):
            id for the request being polled
        max_attempts (int):
            maximum polls to make [default: 8]
        time_delay (float):
            time to wait between each poll in secs [default: 1]
        exp_backoff (float):
            if True, each poll will increase by exp_backoff*time_delay

    Returns:
        dict: inference results from the polled response

    Raises:
        Exception: if no response available after max attempts
    """

    # get credentials
    api_key_id, api_key_secret = get_credentials()

    # gather url and headers for poll request
    url = f"{base_url}/{request_id}"
    headers = {
        "Content-Type": "application/json",
        "x-api-id": api_key_id,
        "x-api-secret": api_key_secret,
    }

    for _ in range(max_attempts):
        # poll the api and get current response
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        response_json = response.json()

        # if the result is ready, return
        inference_result = response_json.get("inference_result", None)
        if inference_result is not None:
            return inference_result

        # if the result is not ready, wait
        time.sleep(time_delay)
        time_delay *= exp_backoff

    raise Exception("Maximum number of attempts made. Try again soon.")


def call_api(model: str, text: str) -> dict:
    """Call the ScienceIO API to perform inference.

    Submit text to a ScienceIO model for inference
    and retrieve results via API.

    Args:
        model (str): name of the ScienceIO model
        text (str):  text to process

    Returns:
        dict: inference result

    Raises:
        Exception: if request fails
    """

    # get credentials
    api_key_id, api_key_secret = get_credentials()

    # post request
    url = f"https://api.aws.science.io/v2/{model}"
    json_request = {"text": text}
    headers = {
        "x-api-id": api_key_id,
        "x-api-secret": api_key_secret,
        "Content-Type": "application/json",
    }
    response = requests.request(
        "POST", url, headers=headers, json=json_request
    )

    # async api will return 201 status code if processing successfully
    status_code = response.status_code

    if status_code != 201:
        reason = response.reason
        raise Exception(
            f"Request failed with status code {status_code} and reason: {reason}"
        )

    # get request_id to poll for a response
    request_id = response.json()["request_id"]

    # poll the api
    inference_result = poll_for_response(url, request_id)

    return inference_result
