import type { Metadata } from "next";
import { headers } from "next/headers";
import { company, home, type Lang } from "@/lib/config";
import { copy } from "@/lib/content";
import { getSiteImage, listPhotos, photoUrl, siteImageUrl } from "@/lib/media";
import HeaderScroll from "./header-scroll";
import { PhoneIcon, RoofLines, WhatsAppIcon } from "./icons";
import MobileMenu from "./mobile-menu";
import QuoteForm from "./quote-form";

export async function homeMetadata(lang: Lang): Promise<Metadata> {
  const t = copy[lang];
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost";
  const base = `${h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https")}://${host}`;
  const abs = (path: string) => new URL(path, base).toString();
  return {
    title: t.meta.title,
    description: t.meta.description,
    alternates: {
      canonical: abs(home[lang]),
      languages: { nl: abs(home.nl), en: abs(home.en), "x-default": abs(home.nl) },
    },
    icons: { icon: "/images/brand/logo-square.png" },
    openGraph: {
      title: t.meta.title,
      description: t.meta.description,
      type: "website",
      locale: lang === "nl" ? "nl_NL" : "en_GB",
      images: [{ url: abs("/images/brand/logo-square.png") }],
    },
  };
}

export default async function Home({ lang }: { lang: Lang }) {
  const t = copy[lang];
  const other: Lang = lang === "nl" ? "en" : "nl";
  const [hero, photos] = await Promise.all([getSiteImage("hero"), listPhotos()]);
  const whatsapp = `https://wa.me/${company.whatsapp}?text=${encodeURIComponent(t.cta.whatsappText)}`;
  const links = [
    { href: "#diensten", label: t.nav.services },
    ...(photos.length ? [{ href: "#projecten", label: t.nav.projects }] : []),
    { href: "#werkwijze", label: t.nav.process },
    { href: "#contact", label: t.nav.contact },
  ];

  return (
    <>
      <a className="skip" href="#inhoud">{t.skip}</a>
      <HeaderScroll />

      <header className="header">
        <div className="wrap header-inner">
          <a className="logo" href={home[lang]} aria-label={company.name}>
            <img src="/images/brand/logo-horizontal-light.png" alt={company.name} width={1602} height={291} />
          </a>
          <nav className="nav" aria-label={t.nav.menu}>
            {links.map((l) => <a key={l.href} href={l.href}>{l.label}</a>)}
          </nav>
          <div className="header-tools">
            <a className="lang" href={home[other]} hrefLang={other} lang={other} aria-label={t.switchTo.label}>
              {lang.toUpperCase()} <span>/ {t.switchTo.short}</span>
            </a>
            <a className="btn btn-gold-line" href="#contact">{t.cta.quote}</a>
          </div>
          <MobileMenu label={t.nav.menu}>
            {links.map((l) => <a key={l.href} href={l.href}>{l.label}</a>)}
            <a className="menu-lang" href={home[other]} hrefLang={other} lang={other}>{t.switchTo.label}</a>
          </MobileMenu>
        </div>
      </header>

      <main id="inhoud">
        <section className="hero">
          {hero ? (
            <div className="hero-photo">
              <img src={siteImageUrl(hero)} alt={(lang === "nl" ? hero.altNl : hero.altEn) || ""} fetchPriority="high" />
            </div>
          ) : (
            <RoofLines className="hero-roof" />
          )}
          <div className="wrap hero-inner">
            <p className="region">{t.hero.region}</p>
            <h1>{t.hero.title}</h1>
            <p className="hero-intro">{t.hero.intro}</p>
            <div className="hero-actions">
              <a className="btn btn-gold" href="#contact">{t.cta.quoteLong}</a>
              <a className="btn btn-line" href={whatsapp} target="_blank" rel="noreferrer">
                <WhatsAppIcon /> {t.cta.whatsapp}
              </a>
            </div>
          </div>
        </section>

        <section className="promises" aria-label={t.promises.join(", ")}>
          <ul className="wrap">
            {t.promises.map((p) => <li key={p}>{p}</li>)}
          </ul>
        </section>

        <section className="services" id="diensten" aria-labelledby="h-diensten">
          <div className="wrap">
            <div className="services-head">
              <h2 id="h-diensten">{t.services.title}</h2>
              <p>{t.services.intro}</p>
            </div>
            <ul className="service-list">
              {t.services.items.map((s) => (
                <li key={s.title}>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {photos.length > 0 && (
          <section className="projects" id="projecten" aria-labelledby="h-projecten">
            <div className="wrap">
              <div className="projects-head">
                <h2 id="h-projecten">{t.projects.title}</h2>
                <a className="link-gold" href="#contact">{t.projects.cta}</a>
              </div>
              <ul className="project-grid">
                {photos.map((p) => {
                  const title = lang === "en" ? p.titleEn || p.titleNl : p.titleNl;
                  const place = lang === "en" ? p.placeEn || p.placeNl : p.placeNl;
                  return (
                    <li key={p.id}>
                      <figure className="project">
                        <img src={photoUrl(p)} alt={title} loading="lazy" />
                        <figcaption>
                          <strong>{title}</strong>
                          <span>{place}</span>
                        </figcaption>
                      </figure>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        )}

        <section className="process" id="werkwijze" aria-labelledby="h-werkwijze">
          <div className="wrap">
            <h2 id="h-werkwijze">{t.process.title}</h2>
            <ol className="steps">
              {t.process.steps.map((s, i) => (
                <li key={s.title}>
                  <span className="step-no" aria-hidden="true">{i + 1}</span>
                  <strong>{s.title}</strong>
                  <span>{s.text}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="contact" id="contact" aria-labelledby="h-contact">
          <div className="wrap">
            <div className="contact-copy">
              <h2 id="h-contact">{t.contact.title}</h2>
              <p>{t.contact.intro}</p>
              <dl className="contact-list">
                <div>
                  <dt>{t.contact.phone}</dt>
                  <dd><a href={company.phoneLink}>{company.phoneDisplay}</a></dd>
                </div>
                <div>
                  <dt>{t.contact.email}</dt>
                  <dd><a href={`mailto:${company.email}`}>{company.email}</a></dd>
                </div>
                <div>
                  <dt>{t.contact.area}</dt>
                  <dd>{t.contact.areaValue}</dd>
                </div>
              </dl>
            </div>
            <QuoteForm t={t.form} email={company.email} lang={lang} />
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="wrap">
          <img src="/images/brand/logo-horizontal-light.png" alt={company.name} width={1602} height={291} loading="lazy" />
          <div className="footer-meta">
            <span>© {new Date().getFullYear()} {company.name}. {t.footer.rights}</span>
            {company.kvk && <span>{t.footer.kvk} {company.kvk}</span>}
            {company.btw && <span>{t.footer.btw} {company.btw}</span>}
            <a href={home[other]} hrefLang={other} lang={other}>{t.switchTo.label}</a>
          </div>
        </div>
      </footer>

      <a className="wa" href={whatsapp} target="_blank" rel="noreferrer" aria-label={t.cta.whatsapp}>
        <WhatsAppIcon />
      </a>
      <nav className="mobile-bar" aria-label={t.cta.quote}>
        <a href={company.phoneLink}><PhoneIcon /> {t.cta.call}</a>
        <a href={whatsapp} target="_blank" rel="noreferrer"><WhatsAppIcon /> {t.cta.whatsapp}</a>
        <a className="primary" href="#contact">{t.cta.quote}</a>
      </nav>
    </>
  );
}
