import Hero from "../components/Hero";
import Categories from "../components/Categories";
import NewArrivals from "../components/NewArrivals";
import WhyChooseUs from "../components/WhyChooseUs";
import Newsletter from "../components/Newsletter";

export default function Home() {
  return (
    <div className="page-enter">
      <Hero />
      <Categories />
      <NewArrivals />
      <WhyChooseUs />
      <Newsletter />
    </div>
  );
}
