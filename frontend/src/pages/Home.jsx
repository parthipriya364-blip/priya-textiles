import Hero from "../components/Hero";
import Categories from "../components/Categories";
import NewArrivals from "../components/NewArrivals";
import WhyChooseUs from "../components/WhyChooseUs";
import Newsletter from "../components/Newsletter";
import Seo, { SITE_URL } from "../components/Seo";

export default function Home() {
  return (
    <div className="page-enter">
      <Seo
        title="PRIYA TEXTILES | Sarees, Ethnic Wear & New Arrivals"
        description="Discover PRIYA TEXTILES for silk sarees, women's ethnic wear, men's shirts, kids collection and new arrivals, with quality fashion for every occasion."
        path="/"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "PRIYA TEXTILES",
            url: SITE_URL,
            logo: `${SITE_URL}/favicon.svg`,
            telephone: "+91 8807329146",
            email: "Parthipriya364@gmail.com",
            address: {
              "@type": "PostalAddress",
              streetAddress: "KVP Theatre Road, KVP Suresh Complex Shop No. 4",
              addressLocality: "Elampillai",
              addressRegion: "Tamil Nadu",
              postalCode: "637502",
              addressCountry: "IN",
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "PRIYA TEXTILES",
            url: SITE_URL,
            potentialAction: {
              "@type": "SearchAction",
              target: `${SITE_URL}/women?search={search_term_string}`,
              "query-input": "required name=search_term_string",
            },
          },
        ]}
      />
      <Hero />
      <section className="section home-intro">
        <div className="container section-title">
          <h1>PRIYA TEXTILES: Sarees and Ethnic Wear for Every Occasion</h1>
          <p>Explore silk sarees, women's collection, men's shirts, kidswear and fresh arrivals from a trusted textile store.</p>
        </div>
      </section>
      <Categories />
      <NewArrivals />
      <WhyChooseUs />
      <Newsletter />
    </div>
  );
}
