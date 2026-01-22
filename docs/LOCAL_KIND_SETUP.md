# Local Kubernetes Setup with Kind

This guide describes how to run the eTIMS application locally using [kind (Kubernetes IN Docker)](https://kind.sigs.k8s.io/).

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running.
- [kubectl](https://kubernetes.io/docs/tasks/tools/) installed.
- [kind](https://kind.sigs.k8s.io/docs/user/quick-start/#installation) installed.

## Setup Steps

### 1. Create a Kind Cluster

We use a custom configuration to map ports 8080 and 8443 on your host to ports 80 and 443 in the cluster. This avoids conflicts if you have other services (like Apache or Nginx) running on standard ports.

```bash
# Create the cluster using the config in k8s/kind-config.yaml
kind create cluster --config k8s/kind-config.yaml
```

### 2. Install Ingress Controller

The Ingress controller routes traffic from outside the cluster to your services.

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml
```

Wait for the ingress controller to be ready:
```bash
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=90s
```

### 3. Build & Load Docker Image

Since kind runs in Docker, we need to load our locally built image into the cluster nodes.

```bash
# Build the image (using the local tag)
docker build -t etims-app:local .

# Load the image into kind
kind load docker-image etims-app:local --name etims-local
```

### 4. Deploy Application

We create the namespace, secrets, and deploy the application resources.

```bash
# Create namespace
kubectl create namespace chatnation

# Create secrets and config from your local .env file
# Ensure you have a .env file with required variables!
kubectl create secret generic etims-secrets --from-env-file=.env -n chatnation
kubectl create configmap etims-config --from-env-file=.env -n chatnation

# Apply manifests (uses 'latest' tag by default)
kubectl apply -f k8s/

# Patch the deployment to use our local image
kubectl set image deployment/etims-app etims-app=etims-app:local -n chatnation
kubectl patch deployment etims-app -n chatnation -p '{"spec":{"template":{"spec":{"containers":[{"name":"etims-app","imagePullPolicy":"IfNotPresent"}]}}}}'
```

### 5. Accessing the Application

The application is exposed via Ingress on `whatsapp.kra.go.ke`.

To access it in your browser:

1. **Option A (Recommended):** Add an entry to your `/etc/hosts` file:
   ```bash
   # Add this line to /etc/hosts
   127.0.0.1 whatsapp.kra.go.ke
   ```
   Then verify access at:
   - HTTP: `http://whatsapp.kra.go.ke:8080` (will redirect to HTTPS)
   - HTTPS: `https://whatsapp.kra.go.ke:8443` (accept the self-signed certificate warning)

2. **Option B (Curl):** Use `curl` with a custom Host header:
   ```bash
   curl -k -H "Host: whatsapp.kra.go.ke" https://localhost:8443
   ```

## Cleaning Up

To stop everything and clean up your system:

```bash
# Delete the kind cluster (removes all containers and resources)
kind delete cluster --name etims-local

# Remove the local docker image (optional)
docker rmi etims-app:local
```

## Useful Commands

- **Check deployment status:**
  ```bash
  kubectl rollout status deployment/etims-app -n chatnation
  ```
- **View logs:**
  ```bash
  kubectl logs -l app=etims-app -n chatnation
  ```
- **Restart deployment (to pick up new image):**
  ```bash
  kubectl rollout restart deployment/etims-app -n chatnation
  ```

## Troubleshooting

- **ImagePullBackOff**: Ensure you ran `kind load docker-image ...` and that `imagePullPolicy` in `deployment.yaml` is set to `IfNotPresent` or `Never`.
- **404 Not Found**: Check if the Ingress resource is created and has the correct host.
