import type { SportAttribute } from "@prisma/client";
import { SportAttributeType } from "@prisma/client";

export default function SportAttributePill({
  sportAttribute,
}: {
  sportAttribute: SportAttribute;
}) {
  return (
    <div
      className={`rounded text-white ${getAttrTypeColor(sportAttribute.attributeType)}`}
    >
      {sportAttribute.name}
    </div>
  );
}

const getAttrTypeColor = (attrType: SportAttributeType | null) => {
  switch (attrType) {
    case SportAttributeType.Gender: {
      return `bg-emerald-600`;
    }
    case SportAttributeType.NumberOfPlayers: {
      return `bg-lime-600`;
    }
    case SportAttributeType.Rule: {
      return `bg-violet-800`;
    }
    case SportAttributeType.Size: {
      return `bg-amber-400 text-black`;
    }
    case SportAttributeType.Experience: {
      return `bg-green-800`;
    }
    case SportAttributeType.GroupCategory: {
      return `bg-blue-700`;
    }
  }
};
