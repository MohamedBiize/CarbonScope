from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

class MongoDBConfig:
    """Configuration pour MongoDB Atlas ou MongoDB local."""
    
    # URL de connexion pour MongoDB Atlas (service cloud)
    MONGODB_ATLAS_URL = "mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority"
    
    # Configuration pour MongoDB local (si installé)
    MONGODB_LOCAL_HOST = "localhost"
    MONGODB_LOCAL_PORT = 27017
    
    # Nom de la base de données
    DATABASE_NAME = "carbonscope"
    
    @staticmethod
    def get_client(use_atlas=False):
        """Obtenir un client MongoDB.
        
        Args:
            use_atlas (bool): Si True, utilise MongoDB Atlas, sinon tente une connexion locale.
            
        Returns:
            MongoClient: Client MongoDB connecté.
        """
        if use_atlas:
            # Utiliser MongoDB Atlas (cloud)
            client = MongoClient(MongoDBConfig.MONGODB_ATLAS_URL, server_api=ServerApi("1"))
        else:
            # Utiliser MongoDB local ou Docker
            client = MongoClient(
                host=MongoDBConfig.MONGODB_LOCAL_HOST,
                port=MongoDBConfig.MONGODB_LOCAL_PORT
            )
        
        return client
    
    @staticmethod
    def get_database(use_atlas=False):
        """Obtenir la base de données MongoDB.
        
        Args:
            use_atlas (bool): Si True, utilise MongoDB Atlas, sinon tente une connexion locale.
            
        Returns:
            Database: Base de données MongoDB.
        """
        client = MongoDBConfig.get_client(use_atlas)
        return client[MongoDBConfig.DATABASE_NAME]
