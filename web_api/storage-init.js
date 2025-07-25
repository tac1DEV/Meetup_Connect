
import { supabase } from '../config.js';
import FileUploadService from './services/FileUploadService.js';

// Script d'initialisation du stockage Supabase


const BUCKET_CONFIG = {
  name: 'community-images',
  public: true,
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  fileSizeLimit: 5242880, // 5MB
  allowedFileExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp']
};

// Initialiser le bucket de stockage
async function initializeStorage() {
  console.log('Initialisation du stockage Supabase...');
  
  try {
    // 1. Vérifier si le bucket existe
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Erreur lors de la récupération des buckets:', listError);
      return false;
    }

    console.log('Buckets existants:', buckets.map(b => b.name));

    const bucketExists = buckets.some(bucket => bucket.name === BUCKET_CONFIG.name);

    if (bucketExists) {
      console.log(`Le bucket "${BUCKET_CONFIG.name}" existe déjà`);
    } else {
      // 2. Créer le bucket
      console.log(`Création du bucket "${BUCKET_CONFIG.name}"...`);
      
      const { data: bucketData, error: createError } = await supabase.storage.createBucket(
        BUCKET_CONFIG.name,
        {
          public: BUCKET_CONFIG.public,
          allowedMimeTypes: BUCKET_CONFIG.allowedMimeTypes,
          fileSizeLimit: BUCKET_CONFIG.fileSizeLimit
        }
      );

      if (createError) {
        console.error('Erreur création bucket:', createError);
        return false;
      }

      console.log('Bucket créé avec succès:', bucketData);
    }

    // 3. Tester l'upload
    await testUpload();
    
    // 4. Afficher les informations de configuration
    displayConfig();
    
    return true;

  } catch (error) {
    console.error('Erreur générale:', error);
    return false;
  }
}

// Tester l'upload avec un fichier de test
async function testUpload() {
  console.log('Test d\'upload...');
  
  try {
    // Créer un blob de test (image 1x1 pixel)
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#10b981';
    ctx.fillRect(0, 0, 1, 1);

    // Convertir en blob
    const testBlob = await new Promise(resolve => {
      canvas.toBlob(resolve, 'image/png');
    });

    const testFileName = `test_${Date.now()}.png`;

    // Upload de test
    const { data, error } = await supabase.storage
      .from(BUCKET_CONFIG.name)
      .upload(testFileName, testBlob);

    if (error) {
      console.error('Erreur test upload:', error);
      return false;
    }

    console.log('Test upload réussi:', data.path);

    // Obtenir l'URL publique
    const { data: publicData } = supabase.storage
      .from(BUCKET_CONFIG.name)
      .getPublicUrl(testFileName);

    console.log('🔗 URL publique test:', publicData.publicUrl);

    // Nettoyer le fichier de test
    await supabase.storage
      .from(BUCKET_CONFIG.name)
      .remove([testFileName]);

    console.log('Fichier de test supprimé');
    
    return true;

  } catch (error) {
    console.error('Erreur test upload:', error);
    return false;
  }
}

// Afficher la configuration
function displayConfig() {
  console.log('\nCONFIGURATION SUPABASE STORAGE');
  console.log('=====================================');
  console.log(`Bucket: ${BUCKET_CONFIG.name}`);
  console.log(`Public: ${BUCKET_CONFIG.public ? 'Oui' : 'Non'}`);
  console.log(`Taille max: ${(BUCKET_CONFIG.fileSizeLimit / 1024 / 1024).toFixed(1)}MB`);
  console.log(`Types autorisés: ${BUCKET_CONFIG.allowedMimeTypes.join(', ')}`);
  console.log(`Extensions: ${BUCKET_CONFIG.allowedFileExtensions.join(', ')}`);
  console.log(`\nURL Storage: ${supabase.url}/storage/v1/object/public/${BUCKET_CONFIG.name}/`);
  console.log('\nStockage Supabase prêt à utiliser !');
}

// Diagnostiquer les problèmes de configuration
async function diagnoseStorage() {
  console.log('Diagnostic du stockage Supabase...');
  
  const issues = [];
  
  try {
    // Test de connexion
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      issues.push(`Impossible de lister les buckets: ${listError.message}`);
    } else {
      console.log('Connexion à Supabase Storage OK');
    }

    // Vérifier les buckets disponibles
    console.log('📋 Buckets disponibles:', buckets?.map(b => b.name) || []);

  } catch (error) {
    issues.push(`Erreur de connexion: ${error.message}`);
  }

  if (issues.length > 0) {
    console.log('\nPROBLÈMES DÉTECTÉS:');
    issues.forEach(issue => console.log(issue));
    console.log('\nConsultez SUPABASE_STORAGE_SETUP.md pour la configuration');
  } else {
    console.log('\nAucun problème détecté !');
  }
}


// Initialisation du système d'upload Supabase Storage
export async function initializeStorageSystem() {
  try {
    console.log('🔧 Initialisation du système de stockage Supabase...');
    
    // Créer ou vérifier le bucket community-images
    const bucketCreated = await FileUploadService.ensureBucketExists();
    
    if (bucketCreated) {
      console.log('✅ Bucket community-images prêt');
      return { success: true, message: 'Système de stockage initialisé' };
    } else {
      console.warn('⚠️ Bucket non créé, mais le service peut continuer');
      // Continuer même si le bucket n'est pas créé (problème de permissions)
      return { 
        success: true, 
        message: 'Service de stockage disponible (bucket existant ou permissions limitées)',
        warning: 'Le bucket n\'a pas pu être créé automatiquement'
      };
    }
    
  } catch (error) {
    console.error('Erreur d\'initialisation du système de stockage:', error);
    return { 
      success: false, 
      message: error.message,
      fallback: 'Le service peut fonctionner en mode dégradé'
    };
  }
}

// Vérifier l'état du système de stockage
export async function checkStorageHealth() {
  try {
    // Tenter de lister les buckets
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      return { 
        healthy: false, 
        message: `Erreur Supabase: ${error.message}`,
        buckets: [] 
      };
    }
    
    const communityBucket = buckets.find(b => b.name === 'community-images');
    
    return {
      healthy: true,
      message: 'Système de stockage opérationnel',
      buckets: buckets.length,
      communityBucketExists: !!communityBucket,
      bucketInfo: communityBucket || null
    };
    
  } catch (error) {
    return {
      healthy: false,
      message: `Erreur de vérification: ${error.message}`,
      buckets: 0
    };
  }
}

// Interface publique pour les fonctions principales
window.SupabaseStorageInit = {
  initialize: initializeStorage,
  diagnose: diagnoseStorage,
  config: BUCKET_CONFIG,
  initializeSystem: initializeStorageSystem,
  checkHealth: checkStorageHealth
};

// Auto-initialisation si demandé
if (typeof window !== 'undefined') {
  // Initialisation par paramètre URL
  if (window.location.search.includes('init-storage')) {
    document.addEventListener('DOMContentLoaded', () => {
      initializeStorage();
    });
  }

  // Auto-initialisation au chargement du module (optionnel)
  document.addEventListener('DOMContentLoaded', async () => {
    const result = await initializeStorageSystem();
    if (!result.success) {
      console.warn('Initialisation du stockage échouée:', result.message);
    }
  });
}

console.log('Module d\'initialisation Supabase Storage chargé');
console.log('Utilisez SupabaseStorageInit.initialize() pour configurer le stockage');
console.log('Utilisez SupabaseStorageInit.diagnose() pour diagnostiquer les problèmes');
