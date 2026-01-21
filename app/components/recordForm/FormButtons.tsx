// src/components/FormButtons.tsx
import { useNavigate, useNavigation } from "react-router";
export function FormButtons({ title }: { title: string }) {
  const nav = useNavigation();
  const navigate = useNavigate();
  return (
    <div className="w-full relative flex gap-4 justify-between items-center px-3 py-2">
      <button
        className="whitespace-nowrap grow-1 basis-0 text-blue-600 text-left"
        onClick={() => navigate(-1)}
      >
        <span>戻る</span>
      </button>
      <h4 className="font-bold text-center">{title}</h4>
      <button
        className="whitespace-nowrap grow-1 basis-0 text-blue-600 text-right"
        type="submit"
        disabled={nav.state !== "idle"}
      >
        {nav.state === "idle" ? "記録" : "記録中…"}
      </button>
    </div>
  );
}
