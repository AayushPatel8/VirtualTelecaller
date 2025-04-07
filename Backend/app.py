from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from dotenv import load_dotenv
import os
import mimetypes

app = Flask(__name__)
# Enable CORS for all routes with appropriate options
CORS(app, resources={r"/*": {"origins": "*"}})

UPLOAD_FOLDER = 'uploads'
RESPONSE_AUDIO_FOLDER = 'responses'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESPONSE_AUDIO_FOLDER, exist_ok=True)

# API keys and document path
load_dotenv()
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
ELEVEN_API_KEY = os.getenv('ELEVENLABS_API_KEY')
GROQ_API_KEY = os.getenv('GROQ_API_KEY')
DOCUMENT_PATH = "McD.txt"  # Replace with your actual document path

# Initialize the virtual telecaller - uncomment when ready to use
from virtual_telecaller import VirtualTelecaller
telecaller = VirtualTelecaller(GEMINI_API_KEY, DOCUMENT_PATH, ELEVEN_API_KEY, GROQ_API_KEY)

@app.route('/process-voice', methods=['POST', 'OPTIONS'])
def process_voice():
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
        return ('', 204, headers)
    
    print("Received process-voice request")
    
    # Check if the request contains the 'voice' file
    if 'voice' not in request.files:
        print("No voice file in request")
        return jsonify({"error": "No voice file in request"}), 400
    
    voice_data = request.files['voice']
    if voice_data.filename == '':
        print("No voice file selected")
        return jsonify({"error": "No voice file selected"}), 400
    
    # Save the voice file
    filename = os.path.join(UPLOAD_FOLDER, 'voice_input.wav')
    voice_data.save(filename)
    print(f"Saved voice file to {filename}")
    
    try:
        # Get the voice_id from the request
        voice_id = request.form.get('voice_id')
        
        # Process the saved voice input and get the response
        user_speech = telecaller.transcribe_audio(filename)
        print(f"Transcribed speech: {user_speech}")
        
        if user_speech.strip().lower() in ["goodbye", "bye", "end call"]:
            response = "Thank you for calling. Have a great day!"
            response_audio_path = telecaller.text_to_speech(response, voice_id)
            ended = True
        else:
            response = telecaller.process_user_input(user_speech)
            response_audio_path = telecaller.text_to_speech(response, voice_id)
            ended = False
        
        print(f"Response: {response}")
        print(f"Audio path: {response_audio_path}")
        
        if response_audio_path is None:
            # Handle the error case - either use a default response or return an error
            return jsonify({"error": "Failed to generate audio response"}), 500
        
        response_audio_filename = os.path.basename(response_audio_path)
        
        # If the audio was saved outside our expected folders, copy it to our responses folder
        if not os.path.exists(os.path.join(RESPONSE_AUDIO_FOLDER, response_audio_filename)):
            if os.path.exists(response_audio_path):
                import shutil
                shutil.copy2(response_audio_path, os.path.join(RESPONSE_AUDIO_FOLDER, response_audio_filename))
                print(f"Copied audio file to {RESPONSE_AUDIO_FOLDER}/{response_audio_filename}")
        
        # Construct the full URL to the audio file
        response_audio_url = f"/get-audio/{response_audio_filename}"
        
        return jsonify({
            "message": "Voice data processed successfully!",
            "user_speech": user_speech,
            "response": response,
            "response_audio": response_audio_url,
            "ended": ended
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error processing voice: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/get-audio/<filename>', methods=['GET'])
def get_audio(filename):
    """Serve audio files from the response directory"""
    print(f"Request for audio file: {filename}")
    
    # Make sure the filename doesn't contain path traversal
    safe_filename = os.path.basename(filename)
    
    # Try response folder first
    file_path = os.path.join(RESPONSE_AUDIO_FOLDER, safe_filename)
    
    if not os.path.exists(file_path):
        # If not in responses folder, check uploads folder as fallback
        file_path = os.path.join(UPLOAD_FOLDER, safe_filename)
        if not os.path.exists(file_path):
            print(f"Audio file not found: {safe_filename}")
            return jsonify({"error": "Audio file not found"}), 404
    
    print(f"Serving audio file: {file_path}")
    
    # Determine the correct MIME type
    mime_type = mimetypes.guess_type(file_path)[0]
    if not mime_type:
        # Default to WAV if can't determine
        mime_type = 'audio/wav'
    
    # Serve the file with the appropriate MIME type
    response = send_file(file_path, mimetype=mime_type)
    response.headers['Access-Control-Allow-Origin'] = '*'  # Add CORS header to the response
    return response

# Simple test route to verify the server is running
@app.route('/test', methods=['GET'])
def test_route():
    return jsonify({"status": "Server is running"}), 200

@app.route('/save-context', methods=['POST'])
def save_context():
    try:
        data = request.json
        context = data.get('context', '')
        enhance_with_ai = data.get('enhanceWithAI', False)
        role = data.get('role', '')
        
        if enhance_with_ai:
            if not role.strip():
                return jsonify({"error": "No role provided for AI enhancement"}), 400
                
            # Generate context using the provided code
            from google import genai
            
            client = genai.Client(api_key=GEMINI_API_KEY)
            
            prompt = f"Generate a context for a virtual telecaller who is a {role}. The context should include industry, products/services, common questions, and other relevant details formatted as follows:\n\n" \
                    f"Context: {role}\n\n" \
                    "Industry: \n\n" \
                    "Products/Services:\n\n" \
                    "Promotions:\n\n" \
                    "Services:\n\n" \
                    "Values:\n\n" \
                    "Tone:\n\n" \
                    "Common Questions:\n\n" \
                    "Location Information:\n\n" \
                    "Delivery Information:\n\n" \
                    "App Information:\n"
            
            response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=prompt,
            )
            
            # Write the AI-generated content to the file
            with open(DOCUMENT_PATH, 'w') as file:
                file.write(response.text)
                
        else:
            # Use provided context directly
            if not context.strip():
                return jsonify({"error": "No context provided"}), 400
                
            with open(DOCUMENT_PATH, 'w') as file:
                file.write(context)
        
        # Reload the context in the telecaller instance
        telecaller.context = telecaller.load_document(DOCUMENT_PATH)
        print("Context reloaded successfully")
                
        return jsonify({"message": "Context saved successfully"}), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("Starting Flask server...")
    app.run(debug=True, host='0.0.0.0')  # Listen on all interfaces