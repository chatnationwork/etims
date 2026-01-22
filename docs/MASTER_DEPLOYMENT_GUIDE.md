# Master Deployment Guide

This guide provides a comprehensive, step-by-step walkthrough for deploying the etims application. It covers prerequisites, architecture, local testing, and production deployment on Kubernetes.

## 1. Architecture Overview

High-level architecture of the deployed application in Kubernetes.

```mermaid
graph TD
    User((User/WhatsApp)) -->|HTTPS| Ingress[Ingress Controller]
    Ingress -->|Route: whatsapp.kra.go.ke| Service[Service: etims-service]
    
    subgraph Cluster [Kubernetes Cluster]
        Service -->|Load Balance| Pod1[Pod: etims-app-1]
        Service -->|Load Balance| Pod2[Pod: etims-app-2]
        
        Pod1 -.->|Read| Secret[Secret: etims-secrets]
        Pod1 -.->|Read| Config[ConfigMap: etims-config]
    end

    style Ingress fill:#f9f,stroke:#333,stroke-width:2px
    style Service fill:#bbf,stroke:#333,stroke-width:2px
    style Pod1 fill:#dfd,stroke:#333,stroke-width:2px
    style Pod2 fill:#dfd,stroke:#333,stroke-width:2px
```

## 2. Deployment Workflow

The process from code to running application.

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant Docker as Container Registry
    participant K8s as Kubernetes Cluster
    
    Note over Dev: 1. Prepare & Test
    Dev->>Dev: Configure .env
    Dev->>Dev: docker build -t my-reg/etims:v1 .
    
    Note over Dev, Docker: 2. Publish Artifact
    Dev->>Docker: docker push my-reg/etims:v1
    
    Note over Dev, K8s: 3. Configuration
    Dev->>K8s: kubectl create secret ...
    Dev->>K8s: kubectl create configmap ...
    
    Note over Dev, K8s: 4. Deploy
    Dev->>K8s: kubectl apply -f k8s/
    
    Note over K8s, Docker: 5. Runtime
    K8s->>Docker: Pull image
    K8s->>K8s: Start Pods
```

## 3. Prerequisites

Before you begin, ensure you have:

1.  **Docker Installed**: For building images.
2.  **Kubectl Installed**: For interacting with the cluster.
3.  **Kubernetes Cluster Access**: `kubeconfig` file configured.
4.  **Container Registry**: Access to push images (e.g., Docker Hub, GCR, ECR).
5.  **Environment Variables**:
    *   `WHATSAPP_PHONE_NUMBER_ID`
    *   `WHATSAPP_ACCESS_TOKEN`
    *   `NEXT_PUBLIC_WHATSAPP_NUMBER`

## 4. Step-by-Step Deployment

### Step 1: Secure Configuration (Secrets)

Create the necessary secrets and config maps in your cluster.

**Secrets (Sensitive Data):**
```bash
# Create namespace
kubectl create namespace chatnation

# Create secrets
kubectl create secret generic etims-secrets \
  --namespace=chatnation \
  --from-literal=WHATSAPP_PHONE_NUMBER_ID="<YOUR_PHONE_ID>" \
  --from-literal=WHATSAPP_ACCESS_TOKEN="<YOUR_ACCESS_TOKEN>"
```

**ConfigMap (Non-Sensitive):**
```bash
kubectl create configmap etims-config \
  --namespace=chatnation \
  --from-literal=NEXT_PUBLIC_WHATSAPP_NUMBER="<DISPLAY_NUMBER>" \
  --from-literal=NEXT_PUBLIC_API_BASE_URL="<API_URL>"
```

### Step 2: Build and Push Docker Image

Build the image locally and push it to your remote registry.

```bash
# Set your registry url
export REGISTRY="<YOUR_REGISTRY_URL>" # e.g., docker.io/myname or gcr.io/myproject
export TAG="v1.0.0"

# Build
docker build -t $REGISTRY/etims-app:$TAG .

# Login (if needed)
docker login

# Push
docker push $REGISTRY/etims-app:$TAG
```

### Step 3: Update Manifests

Update `k8s/deployment.yaml` to use your new image tag.

**Option A: Manual Edit**
Open `k8s/deployment.yaml` and change line 20:
```yaml
image: <YOUR_REGISTRY_URL>/etims-app:v1.0.0
```

**Option B: CLI Command**
```bash
# If on Linux/Mac
sed -i "s|image: .*|image: $REGISTRY/etims-app:$TAG|g" k8s/deployment.yaml
```

### Step 4: Apply to Kubernetes

Deploy the resources to your cluster.

```bash
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
```

### Step 5: Verification

Check if everything is running correctly.

```bash
# View all resources
kubectl get all -n chatnation

# Check logs of the app
kubectl logs -l app=etims-app -n chatnation
```

## 5. Troubleshooting Guide

| Issue | Check | Solution |
|-------|-------|----------|
| **ImagePullBackOff** | `kubectl describe pod ...` | Check if Registry URL is correct and if K8s has pull secrets. |
| **CrashLoopBackOff** | `kubectl logs ...` | Check application logs. Often missing env vars. |
| **Ingress 404** | `kubectl get ingress` | Check if Host rule matches your URL exactly. |
| **Pending Pods** | `kubectl get nodes` | Check if cluster has enough resources (CPU/Memory). |

### Common Commands for Debugging

```bash
# Stream logs
kubectl logs -f -l app=etims-app -n chatnation

# Enter the container shell
kubectl exec -it deployment/etims-app -n chatnation -- sh

# Restart deployment
kubectl rollout restart deployment/etims-app -n chatnation
```
