import CollectionPage from "./CollectionPage";
import WomenSubCategorySlider from "../components/WomenSubCategorySlider";

export default function Women() {
  return <CollectionPage category="women" belowHeader={<WomenSubCategorySlider />} />;
}
