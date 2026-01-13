"""
Adaptateur Flask pour le système RAG FastAPI
Maintient la compatibilité avec l'app mobile existante
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
from datetime import datetime
from typing import Dict, Optional

app = Flask(__name__)
CORS(app)

# Configuration
RAG_API_URL = os.getenv('RAG_API_URL', 'http://localhost:8001')
RAG_TIMEOUT = int(os.getenv('RAG_TIMEOUT', '30'))
FALLBACK_ENABLED = os.getenv('FALLBACK_ENABLED', 'true').lower() == 'true'

def call_rag_api(question: str) -> Optional[Dict]:
    """Appelle le système RAG FastAPI"""
    try:
        response = requests.post(
            f"{RAG_API_URL}/api/v1/chatbot/query",
            json={"question": question},
            timeout=RAG_TIMEOUT,
            headers={"Content-Type": "application/json"}
        )
        
        if response.ok:
            return response.json()
        else:
            print(f"❌ RAG API error: {response.status_code} - {response.text}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur de connexion au RAG: {e}")
        return None

def format_response(rag_data: Dict, question: str) -> Dict:
    """Formate la réponse du RAG pour correspondre au format attendu par l'app mobile"""
    return {
        "answer": rag_data.get("answer", ""),
        "sources": rag_data.get("sources", []),
        "confidence": rag_data.get("confidence", 0.9),
        "timestamp": datetime.now().isoformat(),
        "bible_references": rag_data.get("bible_references", []),
        "model": "Google Gemini 1.5 Flash (RAG)",
        "question": question
    }

@app.route('/api/assistant/query', methods=['POST'])
def assistant_query():
    """Endpoint compatible avec l'app mobile - appelle le RAG FastAPI"""
    try:
        data = request.get_json()
        question = data.get('question', '').strip()
        context = data.get('context', 'general')  # Ignoré par le RAG mais accepté pour compatibilité
        
        if not question:
            return jsonify({'error': 'Question requise'}), 400
        
        if len(question) < 5:
            return jsonify({'error': 'Question trop courte'}), 400
        
        # Appeler le RAG FastAPI
        rag_data = call_rag_api(question)
        
        if rag_data:
            formatted_response = format_response(rag_data, question)
            return jsonify(formatted_response)
        else:
            # Fallback si le RAG n'est pas disponible
            if FALLBACK_ENABLED:
                return jsonify({
                    "answer": "Le service RAG n'est pas disponible pour le moment. Veuillez réessayer plus tard.",
                    "sources": [],
                    "confidence": 0.1,
                    "timestamp": datetime.now().isoformat(),
                    "bible_references": [],
                    "model": "Fallback",
                    "error": "RAG service unavailable"
                }), 503
            else:
                return jsonify({
                    'error': 'Service RAG indisponible',
                    'message': 'Le système RAG ne répond pas. Vérifiez que le service est démarré.'
                }), 503
        
    except Exception as e:
        return jsonify({
            'error': 'Erreur interne du serveur',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/assistant/suggestions', methods=['GET'])
def get_suggestions():
    """Suggestions de questions - compatible avec l'app mobile"""
    suggestions = [
        "Qui était Moïse et quel rôle a-t-il joué dans l'histoire d'Israël?",
        "Qu'est-ce que la Pentecôte ?",
        "Comment prier le rosaire ?",
        "Quel est le sens du carême ?",
        "Qui sont les saints du Sénégal ?",
        "Comment se préparer au baptême ?",
        "Quelle est la signification de l'Eucharistie ?",
        "Qu'est-ce que la Trinité ?",
        "Comment interpréter la parabole du bon samaritain ?",
        "Quel est le message principal de l'Évangile selon Jean ?"
    ]
    
    return jsonify({
        "suggestions": suggestions,
        "timestamp": datetime.now().isoformat()
    })

@app.route('/api/assistant/stats', methods=['GET'])
def get_stats():
    """Statistiques de l'assistant"""
    try:
        # Appeler le health check du RAG
        response = requests.get(f"{RAG_API_URL}/api/v1/chatbot/health", timeout=5)
        
        if response.ok:
            rag_health = response.json()
            return jsonify({
                "status": "active",
                "rag_available": True,
                "rag_health": rag_health,
                "timestamp": datetime.now().isoformat()
            })
        else:
            return jsonify({
                "status": "degraded",
                "rag_available": False,
                "timestamp": datetime.now().isoformat()
            })
    except:
        return jsonify({
            "status": "inactive",
            "rag_available": False,
            "timestamp": datetime.now().isoformat()
        })

@app.route('/api/text-of-the-day', methods=['GET'])
def text_of_the_day():
    """Endpoint pour les textes du jour - peut être délégué au RAG si disponible"""
    try:
        # Essayer d'appeler le RAG pour les textes du jour
        timezone = request.args.get('tz', 'Europe/Paris')
        response = requests.get(
            f"{RAG_API_URL}/api/v1/text-of-the-day",
            params={"tz": timezone},
            timeout=10
        )
        
        if response.ok:
            return jsonify(response.json())
        else:
            return jsonify({
                "error": "Service de textes du jour indisponible"
            }), 503
    except:
        return jsonify({
            "error": "Service de textes du jour indisponible"
        }), 503

@app.route('/health', methods=['GET'])
def health():
    """Health check de l'adaptateur"""
    try:
        # Vérifier si le RAG est accessible
        response = requests.get(f"{RAG_API_URL}/api/v1/chatbot/health", timeout=5)
        rag_status = "available" if response.ok else "unavailable"
    except:
        rag_status = "unavailable"
    
    return jsonify({
        "status": "ok",
        "service": "RAG Adapter",
        "rag_status": rag_status,
        "rag_url": RAG_API_URL,
        "timestamp": datetime.now().isoformat()
    })

if __name__ == '__main__':
    print("🚀 Adaptateur RAG Flask démarré")
    print(f"📡 RAG API URL: {RAG_API_URL}")
    print(f"⏱️  Timeout: {RAG_TIMEOUT}s")
    print(f"🔄 Fallback: {'Activé' if FALLBACK_ENABLED else 'Désactivé'}")
    print("\n🌐 Serveur: http://localhost:8000")
    print("📚 Endpoints disponibles:")
    print("   - POST /api/assistant/query")
    print("   - GET  /api/assistant/suggestions")
    print("   - GET  /api/assistant/stats")
    print("   - GET  /api/text-of-the-day")
    print("   - GET  /health")
    
    app.run(host='0.0.0.0', port=8000, debug=True)

