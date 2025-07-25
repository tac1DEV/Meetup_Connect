import supabase from "../config.js";

// Service pour gérer l'upload de fichiers avec Supabase Storage
class FileUploadService {
	constructor() {
		this.bucketName = "community-images";
		this.maxFileSize = 5 * 1024 * 1024; // 5MB
		this.allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
		this.supabaseStorageUrl = `${supabase.url}/storage/v1/object/public`;
	}

	// Valider un fichier avant upload
	validateFile(file) {
		if (!file) {
			throw new Error("Aucun fichier sélectionné");
		}

		if (file.size > this.maxFileSize) {
			throw new Error(
				`Le fichier est trop volumineux. Taille max: ${
					this.maxFileSize / 1024 / 1024
				}MB`
			);
		}

		if (!this.allowedTypes.includes(file.type)) {
			throw new Error(
				`Type de fichier non autorisé. Types acceptés: ${this.allowedTypes.join(
					", "
				)}`
			);
		}

		return true;
	}

	// Générer un nom de fichier unique
	generateFileName(file, prefix = "community_") {
		const timestamp = Date.now();
		const randomString = Math.random().toString(36).substring(2, 15);
		const extension = file.name.split(".").pop();
		return `${prefix}${timestamp}_${randomString}.${extension}`;
	}

	// Uploader un fichier vers Supabase Storage
	async uploadCommunityImage(file, communauteId) {
		try {
			this.validateFile(file);

			// Redimensionner l'image si nécessaire
			const resizedFile = await this.resizeImage(file);

			const fileName = this.generateFileName(
				resizedFile,
				`community_${communauteId}_`
			);
			const filePath = `communities/${fileName}`;

			// Upload vers Supabase Storage
			const { data, error } = await supabase.storage
				.from(this.bucketName)
				.upload(filePath, resizedFile, {
					cacheControl: "3600",
					upsert: false,
				});

			if (error) {
				throw new Error(`Erreur Supabase Storage: ${error.message}`);
			}

			// Construire l'URL publique
			const publicUrl = `${this.supabaseStorageUrl}/${this.bucketName}/${filePath}`;

			return publicUrl;
		} catch (error) {
			console.error("Erreur upload:", error);
			throw error;
		}
	}

	// Supprimer un fichier du storage
	async deleteFile(filePath) {
		try {
			// Extraire le chemin relatif depuis l'URL complète si nécessaire
			let relativePath = filePath;
			if (filePath.includes(this.supabaseStorageUrl)) {
				relativePath = filePath.replace(
					`${this.supabaseStorageUrl}/${this.bucketName}/`,
					""
				);
			}

			const { error } = await supabase.storage
				.from(this.bucketName)
				.remove([relativePath]);

			if (error) {
				console.error("Erreur suppression Supabase:", error);
				return false;
			}

			return true;
		} catch (error) {
			console.error("Erreur suppression:", error);
			return false;
		}
	}

	// Redimensionner une image côté client avant upload
	async resizeImage(file, maxWidth = 800, maxHeight = 600, quality = 0.8) {
		return new Promise((resolve, reject) => {
			const canvas = document.createElement("canvas");
			const ctx = canvas.getContext("2d");
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

				canvas.toBlob(
					(blob) => {
						// Créer un nouveau File à partir du Blob
						const resizedFile = new File([blob], file.name, {
							type: file.type,
							lastModified: Date.now(),
						});
						resolve(resizedFile);
					},
					file.type,
					quality
				);
			};

			img.onerror = reject;
			img.src = URL.createObjectURL(file);
		});
	}

	// Créer ou vérifier l'existence du bucket Supabase
	async ensureBucketExists() {
		try {
			// Vérifier si le bucket existe
			const { data: buckets, error: listError } =
				await supabase.storage.listBuckets();

			if (listError) {
				console.error("Erreur lors de la liste des buckets:", listError);
				return false;
			}

			const bucketExists = buckets.some(
				(bucket) => bucket.name === this.bucketName
			);

			if (!bucketExists) {
				// Créer le bucket s'il n'existe pas
				const { error: createError } = await supabase.storage.createBucket(
					this.bucketName,
					{
						public: true,
						allowedMimeTypes: this.allowedTypes,
						fileSizeLimit: this.maxFileSize,
					}
				);

				if (createError) {
					console.error("Erreur lors de la création du bucket:", createError);
					return false;
				}

				console.log(`Bucket ${this.bucketName} créé avec succès`);
			}

			return true;
		} catch (error) {
			console.error("Erreur gestion bucket:", error);
			return false;
		}
	}
}

export default new FileUploadService();
