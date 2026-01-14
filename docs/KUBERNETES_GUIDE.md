# Kubernetes Deployment Guide

This document explains how to deploy the eTIMS application to Kubernetes.

---

## Quick Reference: What to Change

Before deploying, update these values in the manifests:

| File | Line | Current Value | Change To |
|------|------|---------------|-----------|
| `deployment.yaml` | 20 | `etims-app:latest` | Your registry path (e.g., `gcr.io/project/etims-app:v1.0.0`) |
| `ingress.yaml` | 13, 16 | `whatsapp.kra.go.ke` | Your actual domain |
| All files | 5 | `chatnation` | Your preferred namespace (or keep as-is) |

---

## What You Need From KRA

| Item | Purpose |
|------|---------|
| Container Registry URL | Where to push Docker images |
| Domain name | For public access (Ingress) |
| Kubernetes cluster access | `kubeconfig` file for `kubectl` |
| Namespace name | Or use default `chatnation` |

---

## Deployment Steps

### Phase 1: Build & Push Docker Image

```bash
# Build the production image
docker build -t <REGISTRY>/etims-app:v1.0.0 .

# Login to registry (example for Docker Hub)
docker login

# Push to registry
docker push <REGISTRY>/etims-app:v1.0.0
```

**Examples by provider:**
- **Docker Hub**: `docker.io/username/etims-app:v1.0.0`
- **Google Cloud**: `gcr.io/project-id/etims-app:v1.0.0`
- **Azure**: `myregistry.azurecr.io/etims-app:v1.0.0`
- **AWS ECR**: `123456789.dkr.ecr.region.amazonaws.com/etims-app:v1.0.0`

---

### Phase 2: Prepare Cluster (One-Time Setup)

```bash
# 1. Create namespace
kubectl create namespace chatnation

# 2. Create secrets for sensitive environment variables
kubectl create secret generic etims-secrets \
  --namespace=chatnation \
  --from-literal=WHATSAPP_PHONE_NUMBER_ID="your-actual-phone-id" \
  --from-literal=WHATSAPP_ACCESS_TOKEN="your-actual-token"

# 3. Create configmap for non-sensitive environment variables
kubectl create configmap etims-config \
  --namespace=chatnation \
  --from-literal=NEXT_PUBLIC_WHATSAPP_NUMBER="254XXXXXXXXX"
```

---

### Phase 3: Update Manifests

Edit `k8s/deployment.yaml` line 20:
```yaml
image: <YOUR-REGISTRY>/etims-app:v1.0.0
```

Edit `k8s/ingress.yaml` lines 13 and 16 (if domain changes):
```yaml
- whatsapp.kra.go.ke  # Replace with actual domain
```

---

### Phase 4: Deploy

```bash
# Apply all manifests at once
kubectl apply -f k8s/

# Or apply individually
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
```

---

### Phase 5: Verify

```bash
# Check pods are running (should show 2 pods with STATUS: Running)
kubectl get pods -n chatnation

# Check service exists
kubectl get svc -n chatnation

# Check ingress has an external IP/hostname
kubectl get ingress -n chatnation

# View logs if something is wrong
kubectl logs -l app=etims-app -n chatnation
```

---

## Updating the Application

When you have new code changes:

```bash
# 1. Build new image with new tag
docker build -t <REGISTRY>/etims-app:v1.0.1 .
docker push <REGISTRY>/etims-app:v1.0.1

# 2. Update deployment with new image
kubectl set image deployment/etims-app \
  etims-app=<REGISTRY>/etims-app:v1.0.1 \
  -n chatnation

# 3. Watch rollout progress
kubectl rollout status deployment/etims-app -n chatnation
```

---

## Useful Commands

| Command | What it does |
|---------|--------------|
| `kubectl get pods -n chatnation` | List all pods |
| `kubectl logs <pod-name> -n chatnation` | View pod logs |
| `kubectl logs -f <pod-name> -n chatnation` | Stream logs live |
| `kubectl describe pod <pod-name> -n chatnation` | Debug pod issues |
| `kubectl exec -it <pod-name> -n chatnation -- sh` | Shell into pod |
| `kubectl rollout restart deployment/etims-app -n chatnation` | Restart all pods |
| `kubectl scale deployment/etims-app --replicas=3 -n chatnation` | Scale to 3 pods |
| `kubectl delete -f k8s/` | Remove all resources |

---

## Architecture Overview

```
Internet (HTTPS)
       │
       ▼
┌──────────────────────┐
│  Ingress             │  Routes whatsapp.kra.go.ke → Service
│  (TLS termination)   │  Handles SSL certificates
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Service             │  Internal load balancer
│  (etims-service:80)  │  Distributes traffic to pods
└──────────┬───────────┘
           │
     ┌─────┴─────┐
     ▼           ▼
┌─────────┐ ┌─────────┐
│  Pod 1  │ │  Pod 2  │   Your app running (port 3000)
│  :3000  │ │  :3000  │   Auto-restarted if unhealthy
└─────────┘ └─────────┘
```

---

## Kubernetes Concepts Explained

| Concept | What it is |
|---------|------------|
| **Pod** | Smallest unit. Runs your container. Can crash and restart. |
| **Deployment** | Manages pods. Ensures 2 copies always running. Handles updates. |
| **Service** | Stable network address. Load balances across pods. |
| **Ingress** | Entry point from internet. Routes domains to services. |
| **Secret** | Stores sensitive data (passwords, tokens). Encrypted. |
| **ConfigMap** | Stores non-sensitive config. Easy to update. |
| **Namespace** | Logical isolation. Groups related resources. |

---

## Troubleshooting

**Pods not starting?**
```bash
kubectl describe pod <pod-name> -n chatnation
# Look at "Events" section at the bottom
```

**Image pull errors?**
- Check registry URL is correct
- Ensure cluster has credentials to pull from private registry

**App crashing?**
```bash
kubectl logs <pod-name> -n chatnation --previous
# Shows logs from the crashed container
```

**Ingress not working?**
- Verify ingress controller is installed: `kubectl get pods -n ingress-nginx`
- Check ingress has ADDRESS: `kubectl get ingress -n chatnation`
- Verify DNS points to the ingress IP
