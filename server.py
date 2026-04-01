"""Entry point for gunicorn: `gunicorn server:app`"""

import os

from backend.server import app

__all__ = ["app"]

if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5000"))
    app.run(debug=True, host="0.0.0.0", port=port)
