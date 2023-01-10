#!/bin/sh

# make "model" a parameter to the script

# make a request to the API and store the results in the variable "response"
response=$(
    curl https://api.aws.science.io/v2/identify-phi \
        --request POST \
        --header "Content-type: application/json" \
        --header "x-api-id: $SCIENCEIO_API_ID" \
        --header "x-api-secret: $SCIENCEIO_API_SECRET" \
        --data "{\"text\": \"$1\"}"
)

echo "Inference request submitted: $response"

request_id=$(echo $response | sed -E 's/.*"request_id": "([^"]+)".*/\1/')

echo "Polling for response with request_id: $request_id"

# poll the API until the request is complete
while true; do
    response=$(
        curl https://api.aws.science.io/v2/identify-phi/$request_id \
            --header "Content-type: application/json" \
            --header "x-api-id: $SCIENCEIO_API_ID" \
            --header "x-api-secret: $SCIENCEIO_API_SECRET"
    )

    status=$(echo $response | sed -E 's/.*"inference_status": "([^"]+)".*/\1/')

    if [ "$status" = "COMPLETED" ]; then
        echo $response | sed -E 's/.*"inference_result": ([^,]+).*/\1/'
        break
    fi

    sleep 1
done
