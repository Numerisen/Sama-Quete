from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from bs4 import BeautifulSoup
from datetime import datetime
import pytz
import re
import json
import os
from typing import Dict, List, Optional
import openai
from anthropic import Anthropic
import time
import hashlib

app = Flask(__name__)
CORS(app)

# Configuration des LLMs
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY')

# Initialisation des clients
openai_client = openai.OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None
anthropic_client = Anthropic(api_key=ANTHROPIC_API_KEY) if ANTHROPIC_API_KEY else None

# Cache pour les réponses
response_cache = {}

def clean_text(text):
    """Nettoie le texte extrait"""
    if not text:
        return ''
    text = text.replace('\u00a0', ' ').replace('\xa0', ' ')
    text = text.replace('\n', ' ').replace('\r', ' ')
    text = text.replace('\t', ' ')
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'\s+([.,;:!\?])', r'\1', text)
    text = re.sub(r'([.,;:!\?])(\S)', r'\1 \2', text)
    return text.strip()

def get_cache_key(question: str, context: str) -> str:
    """Génère une clé de cache pour la question"""
    return hashlib.md5(f"{question}_{context}".encode()).hexdigest()

def get_cached_response(question: str, context: str) -> Optional[Dict]:
    """Récupère une réponse du cache si disponible"""
    cache_key = get_cache_key(question, context)
    cached = response_cache.get(cache_key)
    if cached and (time.time() - cached['timestamp']) < 3600:  # Cache valide 1h
        return cached['response']
    return None

def cache_response(question: str, context: str, response: Dict):
    """Met en cache une réponse"""
    cache_key = get_cache_key(question, context)
    response_cache[cache_key] = {
        'response': response,
        'timestamp': time.time()
    }

def get_bible_context(question: str) -> str:
    """Récupère le contexte biblique pour la question"""
    # Ici vous pouvez ajouter une logique pour récupérer des passages bibliques pertinents
    # basés sur des mots-clés dans la question
    keywords = question.lower().split()
    
    # Mots-clés bibliques communs
    bible_keywords = {
        'jésus': 'Évangiles',
        'christ': 'Évangiles',
        'dieu': 'Ancien Testament',
        'prière': 'Psaumes, Matthieu 6:9-13',
        'amour': '1 Corinthiens 13, Jean 3:16',
        'foi': 'Hébreux 11, Romains 10:17',
        'espérance': 'Romains 15:13, 1 Pierre 1:3',
        'charité': '1 Corinthiens 13, 1 Jean 4:7-21'
    }
    
    context_parts = []
    for keyword in keywords:
        if keyword in bible_keywords:
            context_parts.append(bible_keywords[keyword])
    
    return '; '.join(context_parts) if context_parts else 'Bible générale'

def ask_claude(question: str, context: str) -> Dict:
    """Pose une question à Claude 3.5 Sonnet"""
    if not anthropic_client:
        raise Exception("Claude API key not configured")
    
    system_prompt = f"""Tu es un assistant spirituel catholique spécialisé dans l'enseignement biblique. 
    Réponds aux questions en te basant sur les enseignements de la Bible et de l'Église catholique.
    Sois précis, respectueux et cite les références bibliques quand c'est approprié.
    
    Contexte biblique disponible: {context}
    
    Réponds en français, de manière claire et accessible."""
    
    try:
        response = anthropic_client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1000,
            temperature=0.7,
            system=system_prompt,
            messages=[{"role": "user", "content": question}]
        )
        
        return {
            "answer": response.content[0].text,
            "model": "Claude 3.5 Sonnet",
            "confidence": 0.9,
            "sources": [context] if context else []
        }
    except Exception as e:
        raise Exception(f"Erreur Claude: {str(e)}")

def ask_gpt4(question: str, context: str) -> Dict:
    """Pose une question à GPT-4o"""
    if not openai_client:
        raise Exception("OpenAI API key not configured")
    
    system_prompt = f"""Tu es un assistant spirituel catholique spécialisé dans l'enseignement biblique. 
    Réponds aux questions en te basant sur les enseignements de la Bible et de l'Église catholique.
    Sois précis, respectueux et cite les références bibliques quand c'est approprié.
    
    Contexte biblique disponible: {context}
    
    Réponds en français, de manière claire et accessible."""
    
    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": question}
            ],
            max_tokens=1000,
            temperature=0.7
        )
        
        return {
            "answer": response.choices[0].message.content,
            "model": "GPT-4o",
            "confidence": 0.85,
            "sources": [context] if context else []
        }
    except Exception as e:
        raise Exception(f"Erreur GPT-4: {str(e)}")

def ask_llm(question: str, context: str = "general") -> Dict:
    """Pose une question au LLM disponible"""
    # Vérifier le cache d'abord
    cached = get_cached_response(question, context)
    if cached:
        return cached
    
    # Obtenir le contexte biblique
    bible_context = get_bible_context(question)
    
    # Essayer Claude en premier, puis GPT-4 en fallback
    try:
        if anthropic_client:
            response = ask_claude(question, bible_context)
        elif openai_client:
            response = ask_gpt4(question, bible_context)
        else:
            raise Exception("Aucun LLM configuré")
        
        # Mettre en cache la réponse
        cache_response(question, context, response)
        return response
        
    except Exception as e:
        # Fallback vers une réponse basique
        return {
            "answer": f"Je ne peux pas répondre à cette question pour le moment. ({str(e)})",
            "model": "Fallback",
            "confidence": 0.1,
            "sources": []
        }

def extract_paragraph_improved(tag):
    """Extraction améliorée des paragraphes avec gestion des sauts de ligne"""
    from html import unescape
    raw_html = str(tag)
    raw_html = raw_html.replace('<br>', '\n').replace('<br/>', '\n').replace('<br />', '\n')
    clean_text = BeautifulSoup(raw_html, "html.parser").get_text()
    return unescape(clean_text.strip())

@app.route('/api/text-of-the-day')
def text_of_the_day():
    """Endpoint amélioré pour les textes du jour avec scraper optimisé"""
    tz = request.args.get('tz', 'Europe/Paris')
    try:
        user_tz = pytz.timezone(tz)
    except Exception:
        return jsonify({'error': 'Invalid timezone'}), 400
    now = datetime.now(user_tz)
    date_str = now.strftime('%Y-%m-%d')
    url = f'https://www.aelf.org/{date_str}/romain/messe'
    
    try:
        resp = requests.get(url, timeout=10)
        if resp.status_code != 200:
            return jsonify({'error': 'Page not found'}), 404
        
        soup = BeautifulSoup(resp.content, 'html.parser')
        result = {
            'date': date_str,
            'title': None,
            'lectures': []
        }

        # Extraction améliorée du titre
        title_tag = soup.select_one('#middle-col > div:nth-of-type(1) > p > strong')
        if title_tag:
            title = title_tag.get_text().replace('\xa0', ' ').replace('\n', ' ').strip()
            result['title'] = re.sub(r"\s+", " ", title)

        # Extraction améliorée des lectures avec meilleure gestion des paragraphes
        for block in soup.select('div.lecture'):
            titre = block.select_one('h4')
            reference = block.select_one('h5')
            titre_text = titre.get_text(strip=True) if titre else None
            reference_text = reference.get_text(strip=True) if reference else None

            contenu = ""
            for p in block.select('p'):
                texte = extract_paragraph_improved(p)
                if texte:
                    contenu += texte + "\n\n"

            result['lectures'].append({
                'type': titre_text,
                'reference': reference_text,
                'contenu': contenu.strip()
            })

        return app.response_class(
            response=json.dumps(result, ensure_ascii=False),
            status=200,
            mimetype='application/json'
        )
    except requests.exceptions.Timeout:
        return jsonify({'error': 'Timeout lors de la récupération des données'}), 504
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Erreur de connexion: {str(e)}'}), 503
    except Exception as e:
        return jsonify({'error': f'Erreur lors du traitement: {str(e)}'}), 500

@app.route('/api/assistant/query', methods=['POST'])
def assistant_query():
    """Nouvel endpoint pour l'assistant IA biblique"""
    try:
        data = request.get_json()
        question = data.get('question', '').strip()
        context = data.get('context', 'general')
        
        if not question:
            return jsonify({'error': 'Question requise'}), 400
        
        # Obtenir la réponse du LLM
        response = ask_llm(question, context)
        
        # Ajouter des métadonnées
        response['timestamp'] = datetime.now().isoformat()
        response['question'] = question
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({
            'error': 'Erreur interne du serveur',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/assistant/suggestions')
def get_suggestions():
    """Obtient des suggestions de questions"""
    suggestions = [
        "Qu'est-ce que la Pentecôte ?",
        "Comment prier le rosaire ?",
        "Quel est le sens du Carême ?",
        "Que dit la Bible sur l'amour ?",
        "Comment préparer un baptême ?",
        "Qu'est-ce que l'Eucharistie ?",
        "Que dit Jésus sur la prière ?",
        "Qu'est-ce que la charité chrétienne ?",
        "Comment vivre sa foi au quotidien ?",
        "Que dit la Bible sur l'espérance ?"
    ]
    
    return jsonify({
        'suggestions': suggestions,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/assistant/stats')
def get_stats():
    """Statistiques de l'assistant"""
    return jsonify({
        'cached_responses': len(response_cache),
        'models_available': {
            'claude': anthropic_client is not None,
            'gpt4': openai_client is not None
        },
        'timestamp': datetime.now().isoformat()
    })

@app.route('/health')
def health():
    return jsonify({'status': 'ok', 'message': 'API is running'})

if __name__ == '__main__':
    print("🚀 Démarrage de l'Assistant Biblique IA")
    print("📚 Modèles disponibles:")
    print(f"   - Claude 3.5 Sonnet: {'✅' if anthropic_client else '❌'}")
    print(f"   - GPT-4o: {'✅' if openai_client else '❌'}")
    print("\n💡 Pour configurer les API keys:")
    print("   export ANTHROPIC_API_KEY='votre_clé'")
    print("   export OPENAI_API_KEY='votre_clé'")
    print("\n🌐 Serveur démarré sur http://localhost:8000")
    
    app.run(host='0.0.0.0', port=8000, debug=True)
