
// Utilitaires pour gérer les images des communautés


// Obtenir l'URL d'une image de communauté
export function getCommunityImageUrl(communaute) {
  if (!communaute || !communaute.image) {
    return null;
  }

  // Si c'est déjà une URL complète (Supabase ou autre)
  if (communaute.image.startsWith('http')) {
    return communaute.image;
  }

  // Si c'est une URL relative Supabase Storage
  if (communaute.image.startsWith('/storage/')) {
    return `https://wxfruxhckurswdcbdxwq.supabase.co${communaute.image}`;
  }

  // Si c'est juste un nom de fichier
  if (!communaute.image.includes('/')) {
    return `https://wxfruxhckurswdcbdxwq.supabase.co/storage/v1/object/public/community-images/${communaute.image}`;
  }

  // Fallback: retourner tel quel
  return communaute.image;
}

// Créer l'élément image pour une communauté
export function createCommunityImage(communaute, options = {}) {
  const {
    width = '100%',
    height = '200px',
    borderRadius = '8px',
    objectFit = 'cover',
    fallbackIcon = 'Communauté',
    fallbackText = 'Communauté',
    className = 'community-image'
  } = options;

  const imageUrl = getCommunityImageUrl(communaute);
  
  // Debug pour voir ce qui se passe
  console.log('Debug CommunityImage:', {
    communauteId: communaute?.id,
    communauteNom: communaute?.nom,
    rawImageField: communaute?.image,
    computedImageUrl: imageUrl
  });

  if (!imageUrl) {
    // Image par défaut/placeholder
    return {
      tag: "div",
      attributes: [
        ["class", `${className} ${className}--placeholder`],
        ["style", {
          width,
          height,
          borderRadius,
          backgroundColor: "#f0f0f0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#999",
          fontSize: "24px",
        }]
      ],
      children: [
        {
          tag: "div",
          attributes: [["style", { fontSize: "48px", marginBottom: "10px" }]],
          children: [fallbackIcon]
        },
        {
          tag: "span",
          attributes: [["style", { fontSize: "14px", fontWeight: "500" }]],
          children: [fallbackText]
        }
      ]
    };
  }

  return {
    tag: "div",
    attributes: [
      ["class", `${className} ${className}--container`],
      ["style", {
        width,
        height,
        borderRadius,
        overflow: "hidden",
        position: "relative",
        backgroundColor: "#f9f9f9"
      }]
    ],
    children: [
      {
        tag: "img",
        attributes: [
          ["src", imageUrl],
          ["alt", `Image de ${communaute.nom}`],
          ["class", `${className}__img`],
          ["style", {
            width: "100%",
            height: "100%",
            objectFit,
            display: "block",
            transition: "transform 0.3s ease"
          }],
          ["loading", "lazy"]
        ],
        events: {
          error: [
            (e) => {
              console.warn('Erreur chargement image communauté:', imageUrl);
              // Remplacer par placeholder en cas d'erreur
              const placeholder = e.currentTarget.parentElement;
              placeholder.innerHTML = `
                <div style="
                  width: 100%; 
                  height: 100%; 
                  display: flex; 
                  flex-direction: column; 
                  align-items: center; 
                  justify-content: center; 
                  background-color: #f0f0f0; 
                  color: #999;
                ">
                  <div style="font-size: 32px; margin-bottom: 8px;">${fallbackIcon}</div>
                  <span style="font-size: 12px;">Image indisponible</span>
                </div>
              `;
            }
          ],
          load: [
            (e) => {
              console.log('Image communauté chargée:', imageUrl);
            }
          ]
        }
      }
    ]
  };
}

// Créer une image de communauté pour les cartes (format compact)
export function createCommunityCardImage(communaute) {
  return createCommunityImage(communaute, {
    width: '100%',
    height: '160px',
    borderRadius: '8px 8px 0 0',
    objectFit: 'cover',
    fallbackIcon: 'Communauté',
    fallbackText: communaute.nom,
    className: 'community-card-image'
  });
}

// Créer une image de communauté pour l'en-tête de page (format large)
export function createCommunityHeaderImage(communaute) {
  return createCommunityImage(communaute, {
    width: '300px',
    height: '200px',
    borderRadius: '12px',
    objectFit: 'cover',
    fallbackIcon: 'Communauté',
    fallbackText: 'Image de communauté',
    className: 'community-header-image'
  });
}

// Créer une image miniature pour les listes
export function createCommunityThumbnail(communaute) {
  return createCommunityImage(communaute, {
    width: '60px',
    height: '60px',
    borderRadius: '8px',
    objectFit: 'cover',
    fallbackIcon: 'Communauté',
    fallbackText: '',
    className: 'community-thumbnail'
  });
}
