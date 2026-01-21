import { useNavigate } from "react-router";

export default function RecordCommonHeader({ title }: { title: string }) {
  const navigate = useNavigate();

  return (
    <div className="w-full relative flex gap-4 justify-between items-center px-3 py-2">
      <button
        className="whitespace-nowrap grow-1 basis-0 text-blue-600 text-left"
        onClick={() => navigate(-1)}
      >
        <span>キャンセル</span>
      </button>
      <h4 className="font-bold text-center">{title}</h4>
      <button
        className="whitespace-nowrap grow-1 basis-0 text-blue-600 text-right"
        type="submit"
      >
        保存
      </button>
    </div>
  );
}
