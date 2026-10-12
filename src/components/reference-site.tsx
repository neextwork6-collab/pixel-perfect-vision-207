import { useState } from "react";
import { Link } from "@tanstack/react-router";
import parse, { domToReact, Element, type DOMNode, type HTMLReactParserOptions } from "html-react-parser";
import { Button } from "@/components/ui/button";
import reference from "@/lib/reference-pages.json";

export type ReferencePage = keyof typeof reference.pages;
const localPages = { index: "/", "page?about": "/about", "page?about-founder": "/founder", "page?about-senior-management": "/senior-management", "page?about-management": "/scientists", "page?about-business-collaboration": "/business-collaboration", "page?about-business-opportunity": "/business-opportunity", "page?about-award": "/awards", "page?about-milestones": "/milestones", "page?p-triple-stemcell-h2o-moisturizer": "/triple-stemcell-h2o", "page?p-double-stemcell": "/double-stemcell", "page?p-crystal-cell": "/crystal-cell", "page?p-videos": "/product-videos", "page?p-halal": "/halal-certificates", "page?halal-certificates": "/halal-certificates", "page?photo-gallery": "/photo-gallery" } as const;

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
      if (node.name === "button") {
        const close = cls.includes("close");
        return <Button variant="reference" size="reference" className={cls} type={attrs["type"] === "submit" ? "submit" : "button"} aria-label={attrs["aria-label"]} onClick={close ? (event) => { const el = event.currentTarget.closest(".alert"); if (el) (el as HTMLElement).hidden = true; setHidden([...hidden]); } : cls.includes("rd-navbar-toggle") ? () => setMenu(!menu) : cls.includes("dropdown-toggle") ? () => setLanguage(!language) : undefined}>{children()}</Button>;
      }
      if (cls.includes("rd-navbar-nav-wrap")) return <div className={`${cls} ${menu ? "mobile-open" : ""}`}>{children()}</div>;
      if (cls === "dropdown-menu") return <div className={`${cls} ${language ? "show" : ""}`}>{children()}</div>;
      if (cls.includes("rd-nav-item")) return <li className={cls.replace(/active/g, "") + (header ? "" : "")}>{children()}</li>;
      if (node.name === "form") return <form className="reference-search" action="https://iphyto.com/search" method="post">{children()}</form>;
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
        if (href in localPages) return <Link className={cls} to={localPages[href as keyof typeof localPages]}>{children()}</Link>;
        if (attrs["data-target"]?.startsWith(".annoucement")) return <a href="#" className={cls} onClick={e => { e.preventDefault(); const img = node.children.find(n => n instanceof Element && n.name === "img"); if (img instanceof Element) setNotice(img.attribs["src"]); }}>{children()}</a>;
        if (cls.includes("carousel-control")) return <Button variant="reference" size="reference" className={cls} aria-label={cls.includes("prev") ? "Previous announcement" : "Next announcement"} onClick={() => setAnnouncement((announcement + (cls.includes("prev") ? 9 : 1)) % 10)}>{children()}</Button>;
        if (href.startsWith("#accordion1")) return <Button variant="reference" size="reference" className={expanded === href.slice(1) ? "" : "collapsed"} aria-expanded={expanded === href.slice(1)} onClick={() => setExpanded(expanded === href.slice(1) ? "" : href.slice(1))}>{children()}</Button>;
        if (href.startsWith("page?") || href.startsWith("?")) return <a className={cls} href={`https://iphyto.com/${href.startsWith("?") ? "page" : ""}${href}`} target="_blank" rel="noreferrer">{children()}</a>;
      }
      return undefined;
    },
  };
  return <>{parse(html, options)}{notice && <div className="reference-modal" role="dialog" aria-label="Notice" onClick={() => setNotice(undefined)}><div className="reference-modal-body"><Button variant="reference" className="close" aria-label="Close notice" onClick={() => setNotice(undefined)}>×</Button><img src={notice} alt="Notice" /></div></div>}</>;
}

function Banner({ page }: { page: ReferencePage }) {
  const paths = ["slide-14-anniversary-2.jpg", "slide-scientist.jpg", "slide-business-for-home-top10-2024.jpg", "slide-business-for-home-2024v1.jpg", "slide-britishpedia-award.jpg", "slide-Woman-Excellence-Award.jpg", "slide-super-platinum-award.jpg", "slide-Puan-Sri-FAOL-2.jpg", "slide-AJL.jpg"];
  const [slide, setSlide] = useState(page === "home" || page === "awards" || page === "product-videos" ? 1 : page === "business-opportunity" || page === "milestones" ? 2 : 0);
  const key = `iphyto2/images/${paths[slide]}` as keyof typeof reference.assets;
  const src = reference.assets[key];
  return <section className="reference-banner" aria-label="Phyto Science highlights"><img src={src ?? reference.assets["iphyto2/images/slide-14-anniversary-2.jpg"]} alt={slide === 1 ? "Phyto Science — Our Scientist Team" : "Phyto Science — Success Thru Science"} /><div className="reference-pagination">{paths.map((path, i) => <Button variant="reference" size="reference" key={path} aria-label={`Go to slide ${i + 1}`} className={i === slide ? "selected" : ""} onClick={() => setSlide(i)}>{String(i + 1).padStart(2, "0")}</Button>)}</div></section>;
}

export function ReferenceSite({ page }: { page: ReferencePage }) {
  const product = ["triple-stemcell-h2o", "double-stemcell", "crystal-cell"].includes(page);
  return <div className={`reference-site reference-${page} ${product ? "reference-product" : ""}`}><ReferenceMarkup html={reference.header} header />{!product && <Banner key={page} page={page} />}<main><ReferenceMarkup key={page} html={reference.pages[page].html} /></main><ReferenceMarkup html={reference.footer} /><Button variant="reference" size="reference" className="ui-to-top fa fa-arrow-up active" aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} /></div>;
}