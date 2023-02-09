import click

from python.scio_api_tools import call_api


@click.command()
@click.option("--text", help="Submit text to redact-phi model")
def redact_phi(text: str) -> dict:
    """Redact PHI in text"""
    inference_result = call_api(model="redact-phi", text=text)
    print(f"ORIGINAL:\n{text}\n")
    print(f"REDACTED:\n{inference_result['redacted_text']}")
    return inference_result


if __name__ == "__main__":
    inference_result = redact_phi()
