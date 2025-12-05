# Spark functionment 

Une fois les containers Dev ou Prod buildé.  
Il est maintenant possible d'aller dans container avec la possible : 
````agsl
docker exec -it spark-app /bin/bash
````
Une fois dans le container vous pouvez vérifier que le script est bien dans le "workdir" avec la commande:
````agsl
ls
````
Qui devrai vous resortir :
````agsl
root@spark-app:/data# ls

predict_incident_by_week.py  requirements.txt
````

De la, il est possible de lancer le script de prédiction d'incident :
````agsl
python3 predict_incident_by_week.py 
````

Le résultat de la prédiction sera disponible dans le dossier data sous forme de Json. 