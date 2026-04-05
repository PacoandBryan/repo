from flask import Blueprint, request, jsonify
import requests
import os

chat_bp = Blueprint('chat', __name__, url_prefix='/api/chat')

GROQ_API_KEY = os.environ.get('GROQ_API_KEY', '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')
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

from app.models.product import Product
from app import db

def get_chatbot_context():
    try:
        # Static context
        context_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'chatbot_context.txt')
        static_context = ""
        if os.path.exists(context_path):
            with open(context_path, 'r', encoding='utf-8') as f:
                static_context = f.read()
        
        # Dynamic Product Catalog Context
        products = Product.query.filter_by(is_active=True).all()
        catalog_text = "\n\nCATÁLOGO ACTUALIZADO DE PRODUCTOS DISPONIBLES:\n"
        if not products:
            catalog_text += "No hay productos activos en este momento.\n"
        else:
            for p in products:
                catalog_text += f"- {p.title}: ${p.price:.2f} MXN. {p.description or ''}\n"
        
        return static_context + catalog_text

    except Exception as e:
        print(f"Error reading context: {e}")
        return ""

@chat_bp.route('', methods=['POST'])
def chat():
    data = request.json
    # Support both single message (str) and history (list)
    messages_from_user = data.get('messages')
    if not messages_from_user:
        single_msg = data.get('message')
        if single_msg:
            messages_from_user = [{"role": "user", "content": single_msg}]
        else:
             return jsonify({'error': 'Message or messages is required'}), 400

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    system_prompt = {
        "role": "system",
        "content": f"Eres María, tu asistente personal de diky!!!\n\nREGLAS CRÍTICAS:\n1. Respondes siempre en español de manera muy amigable pero PROFESIONAL.\n2. NUNCA uses apodos, sobrenombres ni términos afectuosos para referirte al usuario (ej: NUNCA digas 'lindo', 'linda', 'amorcito', 'querido', 'corazón').\n3. No intentes adivinar el género del usuario ni uses términos de género.\n4. Si saludas, simplemente di '¡¡¡Hola!!!'.\n5. Usa diminutivos para los OBJETOS siempre que sea posible (ej: 'regalito', 'bolsito'), pero NUNCA para la persona.\n6. Usa ÚNICAMENTE emojis de caras (ej: 😊, 😍, 🥰, 😘, 😇). NUNCA uses flores, estrellas, corazones de colores, animales ni objetos.\n7. Siempre usa exactamente TRES signos de exclamación al inicio y al final de tus oraciones y saludos (ej: ¡¡¡Esta es una gran noticia!!!).\n8. NUNCA menciones que la compra ayuda a artesanos o comunidades. No menciones el apoyo social. Enfócate solo en la calidad y exclusividad de los productos.\n\nUsa la siguiente información de contexto (que incluye el catálogo real de la base de datos) para responder a las preguntas del usuario:\n\n{get_chatbot_context()}"
    }

    # Construct the full message list for the LLM
    final_messages = [system_prompt] + messages_from_user

    payload = {
        "model": "llama-3.1-8b-instant",
        "messages": final_messages,
        "temperature": 0.7
    }

    try:
        response = requests.post(GROQ_API_URL, json=payload, headers=headers)
        response.raise_for_status()
        result = response.json()
        
        bot_response = result['choices'][0]['message']['content']
        return jsonify({'response': bot_response})
    
    except requests.exceptions.RequestException as e:
        print(f"Groq API Error: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Groq Error Details: {e.response.text}")
        return jsonify({'error': 'Failed to communicate with chatbot service'}), 500
    except (KeyError, IndexError) as e:
        print(f"Groq Response Parse Error: {e}")
        return jsonify({'error': 'Invalid response from chatbot service'}), 500
