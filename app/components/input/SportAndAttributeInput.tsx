export default function SportAndAttributeInput({
  sport,
  attributes,
  onClickAttribute,
}) {
  const handleSportAttributeClicked = (attrId) => {
    if (!onClickAttribute) {
      return;
    }

    const isSelected = attributes.find(
      (attr) => attr.id === attrId,
    )?.isSelected;
    onClickAttribute({ sportId: sport.id, attributeId: attrId, isSelected });
  };

  if (!sport.isSelected) {
    return null;
  }

  return (
    <div>
      <h4>{sport.name_ja_JP}</h4>

      <ul className="flex gap-x-2 gap-y-1 flex-wrap">
        {attributes.map((attr) => {
          <li>
            <button
              onClick={() => handleSportAttributeClicked(attr.id)}
              type="button"
              className={`appearance-none rounded border ${
                attr.isSelected ? "selected" : ""
              }`}
            >
              {attr.name}
            </button>
          </li>;
        })}
      </ul>
    </div>
  );
}
