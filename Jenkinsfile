pipeline {
  agent any
  environment {
    IMAGE_NAME = "pharmacy_frontend:${env.BUILD_NUMBER}"
    DOCKER_REGISTRY = ""
  }
  stages {
    stage('Checkout') {
      steps {
        echo 'Step: Checkout frontend source from Git URL'
        git url: 'https://github.com/Omar09G/pharmacy-frontend.git', branch: 'main'
        echo 'Done: Checkout'
      }
    }

    stage('Validate Docker environment') {
      steps {
        echo 'Step: Validating Docker and Compose availability'
        sh '''
set -e
cd "$WORKSPACE"
if ! command -v docker >/dev/null 2>&1; then
  echo 'ERROR: Docker command not available.'
  exit 1
fi

echo 'Docker version:'
docker --version

echo 'Docker Compose version:'
docker compose version

echo 'Checking socket permissions:'
if [ -S /var/run/docker.sock ]; then
  ls -l /var/run/docker.sock
else
  echo 'ERROR: /var/run/docker.sock not found.'
  exit 1
fi

echo 'Testing docker daemon access:'
docker info >/dev/null 2>&1 || {
  echo 'ERROR: Cannot access Docker daemon.'
  docker info 2>&1 | sed 's/^/    /'
  exit 1
}
'''
        echo 'Done: Docker environment validated'
      }
    }

    stage('Install dependencies and build') {
      steps {
        echo 'Step: Installing dependencies and building frontend'
        sh '''
set -e
cd "$WORKSPACE"
docker run --rm -v "$PWD":/work -w /work node:20-alpine sh -c "npm ci && npm run build"
'''
        echo 'Done: Frontend build complete'
      }
    }

    stage('Build Docker image') {
      steps {
        echo 'Step: Building frontend Docker image'
        sh '''
set -e
cd "$WORKSPACE"
docker build -t ${IMAGE_NAME} .
'''
        echo 'Done: Docker image built'
      }
    }

    stage('Run docker compose and validate frontend') {
      steps {
        echo 'Step: Starting frontend with docker compose and validating service'
        sh '''
set -e
cd "$WORKSPACE"
export IMAGE_NAME=${IMAGE_NAME}
export FRONTEND_HOST_PORT="${FRONTEND_HOST_PORT:-8185}"

echo 'Cleaning up previous Docker Compose services and containers...'
docker compose -f docker-compose.yml down --remove-orphans || true

echo 'Starting frontend service from docker-compose.yml'
docker compose -f docker-compose.yml up -d frontend

RESOLVED_PORT="$(docker compose -f docker-compose.yml port frontend 8085 | awk -F: '{print $NF}' | tr -d '[:space:]')"
if [ -z "$RESOLVED_PORT" ]; then
  echo 'Could not resolve mapped frontend port from docker compose.'
  docker compose -f docker-compose.yml ps
  docker compose -f docker-compose.yml logs frontend --tail=200 || true
  exit 1
fi
echo "Frontend mapped to localhost:${RESOLVED_PORT}"

echo "Waiting for the frontend to respond on port ${RESOLVED_PORT}"
RETRIES=30
for i in $(seq 1 $RETRIES); do
  if curl -sS "http://localhost:${RESOLVED_PORT}/" >/dev/null 2>&1; then
    echo "Frontend responded on port ${RESOLVED_PORT}"
    break
  fi
  echo "Waiting for frontend (attempt $i/$RETRIES)..."
  sleep 2
done

if ! curl -sS "http://localhost:${RESOLVED_PORT}/" >/dev/null 2>&1; then
  echo "Frontend did not respond on port ${RESOLVED_PORT}"
  docker compose -f docker-compose.yml ps
  docker compose -f docker-compose.yml logs frontend --tail=200 || true
  exit 1
fi

echo 'Frontend validated successfully'
'''
        echo 'Done: Frontend validated and left running'
      }
    }

    stage('Push image (optional)') {
      when {
        expression { return env.DOCKER_REGISTRY?.trim() }
      }
      steps {
        sh '''
set -e
TARGET="${DOCKER_REGISTRY}/${IMAGE_NAME}"
docker tag ${IMAGE_NAME} ${TARGET}
docker push ${TARGET}
'''
      }
    }
  }

  post {
    success {
      echo 'Frontend container left running for continued access.'
    }
    failure {
      echo 'Build failed; keeping compose services running for investigation.'
    }
  }
}
