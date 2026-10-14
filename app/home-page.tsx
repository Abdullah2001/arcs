import type { Metadata } from "next";
import { headers } from "next/headers";
import { listProjectsWithFallback } from "@/db/projects";
import { dictionaries } from "./i18n";
import { ArrowIcon, CheckIcon, Icon, PhoneIcon, WhatsAppIcon } from "./icons";
import MobileMenu from "./mobile-menu";
import OfferteForm from "./offerte-form";
import { langPath, site, type Lang } from "./site-config";

export async function buildMetadata(lang: Lang): Promise<Metadata> {
  const t = dictionaries[lang];
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const protocol = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const base = `${protocol}://${host}`;
  const ogImage = new URL("/og.png", base).toString();

  return {
    title: t.meta.title,
    description: t.meta.description,
    alternates: {
      canonical: new URL(langPath[lang], base).toString(),
      languages: {
        nl: new URL(langPath.nl, base).toString(),
        en: new URL(langPath.en, base).toString(),
        "x-default": new URL(langPath.nl, base).toString(),
      },
    },
    icons: { icon: "/images/brand/logo-square.png" },
    openGraph: {
      title: t.meta.title,
      description: t.meta.description,
      type: "website",
      locale: lang === "nl" ? "nl_NL" : "en_GB",
      images: [{ url: ogImage, width: 1729, height: 910, alt: t.meta.ogAlt }],
    },
    twitter: { card: "summary_large_image", title: t.meta.title, description: t.meta.description, images: [ogImage] },
  };
}

export default async function HomePage({ lang }: { lang: Lang }) {
  const t = dictionaries[lang];
  const other: Lang = lang === "nl" ? "en" : "nl";
  const projects = (await listProjectsWithFallback()).map((p) =>
    lang === "en" ? { ...p, title: p.titleEn || p.title, location: p.locationEn || p.location } : p,
  );
  const whatsappHref = `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(t.cta.whatsappText)}`;
  const nav = [
    { href: "#diensten", label: t.nav.services },
    { href: "#projecten", label: t.nav.projects },
    { href: "#werkwijze", label: t.nav.process },
    { href: "#werkgebied", label: t.nav.area },
    { href: "#contact", label: t.nav.contact },
  ];
  const langLink = (
    <a className="lang-switch" href={langPath[other]} hrefLang={other} lang={other} aria-label={t.langSwitch.other}>
      {t.langSwitch.otherShort}
    </a>
  );

  return (
    <>
      <a className="skip-link" href="#inhoud">{t.skip}</a>

      <header className="site-header">
        <div className="wrap header-inner">
          <a className="brand" href={langPath[lang]} aria-label={site.name}>
            <img src="/images/brand/logo-horizontal.png" alt={site.name} width={1602} height={291} />
          </a>

          <nav className="main-nav" aria-label={t.nav.menu}>
            {nav.map((n) => <a key={n.href} href={n.href}>{n.label}</a>)}
          </nav>

          <div className="header-actions">
            {langLink}
            <a className="header-phone" href={site.phoneHref}>
              <PhoneIcon /> <span>{site.phoneDisplay}</span>
            </a>
            <a className="btn btn-dark btn-sm" href="#contact">{t.cta.quote}</a>
          </div>

          <MobileMenu label={t.nav.menu}>
            <nav aria-label={t.nav.menu}>
              {nav.map((n) => <a key={n.href} href={n.href}>{n.label}</a>)}
            </nav>
            <a className="mobile-lang" href={langPath[other]} hrefLang={other} lang={other}>{t.langSwitch.other}</a>
          </MobileMenu>
        </div>
      </header>

      <main id="inhoud">
        <section className="hero">
          <div className="hero-media">
            <picture>
              <img src="/images/site/hero-interieur.webp" alt={t.hero.imageAlt} width={1920} height={1280} fetchPriority="high" />
            </picture>
          </div>
          <div className="wrap hero-inner">
            <div className="hero-copy">
              <h1>{t.hero.title}</h1>
              <p className="hero-intro">{t.hero.intro}</p>
              <div className="hero-actions">
                <a className="btn btn-gold" href="#contact">{t.cta.quote} <ArrowIcon /></a>
                <a className="btn btn-outline" href={site.phoneHref}><PhoneIcon /> {site.phoneDisplay}</a>
              </div>
              <ul className="promises">
                {t.hero.promises.map((p) => <li key={p}><CheckIcon /> {p}</li>)}
              </ul>
            </div>
          </div>
        </section>

        <section className="services" id="diensten" aria-labelledby="diensten-titel">
          <div className="wrap">
            <div className="section-head">
              <h2 id="diensten-titel">{t.services.title}</h2>
              <p>{t.services.intro}</p>
            </div>
            <ul className="service-grid">
              {t.services.items.map((s) => (
                <li key={s.title} className="service">
                  <Icon name={s.icon} />
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="pricing" aria-labelledby="prijs-titel">
          <div className="wrap pricing-inner">
            <div className="section-head">
              <h2 id="prijs-titel">{t.pricing.title}</h2>
              <p>{t.pricing.intro}</p>
            </div>
            <ul className="pricing-list">
              {t.pricing.items.map((p) => (
                <li key={p.title}>
                  <h3>{p.title}</h3>
                  <p>{p.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="projects" id="projecten" aria-labelledby="projecten-titel">
          <div className="wrap">
            <div className="section-head section-head-row">
              <div>
                <h2 id="projecten-titel">{t.projects.title}</h2>
                <p>{t.projects.intro}</p>
              </div>
              <a className="text-link" href="#contact">{t.projects.cta} <ArrowIcon /></a>
            </div>
            {projects.length === 0 ? (
              <p className="project-empty">{t.projects.empty}</p>
            ) : (
              <ul className="project-grid">
                {projects.map((project) => (
                  <li className="project" key={project.id}>
                    <div className="project-img">
                      <img src={project.imagePath} alt={project.title} loading="lazy" />
                    </div>
                    <h3>{project.title}</h3>
                    <p>{project.location}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="process" id="werkwijze" aria-labelledby="werkwijze-titel">
          <div className="wrap process-inner">
            <div className="process-aside">
              <div className="section-head">
                <h2 id="werkwijze-titel">{t.process.title}</h2>
                <p>{t.process.intro}</p>
              </div>
              <img src="/images/site/werk-bouwplaats.webp" alt={t.process.imageAlt} width={1600} height={1068} loading="lazy" />
            </div>
            <ol className="steps">
              {t.process.steps.map((s, i) => (
                <li key={s.title}>
                  <span className="step-no" aria-hidden="true">{i + 1}</span>
                  <div>
                    <h3>{s.title}</h3>
                    <p>{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="area-faq" aria-label={`${t.area.title}, ${t.faq.title}`}>
          <div className="wrap area-faq-inner">
            <div className="area" id="werkgebied">
              <h2>{t.area.title}</h2>
              <p>{t.area.intro}</p>
              <ul className="towns">
                {site.serviceArea.map((town) => <li key={town}>{town}</li>)}
              </ul>
              <p className="area-note">{t.area.outside}</p>
            </div>
            <div className="faq">
              <h2>{t.faq.title}</h2>
              {t.faq.items.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="contact" id="contact" aria-labelledby="contact-titel">
          <div className="wrap contact-inner">
            <div className="contact-copy">
              <h2 id="contact-titel">{t.contact.title}</h2>
              <p>{t.contact.intro}</p>
              <dl className="contact-list">
                <div>
                  <dt>{t.contact.phone}</dt>
                  <dd><a href={site.phoneHref}>{site.phoneDisplay}</a></dd>
                </div>
                <div>
                  <dt>{t.contact.whatsapp}</dt>
                  <dd><a href={whatsappHref} target="_blank" rel="noreferrer">{site.phoneDisplay}</a></dd>
                </div>
                <div>
                  <dt>{t.contact.email}</dt>
                  <dd><a href={`mailto:${site.email}`}>{site.email}</a></dd>
                </div>
                <div>
                  <dt>{t.contact.area}</dt>
                  <dd>{t.contact.areaValue}</dd>
                </div>
              </dl>
            </div>
            <OfferteForm t={t.form} email={site.email} lang={lang} />
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="wrap footer-inner">
          <a className="footer-brand" href={langPath[lang]} aria-label={site.name}>
            <img src="/images/brand/logo-horizontal-light.png" alt={site.name} width={1602} height={291} />
          </a>
          <nav className="footer-nav" aria-label={t.nav.menu}>
            {nav.map((n) => <a key={n.href} href={n.href}>{n.label}</a>)}
            <a href={langPath[other]} hrefLang={other} lang={other}>{t.langSwitch.other}</a>
          </nav>
          <div className="footer-contact">
            <a href={site.phoneHref}>{site.phoneDisplay}</a>
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </div>
        </div>
        <div className="wrap footer-bottom">
          <p>© {new Date().getFullYear()} {site.name}. {t.footer.rights}</p>
          {site.kvk && <p>{t.footer.kvk}: {site.kvk}</p>}
          {site.btw && <p>{t.footer.btw}: {site.btw}</p>}
          <p>{t.footer.imageCredit}</p>
          <a href="#inhoud">{t.footer.top}</a>
        </div>
      </footer>

      <nav className="mobile-bar" aria-label={t.cta.quote}>
        <a href={site.phoneHref}><PhoneIcon /> {t.nav.call}</a>
        <a href={whatsappHref} target="_blank" rel="noreferrer"><WhatsAppIcon /> {t.cta.whatsapp}</a>
        <a className="is-primary" href="#contact">{t.cta.quote}</a>
      </nav>
      <a className="wa-float" href={whatsappHref} target="_blank" rel="noreferrer" aria-label={t.cta.whatsapp}>
        <WhatsAppIcon />
      </a>
    </>
  );
}
