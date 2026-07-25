const services = [
  {
    number: "01",
    title: "Renovatie",
    text: "Van gedateerd naar helemaal van nu. We vernieuwen woningen doordacht, degelijk en met oog voor wat er al staat.",
  },
  {
    number: "02",
    title: "Aan- & uitbouw",
    text: "Meer licht, leefruimte en woningwaarde. Van fundering tot afwerking geregeld door één betrokken bouwteam.",
  },
  {
    number: "03",
    title: "Verbouw",
    text: "Een nieuwe indeling, keuken, badkamer of complete verdieping. Slim gepland en netjes uitgevoerd.",
  },
  {
    number: "04",
    title: "Onderhoud",
    text: "Vakkundig herstel en periodiek onderhoud voor particuliere woningen en kleinschalig vastgoed.",
  },
];

const projects = [
  {
    title: "Moderne aanbouw",
    location: "Vrijstaande woning · 14 weken",
    image: "/project-aanbouw.jpg",
    className: "project-wide",
  },
  {
    title: "Totaalrenovatie",
    location: "Jaren 30-woning · 18 weken",
    image: "/project-renovatie.jpg",
    className: "",
  },
  {
    title: "Open leefverdieping",
    location: "Stadswoning · 10 weken",
    image: "/project-interieur.jpg",
    className: "",
  },
];

const steps = [
  {
    number: "01",
    title: "Kennismaken",
    text: "We luisteren naar je plannen en bekijken de situatie op locatie.",
  },
  {
    number: "02",
    title: "Helder voorstel",
    text: "Je krijgt een duidelijke offerte, planning en vaste contactpersoon.",
  },
  {
    number: "03",
    title: "Samen bouwen",
    text: "We houden je op de hoogte en stemmen belangrijke keuzes tijdig af.",
  },
  {
    number: "04",
    title: "Netjes opleveren",
    text: "We lopen alles samen na en laten de bouwplaats verzorgd achter.",
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
          <p>Vakwerk voor woningen en kleinschalig vastgoed</p>
          <p className="topbar-location">
            <span className="status-dot" aria-hidden="true" />
            Beschikbaar voor nieuwe projecten
          </p>
        </div>
      </div>

      <header className="site-header">
        <div className="container header-inner">
          <a className="brand" href="#" aria-label="Bouwkracht, naar boven">
            <span className="brand-mark" aria-hidden="true">
              BK
            </span>
            <span className="brand-name">
              BOUW<span>KRACHT</span>
            </span>
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
                <span aria-hidden="true">—</span> Bouwbedrijf voor renovatie &amp;
                verbouw
              </p>
              <h1>
                Gebouwd op
                <br />
                <em>afspraak.</em>
              </h1>
              <p className="hero-intro">
                Van eerste schets tot laatste plint. Wij maken van jouw
                bouwplannen een degelijk resultaat waar je elke dag plezier van
                hebt.
              </p>
              <div className="hero-actions">
                <a className="button" href="#contact">
                  Bespreek je project <span aria-hidden="true">↗</span>
                </a>
                <a className="text-link" href="#projecten">
                  Bekijk ons werk <span aria-hidden="true">↓</span>
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
                    Degelijk gebouwd
                    <br />
                    Zorgvuldig afgewerkt
                  </span>
                </div>
              </div>
              <div className="hero-stamp" aria-label="Bouwen met aandacht">
                <span>BOUWEN MET</span>
                <strong>+</strong>
                <span>AANDACHT</span>
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
                Heldere offerte
                <br />
                en planning
              </p>
            </div>
            <div>
              <span className="value-number">03</span>
              <p>
                Vakmensen met
                <br />
                oog voor detail
              </p>
            </div>
            <div>
              <span className="value-number">04</span>
              <p>
                Netjes werken
                <br />
                en opleveren
              </p>
            </div>
          </div>
        </section>

        <section className="services dark-section" id="diensten">
          <div className="container">
            <div className="section-heading light-heading">
              <div>
                <p className="eyebrow">
                  <span aria-hidden="true">—</span> Wat we bouwen
                </p>
                <h2>
                  Grootse plannen.
                  <br />
                  <em>Degelijk uitgevoerd.</em>
                </h2>
              </div>
              <p className="section-intro">
                Korte lijnen, een realistische planning en vakwerk dat klopt.
                Daar kun je tijdens én na de bouw op rekenen.
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
                  <span aria-hidden="true">—</span> Uitgelicht werk
                </p>
                <h2>
                  Werk dat voor
                  <br />
                  <em>zichzelf spreekt.</em>
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
                  Geen verrassingen.
                  <br />
                  <em>Wel vooruitgang.</em>
                </h2>
                <p>
                  Verbouwen heeft impact. Daarom weet je bij ons vooraf waar je
                  aan toe bent en blijft de communicatie helder gedurende het
                  hele project.
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
              <span aria-hidden="true">—</span> Klant aan het woord
            </p>
            <blockquote>
              “Vanaf het eerste gesprek was het duidelijk: deze mensen denken
              mee. De planning klopte, de communicatie was prettig en het
              eindresultaat is nog mooier dan we voor ogen hadden.”
            </blockquote>
            <div className="testimonial-footer">
              <p>
                <strong>Familie De Jong</strong>
                <span>Renovatie &amp; uitbouw</span>
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
                Deel kort wat je wilt bouwen of verbouwen. We nemen snel contact
                op om je project en de mogelijkheden te bespreken.
              </p>
              <div className="contact-details">
                <a href="tel:+31612345678">
                  <span>Bel</span>
                  06 12 34 56 78
                </a>
                <a href="mailto:info@jouwbedrijf.nl">
                  <span>Mail</span>
                  info@jouwbedrijf.nl
                </a>
                <p>
                  <span>Werkgebied</span>
                  Jouw regio &amp; omgeving
                </p>
              </div>
            </div>

            <form
              className="contact-form"
              id="contact-form"
              action="mailto:info@jouwbedrijf.nl"
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
                  <input type="tel" name="telefoon" placeholder="06 12 34 56 78" required />
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
                    <option>Renovatie</option>
                    <option>Aan- of uitbouw</option>
                    <option>Verbouw</option>
                    <option>Onderhoud</option>
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

      <footer>
        <div className="container footer-top">
          <a className="brand footer-brand" href="#" aria-label="Bouwkracht, naar boven">
            <span className="brand-mark" aria-hidden="true">
              BK
            </span>
            <span className="brand-name">
              BOUW<span>KRACHT</span>
            </span>
          </a>
          <p>Renovatie · Verbouw · Aanbouw · Onderhoud</p>
          <a className="back-to-top" href="#">
            Naar boven <span aria-hidden="true">↑</span>
          </a>
        </div>
        <div className="container footer-bottom">
          <p>© 2026 Bouwkracht. Alle rechten voorbehouden.</p>
          <p>Websiteconcept voor jouw bouwbedrijf</p>
          <a href="https://unsplash.com" target="_blank" rel="noreferrer">
            Beeld: Unsplash
          </a>
        </div>
      </footer>
    </>
  );
}
