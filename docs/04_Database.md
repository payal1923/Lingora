# Lingora Database Design

## Users Table

- id
- full_name
- email
- password
- profile_image
- created_at

## Conversations Table

- id
- user_id
- user_message
- ai_response
- created_at

## Progress Table

- id
- user_id
- streak
- total_conversations
- grammar_score
- vocabulary_score
- updated_at
