# Mobile App Flutter

Application mobile Flutter pour le projet BeeSure.

## Installation de Flutter

### Prérequis
- **Git** : Assurez-vous d'avoir Git installé sur votre machine
- **Un éditeur de code** : VS Code, Android Studio ou IntelliJ IDEA
- **Pour Android** : Android Studio avec Android SDK

### Installation de Flutter
#### Linux
1. Téléchargez le SDK Flutter depuis [flutter.dev](https://docs.flutter.dev/get-started/install/linux)
2. Décompressez l'archive : `tar xf flutter_linux_*-stable.tar.xz`
3. Ajoutez Flutter à votre PATH : `export PATH="$PATH:`pwd`/flutter/bin"`
4. Exécutez `flutter doctor`

### Vérification de l'installation
```bash
flutter doctor
```
Cette commande vérifie votre installation et affiche les éventuels problèmes à résoudre.

### Configuration supplémentaire pour Linux

Après l'installation de Flutter, vous devrez installer des outils supplémentaires selon vos besoins :

#### Pour le développement Android
1. **Installer Android Studio** :
   - Téléchargez depuis [developer.android.com/studio](https://developer.android.com/studio)
   - Lancez Android Studio et suivez l'assistant de première configuration
   - Installez le SDK Android et les outils de build

2. **Ou installer uniquement le SDK Android** :
   ```bash
   # Installer Java
   sudo apt install openjdk-11-jdk
   
   # Télécharger et installer Android SDK
   # Suivre les instructions sur https://flutter.dev/docs/get-started/install/linux#android-setup
   
   # Configurer les variables d'environnement
   export ANDROID_SDK_ROOT=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_SDK_ROOT/cmdline-tools/latest/bin
   export PATH=$PATH:$ANDROID_SDK_ROOT/platform-tools
   ```

#### Vérification finale
```bash
flutter doctor -v
```
Cette commande doit maintenant afficher tous les outils comme correctement installés.

## Configuration du projet

1. **Cloner le projet** :
   ```bash
   git clone [URL_DU_PROJET]
   cd BeeSure/apps/mobile_app
   ```

2. **Installer les dépendances** :
   ```bash
   flutter pub get
   ```

3. **Vérifier les appareils disponibles** :
   ```bash
   flutter devices
   ```

## Lancement de l'application

### Mode développement
```bash
# Lancer sur l'appareil par défaut
flutter run

# Lancer sur Desktop Linux
flutter run -d linux

# Lancer sur un appareil spécifique
flutter run -d [device-id]

# Lancer en mode debug avec hot reload
flutter run --debug
```

### Builds de production
```bash
# Build Android (APK)
flutter build apk

# Build Android (Bundle)
flutter build appbundle

# Build iOS (nécessite macOS)
flutter build ios
```

## Commandes utiles

```bash
# Hot reload (pendant que l'app tourne)
r

# Hot restart
R

# Quitter l'application
q

# Nettoyer le projet
flutter clean

# Analyser le code
flutter analyze

# Lancer les tests
flutter test
```

## Ressources Flutter
- [Documentation officielle Flutter](https://docs.flutter.dev/)
- [Cookbook Flutter](https://docs.flutter.dev/cookbook)
- [API Reference](https://api.flutter.dev/)
- [Premier projet Flutter](https://docs.flutter.dev/get-started/codelab)
