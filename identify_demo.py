import click
import json

from scio_api_tools import call_api


@click.command()
@click.option('--text', help='Submit text to identify-phi model')
def identify_phi(text: str) -> dict:
    """Identify PHI in text"""
    inference_result = call_api(model='identify-phi', text=text)
    print(json.dumps(inference_result, indent=4))
    return inference_result


if __name__=="__main__":
    inference_result = identify_phi()
