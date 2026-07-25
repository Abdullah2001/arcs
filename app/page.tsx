const services = [
  {
    number: "01",
    title: "Stucwerk",
    text: "Binnenstucwerk, pleisterwerk en het strak afwerken of herstellen van muren en plafonds.",
  },
  {
    number: "02",
    title: "Schilderwerk",
    text: "Binnen- en buitenschilderwerk, sauswerk en een zorgvuldige voorbehandeling van iedere ondergrond.",
  },
  {
    number: "03",
    title: "Tegelwerk",
    text: "Wand- en vloertegels voor badkamers, toiletten en keukens, inclusief voegen en kitten.",
  },
  {
    number: "04",
    title: "Vloerwerk",
    text: "Laminaat, PVC, plinten, egaliseren en het vakkundig verwijderen van bestaande vloeren.",
  },
  {
    number: "05",
    title: "Montagewerk",
    text: "Montage van binnendeuren, kozijnen, kasten, vensterbanken en diverse aftimmeringen.",
  },
  {
    number: "06",
    title: "Keukenwerk",
    text: "Van demontage tot keukenmontage, werkbladen, kasten, tegelwerk en complete afwerking.",
  },
  {
    number: "07",
    title: "Sloopwerk",
    text: "Kleine sloopwerkzaamheden, het verwijderen van keukens, badkamers en vloeren plus afvalafvoer.",
  },
  {
    number: "08",
    title: "Complete renovaties",
    text: "Woningrenovaties en complete binnenafwerking met één aanspreekpunt voor alle werkzaamheden.",
  },
];

const projects = [
  {
    title: "Complete woonkamer renovatie",
    location: "Eindhoven · binnenafwerking",
    image: "/project-aanbouw.jpg",
    className: "project-wide",
  },
  {
    title: "Badkamerrenovatie",
    location: "Veldhoven · tegel- & montagewerk",
    image: "/project-renovatie.jpg",
    className: "",
  },
  {
    title: "Stuc- en schilderwerk",
    location: "Helmond · wanden & plafonds",
    image: "/project-interieur.jpg",
    className: "",
  },
];

const steps = [
  {
    number: "01",
    title: "Kennismaking en aanvraag",
    text: "Je vertelt wat er moet gebeuren en wij denken direct praktisch met je mee.",
  },
  {
    number: "02",
    title: "Opname op locatie",
    text: "We bekijken de situatie, meten het werk in en bespreken de mogelijkheden.",
  },
  {
    number: "03",
    title: "Duidelijke offerte",
    text: "Je ontvangt een transparant voorstel met heldere afspraken over het werk.",
  },
  {
    number: "04",
    title: "Planning en voorbereiding",
    text: "Materialen, vakmensen en werkzaamheden worden zorgvuldig op elkaar afgestemd.",
  },
  {
    number: "05",
    title: "Vakkundige uitvoering",
    text: "Eén aanspreekpunt houdt je op de hoogte terwijl ons team het werk uitvoert.",
  },
  {
    number: "06",
    title: "Controle en oplevering",
    text: "We lopen alles samen na en laten de werkplek netjes en verzorgd achter.",
  },
];

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#inhoud">
        Ga naar de inhoud
      </a>

      <div className="topbar">
        <div className="container topbar-inner">
          <p>Renovatie &amp; dienstverlening in Eindhoven en omgeving</p>
          <p className="topbar-location">
            <span className="status-dot" aria-hidden="true" />
            Beschikbaar voor nieuwe projecten
          </p>
        </div>
      </div>

      <header className="site-header">
        <div className="container header-inner">
          <a className="brand" href="#" aria-label="AR Civil Solutions, naar boven">
            <img
              className="brand-logo"
              src="/images/brand/logo-horizontal.png"
              alt="AR Civil Solutions"
            />
          </a>

          <nav className="desktop-nav" aria-label="Hoofdnavigatie">
            <a href="#diensten">Diensten</a>
            <a href="#projecten">Projecten</a>
            <a href="#werkwijze">Werkwijze</a>
            <a href="#contact">Contact</a>
          </nav>

          <a className="button button-small header-cta" href="#contact">
            Offerte aanvragen <span aria-hidden="true">↗</span>
          </a>

          <details className="mobile-menu">
            <summary aria-label="Menu openen">
              <span />
              <span />
            </summary>
            <nav aria-label="Mobiele navigatie">
              <a href="#diensten">Diensten</a>
              <a href="#projecten">Projecten</a>
              <a href="#werkwijze">Werkwijze</a>
              <a href="#contact">Contact</a>
            </nav>
          </details>
        </div>
      </header>

      <main id="inhoud">
        <section className="hero">
          <div className="container hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">
                <span aria-hidden="true">—</span> Renovatiebedrijf in Eindhoven
                en omgeving
              </p>
              <h1>
                Van uitdaging
                <br />
                naar <em>oplossing.</em>
              </h1>
              <p className="hero-intro">
                AR Civil Solutions verzorgt stucwerk, schilderwerk, tegelwerk,
                vloeren, montage, keukenwerk, sloopwerk en complete
                binnenrenovaties voor particulieren en bedrijven.
              </p>
              <div className="hero-actions">
                <a className="button" href="#contact">
                  Gratis offerte aanvragen <span aria-hidden="true">↗</span>
                </a>
                <a className="text-link" href="#diensten">
                  Bekijk onze diensten <span aria-hidden="true">↓</span>
                </a>
              </div>
            </div>

            <div className="hero-media">
              <div className="hero-image-wrap">
                <img
                  src="/hero-bouw.jpg"
                  alt="Vakmensen aan het werk op een bouwplaats"
                />
                <div className="image-label">
                  <span className="image-label-number">01</span>
                  <span>
                    Building stronger
                    <br />
                    futures
                  </span>
                </div>
              </div>
              <div className="hero-stamp" aria-label="AR Civil Solutions">
                <span>AR CIVIL</span>
                <strong>+</strong>
                <span>SOLUTIONS</span>
              </div>
            </div>
          </div>

          <div className="container value-strip" aria-label="Onze zekerheden">
            <div>
              <span className="value-number">01</span>
              <p>
                Eén vast
                <br />
                aanspreekpunt
              </p>
            </div>
            <div>
              <span className="value-number">02</span>
              <p>
                Duidelijke
                <br />afspraken
              </p>
            </div>
            <div>
              <span className="value-number">03</span>
              <p>
                Praktische
                <br />
                oplossingen
              </p>
            </div>
            <div>
              <span className="value-number">04</span>
              <p>
                Netjes en veilig
                <br />
                werken
              </p>
            </div>
          </div>
        </section>

        <section className="services dark-section" id="diensten">
          <div className="container">
            <div className="section-heading light-heading">
              <div>
                <p className="eyebrow">
                  <span aria-hidden="true">—</span> Alles onder één dak
                </p>
                <h2>
                  Alles voor
                  <br />
                  jouw <em>renovatie.</em>
                </h2>
              </div>
              <p className="section-intro">
                Meerdere werkzaamheden combineren zonder verschillende
                aannemers te hoeven aansturen. AR Civil Solutions coördineert
                het werk van begin tot eind.
              </p>
            </div>

            <div className="service-grid">
              {services.map((service) => (
                <article className="service-card" key={service.number}>
                  <div className="service-card-top">
                    <span>{service.number}</span>
                    <span className="service-plus" aria-hidden="true">
                      +
                    </span>
                  </div>
                  <div>
                    <h3>{service.title}</h3>
                    <p>{service.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="projects" id="projecten">
          <div className="container">
            <div className="section-heading project-heading">
              <div>
                <p className="eyebrow">
                  <span aria-hidden="true">—</span> Voorbeeldprojecten
                </p>
                <h2>
                  Vakkundig werk.
                  <br />
                  <em>Netjes afgewerkt.</em>
                </h2>
              </div>
              <a className="text-link" href="#contact">
                Heb je een soortgelijk plan? <span aria-hidden="true">↗</span>
              </a>
            </div>

            <div className="project-grid">
              {projects.map((project, index) => (
                <article
                  className={`project-card ${project.className}`}
                  key={project.title}
                >
                  <div className="project-image">
                    <img src={project.image} alt={project.title} />
                    <span className="project-index">
                      0{index + 1}
                    </span>
                  </div>
                  <div className="project-info">
                    <h3>{project.title}</h3>
                    <p>{project.location}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="process" id="werkwijze">
          <div className="container">
            <div className="process-top">
              <div className="process-copy">
                <p className="eyebrow">
                  <span aria-hidden="true">—</span> Zo werken wij
                </p>
                <h2>
                  Duidelijk proces.
                  <br />
                  <em>Goed resultaat.</em>
                </h2>
                <p>
                  Je weet vooraf waar je aan toe bent. Van de eerste opname tot
                  de oplevering houden we de communicatie helder en de
                  uitvoering overzichtelijk.
                </p>
                <a className="button button-light" href="#contact">
                  Plan een kennismaking <span aria-hidden="true">↗</span>
                </a>
              </div>

              <div className="process-steps">
                {steps.map((step) => (
                  <article className="process-step" key={step.number}>
                    <span>{step.number}</span>
                    <div>
                      <h3>{step.title}</h3>
                      <p>{step.text}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="testimonial">
          <div className="container testimonial-inner">
            <p className="eyebrow dark-eyebrow">
              <span aria-hidden="true">—</span> Voorbeeldbeoordeling
            </p>
            <blockquote>
              “Duidelijke afspraken, prettig contact en een vakkundige
              afwerking. Alles werd netjes uitgevoerd en de werkplek werd
              verzorgd achtergelaten.”
            </blockquote>
            <div className="testimonial-footer">
              <p>
                <strong>Tijdelijke voorbeeldtekst</strong>
                <span>Wordt vervangen door een echte klantbeoordeling</span>
              </p>
              <div className="stars" aria-label="5 van 5 sterren">
                ★ ★ ★ ★ ★
              </div>
            </div>
          </div>
        </section>

        <section className="contact dark-section" id="contact">
          <div className="container contact-grid">
            <div className="contact-copy">
              <p className="eyebrow">
                <span aria-hidden="true">—</span> Klaar om te bouwen?
              </p>
              <h2>
                Vertel ons
                <br />
                <em>je plan.</em>
              </h2>
              <p>
                Deel kort welke werkzaamheden je wilt laten uitvoeren. We nemen
                contact op om je project en de mogelijkheden te bespreken.
              </p>
              <div className="contact-details">
                <a href="tel:+31600000000">
                  <span>Bel</span>
                  +31 6 00000000
                </a>
                <a href="mailto:info@arcivilsolutions.nl">
                  <span>Mail</span>
                  info@arcivilsolutions.nl
                </a>
                <p>
                  <span>Werkgebied</span>
                  Eindhoven &amp; omgeving
                </p>
              </div>
            </div>

            <form
              className="contact-form"
              id="contact-form"
              action="mailto:info@arcivilsolutions.nl"
              method="post"
              encType="text/plain"
            >
              <div className="form-row">
                <label>
                  Naam
                  <input type="text" name="naam" placeholder="Voor- en achternaam" required />
                </label>
                <label>
                  Telefoon
                  <input type="tel" name="telefoon" placeholder="+31 6 00000000" required />
                </label>
              </div>
              <div className="form-row">
                <label>
                  E-mail
                  <input type="email" name="email" placeholder="naam@email.nl" required />
                </label>
                <label>
                  Type project
                  <select name="project" defaultValue="">
                    <option value="" disabled>
                      Maak een keuze
                    </option>
                    <option>Stucwerk</option>
                    <option>Schilderwerk</option>
                    <option>Tegelwerk</option>
                    <option>Vloerwerk</option>
                    <option>Montagewerk</option>
                    <option>Keukenwerk</option>
                    <option>Sloopwerk</option>
                    <option>Complete renovatie</option>
                    <option>Anders</option>
                  </select>
                </label>
              </div>
              <label>
                Vertel kort over je plan
                <textarea
                  name="bericht"
                  rows={5}
                  placeholder="Wat wil je laten doen en wanneer?"
                  required
                />
              </label>
              <button className="button form-button" type="submit">
                Verstuur aanvraag <span aria-hidden="true">↗</span>
              </button>
              <p className="form-note">
                Door te versturen geef je toestemming om contact met je op te
                nemen over je aanvraag.
              </p>
            </form>
          </div>
        </section>
      </main>

      <a
        className="whatsapp-button"
        href="https://wa.me/31600000000?text=Hallo%20AR%20Civil%20Solutions%2C%20ik%20wil%20graag%20informatie%20of%20een%20offerte%20aanvragen."
        target="_blank"
        rel="noreferrer"
        aria-label="Neem contact op met AR Civil Solutions via WhatsApp"
      >
        <span aria-hidden="true">WA</span>
        WhatsApp
      </a>

      <footer>
        <div className="container footer-top">
          <a className="brand footer-brand" href="#" aria-label="AR Civil Solutions, naar boven">
            <img
              className="brand-logo"
              src="/images/brand/logo-horizontal.png"
              alt="AR Civil Solutions"
            />
          </a>
          <p>Stucwerk · Schilderwerk · Tegelwerk · Complete renovaties</p>
          <a className="back-to-top" href="#">
            Naar boven <span aria-hidden="true">↑</span>
          </a>
        </div>
        <div className="container footer-bottom">
          <p>© 2026 AR Civil Solutions. Alle rechten voorbehouden.</p>
          <p>Van uitdaging naar oplossing</p>
          <a href="https://unsplash.com" target="_blank" rel="noreferrer">
            Beeld: Unsplash
          </a>
        </div>
      </footer>
    </>
  );
}
