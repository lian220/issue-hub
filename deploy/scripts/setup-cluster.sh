#!/bin/bash
# k3d 클러스터 생성 스크립트

set -e

CLUSTER_NAME="issuehub"

echo "Creating k3d cluster: $CLUSTER_NAME"
k3d cluster create $CLUSTER_NAME \
  --agents 2 \
  --port "80:80@loadbalancer" \
  --port "443:443@loadbalancer"

echo "Cluster created. Deploying with Helm..."
helm install $CLUSTER_NAME ./deploy/charts/issuehub

echo "Done! Access at http://issuehub.local"
