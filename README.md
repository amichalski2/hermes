# Hermes - AI-Enhanced Notes Management System

## 📝 Description
Hermes is a note management application that leverages LLMs for content processing and analysis. The system offers functionalities for converting notes to objective format, intelligent contextual search, and reminder management.

## 🚀 Key Features
- **Intelligent Note Processing**
  - Automatic conversion to objective format
  - Title generation
  - Support for raw notes without processing
  
- **Vector Database**
  - Semantic content search
  - Semantic chunking
  
- **Reminder System**
  - Create, edit and delete reminders

- **AI Chat**
  - Context-aware responses based on notes

## 🖼️ Application Preview

![Application Preview](./images/hermesui.png)

## 🛠️ Technologies
- FastAPI
- SQLAlchemy
- ChromaDB
- OpenAI API
- LangChain
- Docker

## 📋 Requirements
- Python 3.12
- OpenAI API Key
- Docker and Docker Compose

## 🔧 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd hermes
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env file with your configuration
```

3. Run with Docker:
```bash
docker-compose up --build
```