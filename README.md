# Python requests demo

This repo covers:

1. How to submit a request to the ScienceIO API
2. Demos of `identify-phi` and `redact-phi`

## Setup
Before using this repo, you must have ScienceIO credentials (API key and secret) saved to your environment.

[See ScienceIO docs for how to set up your environment](https://docs.science.io/docs/configure-your-environment)

For a quick setup, run the following commands in your command line terminal:

```
export SCIENCEIO_KEY_ID={YOUR_API_KEY_ID}
export SCIENCEIO_KEY_SECRET={YOUR_API_KEY_SECRET}
```

## Identify Demo
`python identify_demo.py --text "Text goes here"`


## Redact Demo
`python redact_demo.py --text "Text goes here"`