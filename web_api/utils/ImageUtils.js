// Utilitaires pour la gestion des images de communautés

// Images par défaut par catégorie
const DEFAULT_IMAGES = {
  1: 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=400&h=300&fit=crop', // Technologie
  2: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop', // Sport
  3: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=300&fit=crop', // Culture
  4: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=300&fit=crop', // Business
  5: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&h=300&fit=crop', // Loisirs
  default: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=300&fit=crop' // Générique
};

// Obtenir une image par défaut pour une catégorie
export function getDefaultImageForCategory(categorieId) {
  return DEFAULT_IMAGES[categorieId] || DEFAULT_IMAGES.default;
}

// Générer un placeholder coloré basé sur le nom de la communauté
export function generatePlaceholderImage(nom, size = '400x300') {
  // Couleurs basées sur le hash du nom
  const colors = [
    '4f46e5', '059669', 'dc2626', 'ea580c', '7c2d12',
    '1d4ed8', '0d9488', 'b91c1c', 'c2410c', '92400e'
  ];
  
  const hash = nom.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const colorIndex = Math.abs(hash) % colors.length;
  const bgColor = colors[colorIndex];
  const textColor = 'ffffff';
  
  // Prendre les initiales
  const initials = nom
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .substring(0, 3)
    .toUpperCase();
  
  return `https://via.placeholder.com/${size}/${bgColor}/${textColor}?text=${encodeURIComponent(initials)}`;
}

// Valider si une URL d'image est accessible
export async function validateImageUrl(imageUrl) {
  if (!imageUrl) return false;
  
  try {
    const response = await fetch(imageUrl, { method: 'HEAD' });
    return response.ok && response.headers.get('content-type')?.startsWith('image/');
  } catch {
    return false;
  }
}

// Obtenir l'URL d'image finale pour une communauté
export function getCommunityImageUrl(communaute) {
  // 1. Image uploadée par l'utilisateur
  if (communaute.image) {
    return communaute.image;
  }
  
  // 2. Image par défaut selon la catégorie
  if (communaute.id_categorie) {
    return getDefaultImageForCategory(communaute.id_categorie);
  }
  
  // 3. Placeholder généré
  return generatePlaceholderImage(communaute.nom || 'Communauté');
}

// Précharger une image pour améliorer l'UX
export function preloadImage(imageUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Impossible de charger l\'image'));
    img.src = imageUrl;
  });
}

// Compresser une image côté client
export async function compressImage(file, quality = 0.8, maxWidth = 800, maxHeight = 600) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculer les nouvelles dimensions
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Redessiner l'image
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob((blob) => {
        const compressedFile = new File([blob], file.name, {
          type: file.type,
          lastModified: Date.now()
        });
        resolve(compressedFile);
      }, file.type, quality);
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export default {
  getDefaultImageForCategory,
  generatePlaceholderImage,
  validateImageUrl,
  getCommunityImageUrl,
  preloadImage,
  compressImage
};
