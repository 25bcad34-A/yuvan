import os

from flask import Flask, jsonify, render_template, request

from .database import (
    add_contact,
    get_all_contacts,
    get_visitor_count,
    increment_visitor_count,
    init_database,
)

_BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(
    __name__,
    template_folder=os.path.join(_BACKEND_DIR, "templates"),
    static_folder=os.path.join(_BACKEND_DIR, "static"),
    static_url_path="/static",
)

init_database()


def _basic_email_ok(email: str) -> bool:
    if "@" not in email or "." not in email:
        return False
    parts = email.split("@")
    if len(parts) != 2 or not parts[0] or not parts[1]:
        return False
    return "." in parts[1]


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/admin")
def admin():
    contacts = get_all_contacts()
    visitors = get_visitor_count()
    return render_template("admin.html", contacts=contacts, visitors=visitors)


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "message": "healthy"}), 200


@app.route("/api/contact", methods=["POST"])
def api_contact():
    try:
        data = request.get_json(silent=True) or {}
        name = (data.get("name") or "").strip()
        email = (data.get("email") or "").strip()
        message = (data.get("message") or "").strip()

        if not name or not email or not message:
            return jsonify({"success": False, "error": "All fields are required"}), 400

        if not _basic_email_ok(email):
            return jsonify({"success": False, "error": "Invalid email address"}), 400

        if add_contact(name, email, message):
            return jsonify(
                {
                    "success": True,
                    "message": "Message saved successfully.",
                }
            ), 200
        return jsonify({"success": False, "error": "Failed to save message"}), 500
    except Exception as e:
        print(f"api_contact error: {e}")
        return jsonify({"success": False, "error": "Internal server error"}), 500


def _contact_json_row(c):
    row = dict(c)
    ca = row.get("created_at")
    if ca is not None and hasattr(ca, "isoformat"):
        row["created_at"] = ca.isoformat()
    elif ca is not None:
        row["created_at"] = str(ca)
    return row


@app.route("/api/contacts", methods=["GET"])
def api_contacts():
    try:
        contacts = [_contact_json_row(c) for c in get_all_contacts()]
        return jsonify({"success": True, "contacts": contacts}), 200
    except Exception as e:
        print(f"api_contacts error: {e}")
        return jsonify({"success": False, "error": "Internal server error"}), 500


@app.route("/api/visit", methods=["POST"])
def api_visit():
    try:
        count = increment_visitor_count()
        return jsonify({"success": True, "visitors": count}), 200
    except Exception as e:
        print(f"api_visit error: {e}")
        return jsonify({"success": False, "error": "Internal server error"}), 500


@app.route("/api/visitors", methods=["GET"])
def api_visitors():
    try:
        return jsonify({"success": True, "visitors": get_visitor_count()}), 200
    except Exception as e:
        print(f"api_visitors error: {e}")
        return jsonify({"success": False, "error": "Internal server error"}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5000"))
    app.run(debug=True, host="0.0.0.0", port=port)
