Get-NetTcpConnection -LocalPort 8000 | Select-Object OwningProcess | ForEach-Object {Stop-Process -Id $_.OwningProcess -Force}# AI-Booking Project - Hotel Booking System

## Project Overview
Full-stack Hotel Booking System with AI integration capabilities.

## Tech Stack
- **Frontend**: Next.js 15 (App Router), Tailwind CSS, Shadcn/UI
- **Backend**: Python FastAPI
- **Database**: SQLite with SQLAlchemy ORM

## Project Structure
- `/frontend` - Next.js application
- `/backend` - FastAPI application

## Development Guidelines
- Use TypeScript for Frontend development
- Follow Python PEP 8 style guide for Backend
- Use async/await patterns for API calls
- Maintain proper error handling

## Setup Instructions
See README.md for detailed setup and run instructions.
