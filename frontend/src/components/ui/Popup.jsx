import { useNavigate } from "react-router-dom";
import Button from "./Button";

export const BuyPopup = ({ open = false, onOpen }) => {
  const navigate = useNavigate();

  return (
    <div className={`fixed z-40 top-0 left-0 bottom-0 right-0 bg-dark/50 flex justify-center items-center my-container ${open ? "" : "hidden"}`} onClick={() => onOpen(false)}>
      <div className="z-50 bg-light text-tx-dark p-5 rounded-myrad" onClick={(e) => e.stopPropagation()}>
        <p className="text-sm font-medium">Beli Tiket</p>

        <ul className="list-disc list-outside text-xs pl-3 mt-2">
          <li>Tiket yang udah dibeli gak bisa di-refund atau ditukar</li>
          <li>Kamu wajib membeli tiket untuk anak berumur 2 tahun dan lebih.</li>
        </ul>

        <Button
          variant="dark"
          size="sm"
          classname={"w-full mt-10"}
          onClick={() => {
            onOpen(false);
            navigate("/seatselection");
          }}
        >
          Beli Tiket
        </Button>
      </div>
    </div>
  );
};
