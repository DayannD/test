#!/bin/bash

echo "Démarrage de l'environnement de développement BeeSure"
echo "================================================="

if ! docker info > /dev/null 2>&1; then
    echo "Docker n'est pas en cours d'exécution. Veuillez démarrer Docker et réessayer"
    exit 1
fi

if [ ! -f .env.dev ]; then
    echo "Le fichier .env.dev n'existe pas. Veuillez le créer à partir de .env.dev.example"
    exit 1
fi

echo "Nettoyage des conteneurs orphelins..."
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down --remove-orphans > /dev/null 2>&1

echo "Nettoyage des conteneurs orphelins..."
docker compose -f docker-compose.dev.yml up -d --build

if [ $? -eq 0 ]; then
    echo "Migrations appliquées avec succès"
else
    echo "Erreur lors des migrations. Vérifiez les logs"
fi

echo ""
echo "Environnement de développement prêt"
echo "================================================="
echo " Commandes utiles :"
echo "  - Arrêter les services: docker-compose -f docker-compose.yml -f docker-compose.dev.yml down"
echo "  - Voir les logs: docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f"
echo "  - Nettoyer les volumes: docker-compose -f docker-compose.yml -f docker-compose.dev.yml down -v"
echo ""