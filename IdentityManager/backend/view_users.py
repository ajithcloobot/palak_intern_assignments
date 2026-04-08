#!/usr/bin/env python3
"""
Simple script to view all users in the database
"""

import sqlite3
import os
from datetime import datetime

def view_users():
    """View all users in the database"""
    
    # Database path
    db_path = os.path.join(os.path.dirname(__file__), 'cloobot.db')
    
    if not os.path.exists(db_path):
        print("❌ Database not found!")
        return
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Get all users
        cursor.execute("SELECT id, email, provider, created_at FROM users ORDER BY created_at DESC")
        users = cursor.fetchall()
        
        if not users:
            print("📭 No users found in database!")
            return
        
        print("\n" + "="*80)
        print("👥 USERS DATABASE")
        print("="*80)
        
        for user in users:
            user_id, email, provider, created_at = user
            
            # Format provider
            if provider == "local":
                provider_emoji = "🔐"
                provider_name = "Local Authentication"
            elif provider == "okta":
                provider_emoji = "🔑"
                provider_name = "Auth0 SSO"
            else:
                provider_emoji = "❓"
                provider_name = provider
            
            # Format created_at
            try:
                created_dt = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                formatted_date = created_dt.strftime("%Y-%m-%d %H:%M:%S")
            except:
                formatted_date = created_at
            
            print(f"\n{provider_emoji} {provider_name}")
            print(f"📧 Email: {email}")
            print(f"🆔 ID: {user_id}")
            print(f"📅 Created: {formatted_date}")
            print("-" * 40)
        
        print(f"\n📊 Total Users: {len(users)}")
        
        # Count by provider
        cursor.execute("SELECT provider, COUNT(*) FROM users GROUP BY provider")
        provider_counts = cursor.fetchall()
        
        print("\n📈 Users by Provider:")
        for provider, count in provider_counts:
            if provider == "local":
                print(f"🔐 Local Auth: {count} users")
            elif provider == "okta":
                print(f"🔑 Auth0 SSO: {count} users")
            else:
                print(f"❓ {provider}: {count} users")
        
        conn.close()
        
    except Exception as e:
        print(f"❌ Error reading database: {e}")

if __name__ == "__main__":
    view_users()
