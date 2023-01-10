#!/bin/sh

response=$(
    curl https://api.aws.science.io/v2/identify-phi \
        --request POST \
        --header "Content-type: application/json" \
        --header "x-api-id: $SCIENCEIO_KEY_ID" \
        --header "x-api-secret: $SCIENCEIO_KEY_SECRET" \
        --data "{\"text\": \"$1\"}"
)

echo "Inference request submitted: $response"

request_id=$(echo $response | jq -r '.request_id')

echo "Polling for response with request_id: $request_id"

# poll the API until the request is complete
while true; do
    response=$(
        curl https://api.aws.science.io/v2/identify-phi/$request_id \
            --header "Content-type: application/json" \
            --header "x-api-id: $SCIENCEIO_KEY_ID" \
            --header "x-api-secret: $SCIENCEIO_KEY_SECRET"
    )

    status=$(echo $response | jq -r '.inference_status')

    if [ "$status" = "COMPLETED" ]; then
        echo $response | jq -r '.inference_result'
        break
    fi

    sleep 1
done
