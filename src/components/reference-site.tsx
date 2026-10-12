import { useState } from "react";
import { Link } from "@tanstack/react-router";
import parse, { domToReact, Element, type DOMNode, type HTMLReactParserOptions } from "html-react-parser";
import { Button } from "@/components/ui/button";
import reference from "@/lib/reference-pages.json";
import bannerOne from "@/assets/lifeos/hd/banner-1.webp";
import bannerTwo from "@/assets/lifeos/hd/banner-2.webp";
import bannerThree from "@/assets/lifeos/hd/banner-3.webp";
import serviceOne from "@/assets/lifeos/ultra/services-01.jpg";
import serviceTwentyOne from "@/assets/lifeos/ultra/services-21.jpg";
import serviceFortyOne from "@/assets/lifeos/ultra/services-41.jpg";
import communityEvent from "@/assets/lifeos/ultra/events-03.jpg";

// Resolve each distinct media token to its high-resolution CDN asset.
const lifeosTiles = import.meta.glob<{ default: { url: string } }>("/src/assets/lifeos/high-resolution/*.asset.json", { eager: true });
const lifeosMedia = new Map<string, string>();
for (const [path, mod] of Object.entries(lifeosTiles)) {
  const m = path.match(/high-resolution\/([a-z]+)-(\d+)\.webp\.asset\.json$/);
  if (m) lifeosMedia.set(`${m[1]}/${Number(m[2])}`, mod.default.url);
}
function resolveMedia(html: string): string {
  const heroes: Record<string, string> = { "services/1": serviceOne, "services/21": serviceTwentyOne, "services/41": serviceFortyOne, "events/3": communityEvent };
  return html.replace(/lifeos-media:\/\/([a-z]+)\/(\d{2})/g, (match, group, nn) => heroes[`${group}/${Number(nn)}`] ?? lifeosMedia.get(`${group}/${Number(nn)}`) ?? match);
}

export type ReferencePage = keyof typeof reference.pages;
const localPages = { index: "/", "page?about": "/about", "page?about-founder": "/founder", "page?about-senior-management": "/senior-management", "page?about-management": "/scientists", "page?about-business-collaboration": "/business-collaboration", "page?about-business-opportunity": "/business-opportunity", "page?about-award": "/awards", "page?about-milestones": "/milestones", "page?p-triple-stemcell-h2o-moisturizer": "/triple-stemcell-h2o", "page?p-double-stemcell": "/double-stemcell", "page?p-crystal-cell": "/crystal-cell", "page?p-videos": "/product-videos", "page?p-certificate": "/halal-certificates", "page?p-halal": "/halal-certificates", "page?halal-certificates": "/halal-certificates", "page?photo-gallery": "/photo-gallery", "page?video-gallery": "/video-gallery", "page?events": "/news-events", "page?event-upcoming": "/latest-event", "page?faq-general": "/faq-general", "page?faq-product": "/faq-product", "page?faq-good-policy": "/faq-return-goods", "page?contact": "/contact", "page?contact-business-center": "/business-center", "page?join-us": "/join-us", "https://app.iphyto.com/member/login.aspx": "/login" } as const;

export function pageHead(page: ReferencePage) {
  const { title, description } = reference.pages[page];
  return { meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] };
}

function ReferenceMarkup({ html, header = false }: { html: string; header?: boolean }) {
  const [menu, setMenu] = useState(false);
  const [language, setLanguage] = useState(false);
  const [hidden, setHidden] = useState<number[]>([]);
  const [announcement, setAnnouncement] = useState(2);
  const [expanded, setExpanded] = useState("accordion1-card-body-bprghjla");
  const [notice, setNotice] = useState<string>();
  const [tab, setTab] = useState("#home");
  const [panel, setPanel] = useState("collapseOne");
  const parsed = resolveMedia(html);
  const options: HTMLReactParserOptions = {
    replace(node, index) {
      if (!(node instanceof Element)) return;
      const attrs = node.attribs;
      const cls = attrs["class"] ?? "";
      const children = () => domToReact(node.children as DOMNode[], options);
      if (node.name === "script" || node.name === "style") return <></>;
      if (cls === "box" && attrs["data-toggle"] === "modal") {
        const image = node.children.find(n => n instanceof Element && n.name === "img");
        return <Button variant="reference" size="reference" className={cls} aria-label={image instanceof Element ? image.attribs["alt"] : "View certificate"} onClick={() => { if (image instanceof Element) setNotice(image.attribs["src"]); }}>{children()}</Button>;
      }
      if (cls.includes("alert-primary") && hidden.includes(index)) return <></>;
      if (cls.includes("nav-link") && attrs["data-toggle"] === "tab") { const t = attrs["data-target"] ?? ""; return <Button variant="reference" size="reference" className={`nav-link ${tab === t ? "active" : ""}`} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}>{children()}</Button>; }
      if (cls.includes("tab-pane")) return <div id={attrs["id"]} role="tabpanel" className={`tab-pane fade ${tab === "#" + attrs["id"] ? "show active" : ""}`}>{children()}</div>;
      if (node.name === "button") {
        const close = cls.includes("close");
        return <Button variant="reference" size="reference" className={cls} type={attrs["type"] === "submit" ? "submit" : "button"} aria-label={attrs["aria-label"]} onClick={close ? (event) => { const el = event.currentTarget.closest(".alert"); if (el) (el as HTMLElement).hidden = true; setHidden([...hidden]); } : cls.includes("rd-navbar-toggle") ? () => setMenu(!menu) : cls.includes("dropdown-toggle") ? () => setLanguage(!language) : undefined}>{children()}</Button>;
      }
      if (cls.includes("rd-navbar-nav-wrap")) return <div className={`${cls} ${menu ? "mobile-open" : ""}`}>{children()}</div>;
      if (cls === "dropdown-menu") return <div className={`${cls} ${language ? "show" : ""}`}>{children()}</div>;
      if (cls.includes("rd-nav-item")) return <li className={cls.replace(/active/g, "") + (header ? "" : "")}>{children()}</li>;
      if (cls.includes("panel-collapse")) return <div id={attrs["id"]} className={`panel-collapse collapse ${attrs["id"] && panel === attrs["id"] ? "show" : ""}`}>{children()}</div>;
      if (node.name === "form" && (cls.includes("contactForm") || cls.includes("registerForm"))) return <form className={cls} onSubmit={e => e.preventDefault()}>{children()}</form>;
      if (node.name === "form") return <form className="reference-search" action="#" method="post">{children()}</form>;
      if (cls.includes("carousel-item")) {
        const siblings = node.parent?.children.filter(n => n instanceof Element && n.attribs["class"]?.includes("carousel-item")) ?? [];
        const slideIndex = siblings.indexOf(node);
        return <div className={`carousel-item ${announcement === slideIndex ? "active" : ""}`}>{children()}</div>;
      }
      if (cls.includes("carousel-indicators")) return <></>;
      if (cls.includes("modal fade")) return <></>;
      if (cls.includes("collapse") && attrs["id"]?.startsWith("accordion1-card-body")) return <div id={attrs["id"]} className={`collapse ${expanded === attrs["id"] ? "show" : ""}`}>{children()}</div>;
      if (node.name === "a") {
        const href = attrs["href"] ?? "#";
        if (href.startsWith("#collapse")) { const id = href.slice(1); return <a href={href} className={`${cls} ${panel === id ? "" : "collapsed"}`} aria-expanded={panel === id} onClick={e => { e.preventDefault(); setPanel(panel === id ? "" : id); }}>{children()}</a>; }
        if (href in localPages) return <Link className={cls} to={localPages[href as keyof typeof localPages]}>{children()}</Link>;
        if (attrs["data-target"]?.startsWith(".annoucement")) return <a href="#" className={cls} onClick={e => { e.preventDefault(); const find = (ns: DOMNode[]): Element | undefined => { for (const n of ns) { if (n instanceof Element) { if (n.name === "img") return n; const r = find(n.children as DOMNode[]); if (r) return r; } } return undefined; }; const img = find(node.children as DOMNode[]); if (img) setNotice(img.attribs["src"]); }}>{children()}</a>;
        if (cls.includes("carousel-control")) return <Button variant="reference" size="reference" className={cls} aria-label={cls.includes("prev") ? "Previous announcement" : "Next announcement"} onClick={() => setAnnouncement((announcement + (cls.includes("prev") ? 9 : 1)) % 10)}>{children()}</Button>;
        if (href.startsWith("#accordion1")) return <Button variant="reference" size="reference" className={expanded === href.slice(1) ? "" : "collapsed"} aria-expanded={expanded === href.slice(1)} onClick={() => setExpanded(expanded === href.slice(1) ? "" : href.slice(1))}>{children()}</Button>;
        if (href.startsWith("page?") || href.startsWith("?")) return <a className={cls} href="#">{children()}</a>;
      }
      return undefined;
    },
  };
  return <>{parse(parsed, options)}{notice && <div className="reference-modal" role="dialog" aria-label="Notice" onClick={() => setNotice(undefined)}><div className="reference-modal-body"><Button variant="reference" className="close" aria-label="Close notice" onClick={() => setNotice(undefined)}>×</Button><img src={notice} alt="Notice" /></div></div>}</>;
}

function Banner({ page }: { page: ReferencePage }) {
  const slides = [bannerOne, bannerTwo, bannerThree];
  const [slide, setSlide] = useState(page === "home" ? 0 : page === "awards" || page === "news-events" || page === "business-opportunity" ? 2 : 1);
  return <section className="reference-banner" aria-label="Life OS highlights"><img src={slides[slide]} alt="Life OS — One Life ID. One App. Unlimited Services." /><div className="reference-pagination">{slides.map((path, i) => <Button variant="reference" size="reference" key={path} aria-label={`Go to slide ${i + 1}`} className={i === slide ? "selected" : ""} onClick={() => setSlide(i)}>{String(i + 1).padStart(2, "0")}</Button>)}</div></section>;
}

export function ReferenceSite({ page }: { page: ReferencePage }) {
  const product = ["triple-stemcell-h2o", "double-stemcell", "crystal-cell"].includes(page);
  return <div className={`reference-site reference-${page} ${product ? "reference-product" : ""}`}><ReferenceMarkup html={reference.header} header />{!product && <Banner key={page} page={page} />}<main><ReferenceMarkup key={page} html={reference.pages[page].html} /></main><ReferenceMarkup html={reference.footer} /><Button variant="reference" size="reference" className="ui-to-top fa fa-arrow-up active" aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} /></div>;
}