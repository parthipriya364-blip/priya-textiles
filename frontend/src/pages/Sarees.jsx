import CollectionPage from "./CollectionPage";

export default function Sarees() {
  return (
    <CollectionPage
      category="women"
      publicPath="sarees"
      titleOverride="Sarees Collection"
      descriptionOverride="Shop sarees and silk sarees for weddings, festivals and everyday elegance at PRIYA TEXTILES."
      productQuery={{ search: "saree" }}
    />
  );
}