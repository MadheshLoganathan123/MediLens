import os
import json

import requests
from dotenv import load_dotenv


def main() -> None:
  """
  Simple connectivity test for the OpenRouter API using OPENROUTER_API_KEY
  from your backend environment.
  """
  # Load envs from project root and backend/.env if running via `python backend/test_openrouter.py`
  root_dir = os.path.dirname(os.path.dirname(__file__))
  backend_dir = os.path.dirname(__file__)

  load_dotenv(os.path.join(root_dir, ".env"))
  load_dotenv(os.path.join(backend_dir, ".env"))

  api_key = os.getenv("OPENROUTER_API_KEY")
  if not api_key:
    raise SystemExit("OPENROUTER_API_KEY is not set in backend/.env")

  payload = {
    "model": "google/gemma-3-4b-it:free",
    "messages": [
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": "Test: Reply with exactly 'MediLens AI connection OK'.",
          }
        ],
      }
    ],
  }

  resp = requests.post(
    "https://openrouter.ai/api/v1/chat/completions",
    headers={
      "Authorization": f"Bearer {api_key}",
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:5173",
      "X-Title": "MediLens",
    },
    json=payload,
    timeout=30,
  )

  print("Status:", resp.status_code)
  try:
    data = resp.json()
  except json.JSONDecodeError:
    print("Non‑JSON response body:", resp.text[:500])
    return

  print("Response JSON (truncated):")
  print(json.dumps(data, indent=2)[:1000])

  try:
    content = data["choices"][0]["message"]["content"]
    print("\nModel content:", content)
  except Exception:
    print("\nCould not extract content from response.")


if __name__ == "__main__":
  main()

