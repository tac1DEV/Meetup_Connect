CREATE TYPE statut_evenement AS ENUM ('planifie', 'en_cours', 'termine', 'annule');
CREATE TYPE statut_membre AS ENUM ('membre', 'admin', 'moderateur');
CREATE TYPE statut_participation AS ENUM ('inscrit', 'present', 'absent', 'annule');

CREATE TABLE categorie(
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE role(
    id SERIAL PRIMARY KEY,
    nom VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE utilisateur(
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nom VARCHAR(50),
    prenom VARCHAR(50),
    pseudo VARCHAR(50) UNIQUE,
    telephone VARCHAR(20),
    avatar VARCHAR(255),
    bio TEXT,
    date_creation TIMESTAMP DEFAULT NOW(),
    id_role INTEGER NOT NULL REFERENCES role(id) DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE communaute(
    id SERIAL PRIMARY KEY,
    nom VARCHAR(140) NOT NULL,
    description TEXT NOT NULL,
    date_creation TIMESTAMP DEFAULT NOW(),
    image VARCHAR(255),
    nombre_max_membres INTEGER,
    id_createur UUID NOT NULL REFERENCES utilisateur(id),
    id_categorie INTEGER NOT NULL REFERENCES categorie(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE evenement(
    id SERIAL PRIMARY KEY,
    nom VARCHAR(140) NOT NULL,
    date TIMESTAMP NOT NULL,
    lieu VARCHAR(255) NOT NULL,
    adresse_complete TEXT,
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    description TEXT NOT NULL,
    visibilite BOOLEAN DEFAULT TRUE,
    nombre_max_participants INTEGER,
    prix NUMERIC(10, 2) DEFAULT 0.00,
    image VARCHAR(255),
    statut statut_evenement DEFAULT 'planifie',
    date_creation TIMESTAMP DEFAULT NOW(),
    id_communaute INTEGER NOT NULL REFERENCES communaute(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE notification(
    id SERIAL PRIMARY KEY,
    contenu TEXT NOT NULL,
    date_envoi TIMESTAMP DEFAULT NOW(),
    lu BOOLEAN DEFAULT FALSE,
    id_utilisateur UUID NOT NULL REFERENCES utilisateur(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE message(
    id SERIAL PRIMARY KEY,
    contenu TEXT NOT NULL,
    date_envoi TIMESTAMP DEFAULT NOW(),
    lu BOOLEAN DEFAULT FALSE,
    id_expediteur UUID NOT NULL REFERENCES utilisateur(id),
    id_destinataire UUID NOT NULL REFERENCES utilisateur(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tag(
    id SERIAL PRIMARY KEY,
    nom VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE avis(
    id SERIAL PRIMARY KEY,
    note SMALLINT NOT NULL CHECK (note >= 1 AND note <= 5),
    commentaire TEXT,
    date_creation TIMESTAMP DEFAULT NOW(),
    id_utilisateur UUID NOT NULL REFERENCES utilisateur(id),
    id_evenement INTEGER NOT NULL REFERENCES evenement(id),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(id_utilisateur, id_evenement)
);

CREATE TABLE inscrit(
    id_communaute INTEGER NOT NULL REFERENCES communaute(id),
    id_utilisateur UUID NOT NULL REFERENCES utilisateur(id),
    date_inscription TIMESTAMP DEFAULT NOW(),
    statut statut_membre DEFAULT 'membre',
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (id_communaute, id_utilisateur)
);

CREATE TABLE participe(
    id_evenement INTEGER NOT NULL REFERENCES evenement(id),
    id_utilisateur UUID NOT NULL REFERENCES utilisateur(id),
    date_inscription TIMESTAMP DEFAULT NOW(),
    statut statut_participation DEFAULT 'inscrit',
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (id_evenement, id_utilisateur)
);

CREATE TABLE evenement_tag(
    id_evenement INTEGER NOT NULL REFERENCES evenement(id),
    id_tag INTEGER NOT NULL REFERENCES tag(id),
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (id_evenement, id_tag)
);

CREATE TABLE communaute_tag(
    id_communaute INTEGER NOT NULL REFERENCES communaute(id),
    id_tag INTEGER NOT NULL REFERENCES tag(id),
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (id_communaute, id_tag)
);

CREATE INDEX idx_evenement_date ON evenement(date);
CREATE INDEX idx_evenement_statut ON evenement(statut);
CREATE INDEX idx_evenement_geo ON evenement(latitude, longitude);
CREATE INDEX idx_inscrit_utilisateur ON inscrit(id_utilisateur);
CREATE INDEX idx_participe_utilisateur ON participe(id_utilisateur);
CREATE INDEX idx_notification_utilisateur ON notification(id_utilisateur, lu);
CREATE INDEX idx_message_destinataire ON message(id_destinataire, lu);
CREATE INDEX idx_message_expediteur ON message(id_expediteur);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_utilisateur_updated_at BEFORE UPDATE
    ON utilisateur FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_communaute_updated_at BEFORE UPDATE
    ON communaute FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evenement_updated_at BEFORE UPDATE
    ON evenement FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

INSERT INTO role (nom) VALUES 
('utilisateur'),
('administrateur'),
('moderateur');