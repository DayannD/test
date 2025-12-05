#!/bin/bash

echo "Reset complet des bases de données BeeSure"
echo "================================================="
echo "ATTENTION: Cette action supprimera TOUTES les données !"
echo ""
read -p "continuer ?: " confirm

if [[ $confirm != [yY] ]]; then
    echo "Opération annulée"
    exit 0
fi

echo ""

echo "Arrêt des services et uppression des volumes"
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down -v

echo "Nettoyage des conteneurs orphelins"
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down --remove-orphans

echo ""
echo "Reset terminé !"
echo "Vous pouvez maintenant relancer : ./scripts/dev.sh"