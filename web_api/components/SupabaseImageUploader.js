import { supabase } from '../../config.js';

// Composant d'upload d'image utilisant Supabase Storage
export function SupabaseImageUploader({ 
  onImageUploaded, 
  currentImage = null, 
  className = '',
  bucketName = 'community-images'
}) {
  const uploaderId = `supabase-uploader-${Date.now()}`;
  
  // État local
  let isUploading = false;
  let previewUrl = currentImage;

  // Valider le fichier
  function validateFile(file) {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Type de fichier non autorisé. Utilisez JPG, PNG, GIF ou WEBP.');
    }

    if (file.size > maxSize) {
      throw new Error('Fichier trop volumineux. Taille maximum : 5MB.');
    }

    return true;
  }

  // Générer un nom de fichier unique
  function generateFileName(file) {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split('.').pop();
    return `community_${timestamp}_${randomSuffix}.${extension}`;
  }

  // Redimensionner l'image avant upload
  function resizeImage(file, maxWidth = 800, maxHeight = 600) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        let { width, height } = img;
        
        // Calculer les nouvelles dimensions en gardant le ratio
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        
        if (ratio < 1) {
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(resolve, file.type, 0.85); // Qualité 85%
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  // Initialiser le bucket si nécessaire
  async function ensureBucketExists() {
    try {
      console.log(`Vérification du bucket "${bucketName}"...`);
      
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.warn('Erreur liste buckets:', listError);
        throw new Error(`Impossible d'accéder aux buckets Supabase: ${listError.message}`);
      }

      console.log('📋 Buckets disponibles:', buckets.map(b => b.name));
      
      const bucketExists = buckets.some(bucket => bucket.name === bucketName);
      
      if (bucketExists) {
        console.log(`Bucket "${bucketName}" trouvé et disponible`);
        return true;
      }

      // Si le bucket n'existe pas, ne pas essayer de le créer automatiquement
      throw new Error(`Bucket "${bucketName}" non trouvé. Créez-le manuellement dans le dashboard Supabase avec les politiques RLS appropriées.`);
      
    } catch (error) {
      console.error('Erreur vérification bucket:', error);
      throw error;
    }
  }

  // Upload vers Supabase Storage
  async function uploadToSupabase(file, fileName) {
    try {
      // D'abord, essayer directement l'upload sans vérifier le bucket
      console.log(`📤 Tentative d'upload direct vers "${bucketName}"...`);
      
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        // Si erreur de bucket non trouvé, vérifier les buckets disponibles
        if (error.message.includes('not found') || error.message.includes('does not exist')) {
          console.log('Bucket non trouvé, vérification de la liste des buckets...');
          await ensureBucketExists();
        }
        throw new Error(`Erreur upload Supabase: ${error.message}`);
      }

      console.log('Upload réussi:', data.path);

      // Obtenir l'URL publique
      const { data: publicData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      return {
        path: data.path,
        fullPath: data.fullPath,
        publicUrl: publicData.publicUrl,
        fileName: fileName
      };

    } catch (error) {
      console.error('Erreur upload Supabase:', error);
      throw error;
    }
  }

  // Supprimer un fichier de Supabase
  async function deleteFromSupabase(fileName) {
    try {
      const { error } = await supabase.storage
        .from(bucketName)
        .remove([fileName]);

      if (error) {
        console.warn('Erreur suppression Supabase:', error);
      }
    } catch (error) {
      console.warn('Erreur suppression fichier:', error);
    }
  }

  // Traiter le fichier principal
  async function processFile(file) {
    let uploadedFileName = null;
    
    try {
      isUploading = true;
      updateUploadingState();

      // Validation
      validateFile(file);

      // Redimensionner
      const resizedBlob = await resizeImage(file);
      
      // Générer nom unique
      uploadedFileName = generateFileName(file);

      // Upload vers Supabase
      const uploadResult = await uploadToSupabase(resizedBlob, uploadedFileName);
      
      previewUrl = uploadResult.publicUrl;
      updatePreview();

      // Informer le parent
      if (onImageUploaded) {
        onImageUploaded(uploadResult.publicUrl, {
          fileName: uploadedFileName,
          originalName: file.name,
          size: resizedBlob.size,
          type: 'supabase',
          path: uploadResult.path,
          bucketName: bucketName
        });
      }

      showSuccessMessage('Image uploadée avec succès sur Supabase Storage !');

    } catch (error) {
      console.error('Erreur traitement image:', error);
      
      // Nettoyer en cas d'erreur
      if (uploadedFileName) {
        await deleteFromSupabase(uploadedFileName);
      }
      
      // Messages d'erreur spécifiques
      let errorMessage = error.message;
      
      if (error.message.includes('bucket') && error.message.includes('not found')) {
        errorMessage = 'Bucket "community-images" non trouvé. Créez-le dans le dashboard Supabase.';
      } else if (error.message.includes('403') || error.message.includes('Unauthorized')) {
        errorMessage = 'Configuration Supabase requise. Vérifiez les politiques RLS du bucket.';
      } else if (error.message.includes('bucket')) {
        errorMessage = 'Erreur de configuration Supabase Storage. Consultez SUPABASE_BUCKET_SETUP.md';
      }
      
      showErrorMessage(errorMessage);
    } finally {
      isUploading = false;
      updateUploadingState();
    }
  }

  // Créer le conteneur principal
  const container = document.createElement('div');
  container.id = uploaderId;
  container.className = `supabase-image-uploader ${className}`;
  container.style.position = 'relative';

  // Styles CSS
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    
    .supabase-image-uploader .upload-zone {
      border: 2px dashed #10b981;
      border-radius: 12px;
      padding: 24px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      min-height: 180px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
      background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    .supabase-image-uploader .upload-zone:hover {
      border-color: #059669;
      background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
    }
    
    .supabase-image-uploader .upload-zone.drag-over {
      border-color: #047857;
      background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
      transform: scale(1.02);
      box-shadow: 0 8px 25px rgba(16, 185, 129, 0.25);
    }
    
    .supabase-image-uploader .supabase-badge {
      position: absolute;
      top: 8px;
      right: 8px;
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      font-size: 10px;
      padding: 4px 8px;
      border-radius: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
    }
    
    .supabase-image-uploader .remove-btn:hover {
      background: rgba(239, 68, 68, 1) !important;
      transform: scale(1.1);
    }
    
    .supabase-image-uploader .upload-message.success {
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
    }
    
    .supabase-image-uploader .upload-message.error {
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: white;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
    }
    
    .supabase-image-uploader .loading-content {
      animation: pulse 2s infinite;
    }
  `;
  container.appendChild(style);

  // Badge Supabase
  const badge = document.createElement('div');
  badge.className = 'supabase-badge';
  badge.textContent = 'Supabase Storage';
  container.appendChild(badge);

  // Zone d'upload
  const uploadZone = document.createElement('div');
  uploadZone.className = 'upload-zone';
  
  // Input file caché
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.style.display = 'none';
  fileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
  };
  uploadZone.appendChild(fileInput);

  // Placeholder
  const placeholder = document.createElement('div');
  placeholder.className = 'upload-placeholder';
  placeholder.style.cssText = `
    display: ${previewUrl ? 'none' : 'flex'};
    flex-direction: column;
    align-items: center;
    gap: 12px;
    color: #047857;
  `;
  
  placeholder.innerHTML = `
    <div style="
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, #10b981, #059669);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      color: white;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
    ">Nuage</div>
    <div style="text-align: center;">
      <p style="margin: 0 0 5px 0; font-weight: 600; font-size: 16px;">Uploadez vers Supabase Storage</p>
      <p style="margin: 0; font-size: 13px; color: #065f46;">Cliquez ou glissez une image ici</p>
    </div>
    <p style="margin: 8px 0 0 0; font-size: 12px; color: #6b7280;">JPG, PNG, GIF, WEBP (max 5MB)</p>
    <div style="
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 4px;
      padding: 4px 8px;
      background: rgba(16, 185, 129, 0.1);
      border-radius: 6px;
      border: 1px solid rgba(16, 185, 129, 0.2);
    ">
      <span style="font-size: 10px;">✓</span>
      <span style="font-size: 11px; color: #047857; font-weight: 500;">Stockage permanent & sécurisé</span>
    </div>
  `;
  uploadZone.appendChild(placeholder);

  // Aperçu de l'image
  const preview = document.createElement('div');
  preview.className = 'image-preview';
  preview.style.cssText = `
    display: ${previewUrl ? 'block' : 'none'};
    position: relative;
    max-width: 100%;
  `;
  
  const img = document.createElement('img');
  img.src = previewUrl || '';
  img.alt = 'Aperçu';
  img.style.cssText = `
    max-width: 100%;
    max-height: 220px;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  `;
  preview.appendChild(img);
  
  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'remove-btn';
  removeBtn.innerHTML = '×';
  removeBtn.title = 'Supprimer l\'image';
  removeBtn.style.cssText = `
    position: absolute;
    top: 8px;
    right: 8px;
    background: rgba(239, 68, 68, 0.9);
    color: white;
    border: none;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: bold;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    transition: all 0.2s ease;
  `;
  removeBtn.onclick = (e) => {
    e.stopPropagation();
    removeImage();
  };
  preview.appendChild(removeBtn);
  uploadZone.appendChild(preview);

  // Overlay de chargement
  const loadingOverlay = document.createElement('div');
  loadingOverlay.className = 'loading-overlay';
  loadingOverlay.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255,255,255,0.95);
    display: none;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    backdrop-filter: blur(4px);
  `;
  
  loadingOverlay.innerHTML = `
    <div class="loading-content" style="display: flex; flex-direction: column; align-items: center; gap: 16px;">
      <div style="
        width: 40px;
        height: 40px;
        border: 4px solid #e5e7eb;
        border-top: 4px solid #10b981;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      "></div>
      <div style="text-align: center;">
        <p style="margin: 0; color: #047857; font-size: 16px; font-weight: 600;">Upload vers Supabase...</p>
        <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 13px;">Stockage sécurisé en cours</p>
      </div>
    </div>
  `;
  uploadZone.appendChild(loadingOverlay);

  // Events drag & drop
  uploadZone.ondragover = (e) => {
    e.preventDefault();
    uploadZone.classList.add('drag-over');
  };
  
  uploadZone.ondragleave = (e) => {
    e.preventDefault();
    uploadZone.classList.remove('drag-over');
  };
  
  uploadZone.ondrop = (e) => {
    e.preventDefault();
    uploadZone.classList.remove('drag-over');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };
  
  uploadZone.onclick = () => {
    fileInput.click();
  };

  container.appendChild(uploadZone);

  // Message de statut
  const message = document.createElement('div');
  message.className = 'upload-message';
  message.style.cssText = `
    display: none;
    margin-top: 12px;
    padding: 10px 16px;
    border-radius: 8px;
    font-size: 14px;
    text-align: center;
    font-weight: 500;
  `;
  container.appendChild(message);

  // Fonctions utilitaires
  function updatePreview() {
    if (previewUrl) {
      preview.style.display = 'block';
      placeholder.style.display = 'none';
      img.src = previewUrl;
    } else {
      preview.style.display = 'none';
      placeholder.style.display = 'flex';
    }
  }

  function updateUploadingState() {
    loadingOverlay.style.display = isUploading ? 'flex' : 'none';
  }

  function showSuccessMessage(text) {
    message.textContent = text;
    message.className = 'upload-message success';
    message.style.display = 'block';
    
    setTimeout(() => {
      message.style.display = 'none';
    }, 6000);
  }

  function showErrorMessage(errorText) {
    message.textContent = errorText;
    message.className = 'upload-message error';
    message.style.display = 'block';
    
    setTimeout(() => {
      message.style.display = 'none';
    }, 8000);
  }

  async function removeImage() {
    // TODO: Supprimer de Supabase si on a les métadonnées
    previewUrl = null;
    updatePreview();
    fileInput.value = '';
    if (onImageUploaded) {
      onImageUploaded(null);
    }
  }

  return container;
}
