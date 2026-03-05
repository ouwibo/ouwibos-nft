import os
import sys

from google import genai


def main() -> int:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Missing GEMINI_API_KEY environment variable.", file=sys.stderr)
        print(
            "Set it like: export GEMINI_API_KEY='...'\n"
            "Then run: python gemini_chat.py 'Say hello'",
            file=sys.stderr,
        )
        return 2

    prompt = " ".join(sys.argv[1:]).strip()
    if not prompt:
        prompt = "Say hello in one sentence."

    client = genai.Client(api_key=api_key)
    resp = client.models.generate_content(model="gemini-2.0-flash", contents=prompt)
    text = getattr(resp, "text", None) or str(resp)
    print(text)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

