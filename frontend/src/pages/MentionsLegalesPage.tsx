import styles from './MentionsLegalesPage.module.css';

export default function MentionsLegalesPage() {
  return (
    <div className={styles.page}>
      <div className={`container ${styles.inner}`}>
        <h1 className={styles.title}>Mentions légales</h1>
        <p className={styles.updated}>Dernière mise à jour : mai 2025</p>

        <Section titre="1. Éditeur du site">
          <p>Le site <strong>kreagency.fr</strong> est édité par :</p>
          <ul>
            <li><strong>Raison sociale :</strong> KreAgency SAS</li>
            <li><strong>Forme juridique :</strong> Société par Actions Simplifiée</li>
            <li><strong>Capital social :</strong> 50 000 €</li>
            <li><strong>Siège social :</strong> 12 Cours Mirabeau, 13100 Aix-en-Provence</li>
            <li><strong>SIREN :</strong> 123 456 789</li>
            <li><strong>RCS :</strong> Aix-en-Provence B 123 456 789</li>
            <li><strong>Numéro TVA intracommunautaire :</strong> FR 12 123456789</li>
            <li><strong>Carte professionnelle :</strong> n° CPI 1301 2018 000 012 345 — délivrée par la CCI Aix-Marseille-Provence</li>
            <li><strong>Téléphone :</strong> 04 42 00 00 01</li>
            <li><strong>Email :</strong> siege@kreagency.fr</li>
          </ul>
          <p><strong>Directeur de la publication :</strong> Alexandre Dupont</p>
        </Section>

        <Section titre="2. Hébergement">
          <ul>
            <li><strong>Hébergeur :</strong> Supabase Inc.</li>
            <li><strong>Adresse :</strong> 970 Toa Payoh North, Singapour 318992</li>
            <li><strong>Site web :</strong> supabase.com</li>
          </ul>
        </Section>

        <Section titre="3. Propriété intellectuelle">
          <p>
            L'ensemble des éléments constituant ce site (textes, graphismes, logotypes, images, sons, vidéos)
            sont la propriété exclusive de KreAgency SAS ou de ses partenaires. Toute reproduction,
            représentation, modification, publication ou adaptation de tout ou partie des éléments du site,
            quel que soit le moyen ou le procédé utilisé, est interdite sans l'autorisation écrite préalable
            de KreAgency SAS.
          </p>
        </Section>

        <Section titre="4. Données personnelles">
          <p>
            Conformément au Règlement Général sur la Protection des Données (RGPD — Règlement UE 2016/679)
            et à la loi Informatique et Libertés n° 78-17 du 6 janvier 1978 modifiée, vous disposez des droits
            suivants sur vos données personnelles :
          </p>
          <ul>
            <li>Droit d'accès, de rectification et d'effacement</li>
            <li>Droit à la limitation du traitement</li>
            <li>Droit à la portabilité des données</li>
            <li>Droit d'opposition</li>
          </ul>
          <p>
            Pour exercer ces droits, contactez-nous à l'adresse : <strong>dpo@kreagency.fr</strong>.
            Vous pouvez également introduire une réclamation auprès de la CNIL (cnil.fr).
          </p>
        </Section>

        <Section titre="5. Cookies">
          <p>
            Ce site utilise des cookies fonctionnels nécessaires à son bon fonctionnement (authentification,
            préférences). Aucun cookie publicitaire ou traceur tiers n'est utilisé sans votre consentement.
          </p>
        </Section>

        <Section titre="6. Limitation de responsabilité">
          <p>
            KreAgency SAS s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur
            ce site. Cependant, KreAgency SAS ne peut garantir l'exactitude, la complétude ni l'exhaustivité
            des informations mises à disposition. En conséquence, KreAgency SAS décline toute responsabilité
            pour toute imprécision, inexactitude ou omission portant sur des informations disponibles sur ce site.
          </p>
        </Section>

        <Section titre="7. Droit applicable">
          <p>
            Les présentes mentions légales sont soumises au droit français. En cas de litige,
            les tribunaux compétents seront ceux du ressort de la Cour d'appel d'Aix-en-Provence.
          </p>
        </Section>
      </div>
    </div>
  );
}

function Section({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{titre}</h2>
      <div className={styles.sectionBody}>{children}</div>
    </section>
  );
}
