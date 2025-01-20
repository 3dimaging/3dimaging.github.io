from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Get the environment
ENV = os.getenv('FLASK_ENV', 'production')
if ENV == 'development':
    # Local SQLite database
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///analytics.db'
else:
    # Use PostgreSQL for production (you'll need to set this in Vercel)
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Database Models
class Visit(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    user_agent = db.Column(db.String(500))
    ip_address = db.Column(db.String(50))
    referrer = db.Column(db.String(500))
    is_mobile = db.Column(db.Boolean)
    screen_resolution = db.Column(db.String(50))
    language = db.Column(db.String(50))

class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    event_type = db.Column(db.String(50))
    event_data = db.Column(db.String(500))
    user_agent = db.Column(db.String(500))
    ip_address = db.Column(db.String(50))

# Create tables
with app.app_context():
    db.create_all()

@app.route('/api/track-visit', methods=['POST'])
def track_visit():
    try:
        data = request.json
        visit = Visit(
            user_agent=request.headers.get('User-Agent'),
            ip_address=request.remote_addr,
            referrer=request.referrer,
            is_mobile=data.get('isMobile', False),
            screen_resolution=data.get('screenResolution'),
            language=request.headers.get('Accept-Language')
        )
        db.session.add(visit)
        db.session.commit()
        return jsonify({'status': 'success'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/track-event', methods=['POST'])
def track_event():
    try:
        data = request.json
        event = Event(
            event_type=data.get('eventType'),
            event_data=str(data.get('eventData')),
            user_agent=request.headers.get('User-Agent'),
            ip_address=request.remote_addr
        )
        db.session.add(event)
        db.session.commit()
        return jsonify({'status': 'success'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/analytics', methods=['GET'])
def get_analytics():
    try:
        # Get total visits
        total_visits = Visit.query.count()
        
        # Get visits by device type
        mobile_visits = Visit.query.filter_by(is_mobile=True).count()
        desktop_visits = Visit.query.filter_by(is_mobile=False).count()
        
        # Get most common events
        from sqlalchemy import func
        top_events = db.session.query(
            Event.event_type,
            func.count(Event.id).label('count')
        ).group_by(Event.event_type).order_by(func.count(Event.id).desc()).limit(5).all()
        
        top_events_list = [{'event_type': event[0], 'count': event[1]} for event in top_events]
        
        return jsonify({
            'totalVisits': total_visits,
            'mobileVisits': mobile_visits,
            'desktopVisits': desktop_visits,
            'topEvents': top_events_list
        }), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

# Health check endpoint for Vercel
@app.route('/', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'}), 200

# For local development
if __name__ == '__main__':
    app.run(debug=True, port=5000)
