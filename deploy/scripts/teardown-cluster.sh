#!/bin/bash
# k3d 클러스터 삭제 스크립트

set -e

CLUSTER_NAME="issuehub"

echo "Deleting k3d cluster: $CLUSTER_NAME"
k3d cluster delete $CLUSTER_NAME

echo "Cluster deleted."
