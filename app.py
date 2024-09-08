from flask import Flask, request, jsonify, render_template
from transformers import TFGPT2LMHeadModel, GPT2Tokenizer

app = Flask(__name__)
tokenizer = GPT2Tokenizer.from_pretrained("gpt_fine_tuned")
model = TFGPT2LMHeadModel.from_pretrained("gpt_fine_tuned")

@app.route("/", methods=["GET", "POST"])
def chatbot():
    if request.method == "POST":
        if request.is_json:
            # Handling JSON requests (for API)
            message = request.json["message"]
            input_ids = tokenizer.encode(message, return_tensors="tf")
            output_ids = model.generate(input_ids, max_length=100, num_return_sequences=1)
            response = tokenizer.decode(output_ids[0])

            return jsonify({"response": response})
        else:
            # Handling form submissions (for website)
            message = request.form["message"]
            input_ids = tokenizer.encode(message, return_tensors="tf")
            output_ids = model.generate(input_ids, max_length=100, num_return_sequences=1)
            response = tokenizer.decode(output_ids[0])

            return render_template("index.html", response=response, message=message)
    else:
        # Render the input form
        return render_template("index.html")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
