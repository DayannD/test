#!/bin/bash

echo "Démarrage de l'environnement de production BeeSure"
echo "================================================="

if ! docker info > /dev/null 2>&1; then
    echo "Docker n'est pas en cours d'exécution. Veuillez démarrer Docker et réessayer."
    exit 1
fi

if [ ! -f .env ]; then
    echo "Le fichier .env n'existe pas. Utilisation des valeurs par défaut."
    echo "   Créez un fichier .env pour personnaliser la configuration."
fi

echo "Construction des images Docker..."
docker-compose --profile production build

echo "Démarrage des services de production..."
docker-compose --profile production up -d

echo ""
echo "Environnement de production déployé avec succès !"
echo "================================================="
echo "Commandes utiles :"
echo "  - Voir le statut: docker-compose --profile production ps"
echo "  - Voir les logs: docker-compose --profile production logs -f"
echo "  - Redémarrer: docker-compose --profile production restart"
echo "  - Arrêter: docker-compose --profile production down"
echo "  - Nettoyer complètement: docker-compose --profile production down -v --rmi all"
echo ""
echo "Monitoring :"
echo "  - Logs PostgreSQL: docker-compose logs -f postgres"
echo "  - Logs MongoDB: docker-compose logs -f mongodb"
echo "  - Logs API: docker-compose logs -f api"
echo "  - Logs Frontend: docker-compose logs -f web"
echo "  - Logs Nginx: docker-compose logs -f nginx"
echo ""