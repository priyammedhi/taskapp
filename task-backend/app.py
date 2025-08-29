from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Dummy users & tasks
USERS = {"test@example.com": "password123"}
TASKS = [
    {"id": 1, "title": "Buy groceries", "status": "pending"},
    {"id": 2, "title": "Finish project", "status": "completed"}
]

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    if USERS.get(data.get("email")) == data.get("password"):
        return jsonify({"message": "ok", "token": "fake-jwt"})
    return jsonify({"message": "invalid"}), 401

@app.route("/tasks", methods=["GET"])
def get_tasks():
    return jsonify(TASKS)

@app.route("/tasks", methods=["POST"])
def add_task():
    data = request.get_json() or {}
    if "title" not in data:
        return jsonify({"message": "title is required"}), 400
    
    new_id = max([t["id"] for t in TASKS], default=0) + 1
    task = {"id": new_id, "title": data["title"], "status": "pending"}
    TASKS.append(task)
    return jsonify(task), 201

@app.route("/tasks/<int:task_id>", methods=["PUT"])
def update_task(task_id):
    data = request.get_json() or {}
    for task in TASKS:
        if task["id"] == task_id:
            task["status"] = data.get("status", task["status"])
            return jsonify(task)
    return jsonify({"message": "Task not found"}), 404

@app.route("/tasks/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    global TASKS
    TASKS = [t for t in TASKS if t["id"] != task_id]
    return jsonify({"message": "Task deleted"})

if __name__ == "__main__":
    app.run(debug=True)
