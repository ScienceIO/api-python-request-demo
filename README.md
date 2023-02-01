# Python requests demo

This repo covers:

1. How to submit a request to the ScienceIO API
2. Demos of `identify-phi` and `redact-phi`

## Setup

Before using this repo, you must have ScienceIO credentials (API key and secret) saved to your environment.

[See ScienceIO docs for how to set up your environment](https://docs.science.io/docs/configure-your-environment)

For a quick setup, run the following commands in your command line terminal:

```bash
export SCIENCEIO_KEY_ID={YOUR_API_KEY_ID}
export SCIENCEIO_KEY_SECRET={YOUR_API_KEY_SECRET}
```

### Environment

Please use Python 3.7 or higher. You may pip-install the dependencies for this repo with:

```bash
pip install -r requirements.txt
```

## Demos

### Identify

```bash
python identify_demo.py --text "Text goes here"
```

### Redact

```bash
python redact_demo.py --text "Text goes here"
```

If you want to use **text from a file**:

```bash
python identify_demo.py --text "$(< example_note_01.txt)"
python redact_demo.py --text "$(< example_note_01.txt)"
```
