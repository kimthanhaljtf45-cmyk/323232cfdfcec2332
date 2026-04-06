from fastapi import FastAPI, Request, Response
from starlette.middleware.cors import CORSMiddleware
import httpx
import subprocess
import os
import signal
import logging
import asyncio
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# NestJS configuration
NESTJS_HOST = "http://127.0.0.1:3001"
nestjs_process = None

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

async def start_nestjs():
    """Start NestJS server in background"""
    global nestjs_process
    if nestjs_process is None:
        logger.info("Starting NestJS server...")
        env = os.environ.copy()
        env['PORT'] = '3001'
        env['MONGO_URL'] = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
        env['DB_NAME'] = os.environ.get('DB_NAME', 'test_database')
        env['JWT_ACCESS_SECRET'] = os.environ.get('JWT_ACCESS_SECRET', 'super-secret-key-12345')
        env['JWT_REFRESH_SECRET'] = os.environ.get('JWT_REFRESH_SECRET', 'refresh-secret-key-67890')
        env['JWT_ACCESS_EXPIRES'] = os.environ.get('JWT_ACCESS_EXPIRES', '7d')
        env['JWT_REFRESH_EXPIRES'] = os.environ.get('JWT_REFRESH_EXPIRES', '30d')
        
        nestjs_process = subprocess.Popen(
            ['node', 'dist/main.js'],
            cwd=str(ROOT_DIR),
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
        )
        # Give NestJS time to start
        await asyncio.sleep(3)
        logger.info(f"NestJS server started (PID: {nestjs_process.pid})")

@app.on_event("startup")
async def startup_event():
    await start_nestjs()

@app.on_event("shutdown")
async def shutdown_event():
    global nestjs_process
    if nestjs_process:
        logger.info("Stopping NestJS server...")
        nestjs_process.terminate()
        try:
            nestjs_process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            nestjs_process.kill()
        nestjs_process = None

@app.api_route("/api/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])
async def proxy_to_nestjs(request: Request, path: str):
    """Proxy all /api/* requests to NestJS"""
    global nestjs_process
    
    # Check if NestJS is running
    if nestjs_process and nestjs_process.poll() is not None:
        logger.warning("NestJS process died, restarting...")
        nestjs_process = None
        await start_nestjs()
    
    try:
        # Build the target URL
        target_url = f"{NESTJS_HOST}/api/{path}"
        if request.query_params:
            target_url += f"?{request.query_params}"
        
        # Get request body
        body = await request.body()
        
        # Build headers (exclude host)
        headers = dict(request.headers)
        headers.pop('host', None)
        headers.pop('content-length', None)
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.request(
                method=request.method,
                url=target_url,
                headers=headers,
                content=body if body else None,
            )
            
            # Build response headers
            response_headers = dict(response.headers)
            response_headers.pop('content-encoding', None)
            response_headers.pop('content-length', None)
            response_headers.pop('transfer-encoding', None)
            
            return Response(
                content=response.content,
                status_code=response.status_code,
                headers=response_headers,
                media_type=response.headers.get('content-type', 'application/json'),
            )
    except httpx.ConnectError:
        logger.error("Cannot connect to NestJS server, attempting restart...")
        nestjs_process = None
        await start_nestjs()
        return Response(
            content='{"error": "Backend service temporarily unavailable"}',
            status_code=503,
            media_type='application/json',
        )
    except Exception as e:
        logger.error(f"Proxy error: {e}")
        return Response(
            content=f'{{"error": "{str(e)}"}}',
            status_code=500,
            media_type='application/json',
        )

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    nestjs_healthy = False
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{NESTJS_HOST}/api/health")
            nestjs_healthy = response.status_code == 200
    except:
        pass
    
    return {
        "status": "ok" if nestjs_healthy else "degraded",
        "proxy": "running",
        "nestjs": "running" if nestjs_healthy else "not_available",
    }
