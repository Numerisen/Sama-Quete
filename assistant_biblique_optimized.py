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
import sqlite3
from pathlib import Path

app = Flask(__name__)
CORS(app)

# Configuration des LLMs - CLAUDE PRIORITAIRE
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY')

# Initialisation des clients
openai_client = openai.OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None
anthropic_client = Anthropic(api_key=ANTHROPIC_API_KEY) if ANTHROPIC_API_KEY else None

# Cache pour les réponses
response_cache = {}

# Configuration de la base de données biblique
BIBLE_DB_PATH = os.getenv('BIBLE_DB_PATH', 'bible_database.db')

def clean_text(text):
    """Nettoie le texte extrait"""
    if not text:
        return ''
    text = text.replace('\u00a0', ' ').replace('\xa0', ' ')
    text = text.replace('\n', ' ').replace('\r', ' ')
    text = text.replace('\t', ' ')
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'\s+([.,;:!\?])', r'\1', text)
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

def search_bible_database(question: str) -> Dict:
    """Recherche dans votre base de données biblique"""
    try:
        # Connexion à votre base de données
        conn = sqlite3.connect(BIBLE_DB_PATH)
        cursor = conn.cursor()
        
        # Extraction des mots-clés de la question
        keywords = re.findall(r'\b\w+\b', question.lower())
        
        # Recherche dans les passages bibliques
        query = """
        SELECT book, chapter, verse, text, reference 
        FROM bible_verses 
        WHERE text LIKE ? OR reference LIKE ?
        ORDER BY 
            CASE 
                WHEN text LIKE ? THEN 1
                WHEN reference LIKE ? THEN 2
                ELSE 3
            END
        LIMIT 5
        """
        
        search_term = f"%{' '.join(keywords)}%"
        cursor.execute(query, (search_term, search_term, search_term, search_term))
        results = cursor.fetchall()
        
        conn.close()
        
        # Formatage des résultats
        passages = []
        for row in results:
            passages.append({
                'book': row[0],
                'chapter': row[1],
                'verse': row[2],
                'text': row[3],
                'reference': row[4]
            })
        
        return {
            'passages': passages,
            'keywords_found': keywords,
            'total_results': len(passages)
        }
        
    except Exception as e:
        print(f"Erreur base de données: {e}")
        return {'passages': [], 'keywords_found': [], 'total_results': 0}

def get_contextual_bible_data(question: str) -> str:
    """Récupère le contexte biblique pertinent depuis votre BDD"""
    bible_data = search_bible_database(question)
    
    if not bible_data['passages']:
        # Fallback vers des passages généraux
        return "Bible générale - Ancien et Nouveau Testament"
    
    # Construction du contexte
    context_parts = []
    for passage in bible_data['passages'][:3]:  # Limiter à 3 passages
        context_parts.append(f"{passage['reference']}: {passage['text'][:200]}...")
    
    return " | ".join(context_parts)

def ask_claude_optimized(question: str, context: str) -> Dict:
    """Version optimisée de Claude pour votre base de données"""
    if not anthropic_client:
        raise Exception("Claude API key not configured")
    
    # Prompt spécialisé pour la précision biblique
    system_prompt = f"""Tu es un assistant spirituel catholique spécialisé dans l'enseignement biblique pour SamaQuete.

CONTEXTE BIBLIQUE DISPONIBLE:
{context}

INSTRUCTIONS PRÉCISES:
1. Réponds UNIQUEMENT en te basant sur les passages bibliques fournis
2. Cite TOUJOURS les références exactes (ex: Matthieu 5:3-12)
3. Explique clairement le sens spirituel
4. Adapte ton langage au contexte sénégalais catholique
5. Sois précis et concis (maximum 300 mots)
6. Si tu ne trouves pas d'information dans le contexte, dis-le clairement

FORMAT DE RÉPONSE:
- Citation biblique précise
- Explication claire et accessible
- Application pratique pour la vie de foi
- Référence complète

Réponds en français, de manière claire et respectueuse."""

    try:
        response = anthropic_client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=800,  # Limité pour la précision
            temperature=0.3,  # Plus déterministe pour la précision
            system=system_prompt,
            messages=[{"role": "user", "content": question}]
        )
        
        # Extraction des références bibliques de la réponse
        references = re.findall(r'[A-Za-z]+ \d+:\d+(?:-\d+)?', response.content[0].text)
        
        return {
            "answer": response.content[0].text,
            "model": "Claude 3.5 Sonnet (Optimisé)",
            "confidence": 0.95,  # Haute confiance avec contexte BDD
            "sources": references if references else [context.split('|')[0].strip()],
            "bible_references": references,
            "context_used": context
        }
    except Exception as e:
        raise Exception(f"Erreur Claude: {str(e)}")

def ask_gpt4_fallback(question: str, context: str) -> Dict:
    """Fallback GPT-4 si Claude n'est pas disponible"""
    if not openai_client:
        raise Exception("OpenAI API key not configured")
    
    system_prompt = f"""Tu es un assistant spirituel catholique. Utilise ce contexte biblique:

{context}

Réponds précisément en citant les références. Maximum 300 mots."""

    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": question}
            ],
            max_tokens=600,
            temperature=0.3
        )
        
        references = re.findall(r'[A-Za-z]+ \d+:\d+(?:-\d+)?', response.choices[0].message.content)
        
        return {
            "answer": response.choices[0].message.content,
            "model": "GPT-4o (Fallback)",
            "confidence": 0.85,
            "sources": references if references else [context.split('|')[0].strip()],
            "bible_references": references,
            "context_used": context
        }
    except Exception as e:
        raise Exception(f"Erreur GPT-4: {str(e)}")

def ask_llm_optimized(question: str, context: str = "general") -> Dict:
    """Version optimisée avec priorité Claude"""
    # Vérifier le cache d'abord
    cached = get_cached_response(question, context)
    if cached:
        return cached
    
    # Obtenir le contexte biblique depuis votre BDD
    bible_context = get_contextual_bible_data(question)
    
    # Stratégie: Claude en priorité, GPT-4 en fallback
    try:
        if anthropic_client:
            response = ask_claude_optimized(question, bible_context)
        elif openai_client:
            response = ask_gpt4_fallback(question, bible_context)
        else:
            raise Exception("Aucun LLM configuré")
        
        # Mettre en cache la réponse
        cache_response(question, context, response)
        return response
        
    except Exception as e:
        # Fallback vers une réponse basique avec contexte BDD
        return {
            "answer": f"Je ne peux pas répondre à cette question pour le moment. Contexte disponible: {bible_context[:100]}...",
            "model": "Fallback",
            "confidence": 0.1,
            "sources": [bible_context.split('|')[0].strip()] if bible_context else [],
            "bible_references": [],
            "context_used": bible_context,
            "error": str(e)
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
    url = f'https://www.aelf.org/{date_str}/romain/prière'
    
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
    """Endpoint optimisé pour l'assistant IA biblique"""
    try:
        data = request.get_json()
        question = data.get('question', '').strip()
        context = data.get('context', 'general')
        
        if not question:
            return jsonify({'error': 'Question requise'}), 400
        
        if len(question) < 5:
            return jsonify({'error': 'Question trop courte'}), 400
        
        # Obtenir la réponse optimisée
        response = ask_llm_optimized(question, context)
        
        # Ajouter des métadonnées
        response['timestamp'] = datetime.now().isoformat()
        response['question'] = question
        response['processing_time'] = time.time()
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({
            'error': 'Erreur interne du serveur',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/assistant/suggestions')
def get_suggestions():
    """Suggestions optimisées pour votre contexte"""
    suggestions = [
        "Que dit Jésus sur l'amour du prochain ?",
        "Comment prier selon la Bible ?",
        "Qu'est-ce que la charité chrétienne ?",
        "Que dit la Bible sur le pardon ?",
        "Comment vivre sa foi au quotidien ?",
        "Que dit Jésus sur la prière ?",
        "Qu'est-ce que l'espérance chrétienne ?",
        "Comment préparer un baptême ?",
        "Que dit la Bible sur la famille ?",
        "Qu'est-ce que la Pentecôte ?"
    ]
    
    return jsonify({
        'suggestions': suggestions,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/assistant/stats')
def get_stats():
    """Statistiques détaillées"""
    return jsonify({
        'cached_responses': len(response_cache),
        'models_available': {
            'claude': anthropic_client is not None,
            'gpt4': openai_client is not None
        },
        'bible_database': {
            'connected': os.path.exists(BIBLE_DB_PATH),
            'path': BIBLE_DB_PATH
        },
        'timestamp': datetime.now().isoformat()
    })

@app.route('/health')
def health():
    return jsonify({'status': 'ok', 'message': 'API optimisée en cours d\'exécution'})

if __name__ == '__main__':
    print("🚀 Assistant Biblique IA Optimisé")
    print("📚 Configuration:")
    print(f"   - Claude 3.5 Sonnet: {'✅' if anthropic_client else '❌'}")
    print(f"   - GPT-4o Fallback: {'✅' if openai_client else '❌'}")
    print(f"   - Base de données: {'✅' if os.path.exists(BIBLE_DB_PATH) else '❌'}")
    print("\n🎯 Optimisé pour:")
    print("   - Réponses précises basées sur votre BDD")
    print("   - Citations bibliques exactes")
    print("   - Contexte sénégalais catholique")
    print("\n🌐 Serveur: http://localhost:8000")
    
    app.run(host='0.0.0.0', port=8000, debug=True)
