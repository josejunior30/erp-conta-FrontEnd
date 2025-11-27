import { useEffect, useRef, type ReactNode, type FC } from "react";
import "./styles.css";

type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  onPrimary?: () => void;
  primaryText?: string;
  children?: ReactNode;
};

const Modal: FC<ModalProps> = ({
  open,
  title,
  onClose,
  onPrimary,
  primaryText = "OK",
  children,
}) => {
  const primaryRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) primaryRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="overlay"
    >
      <div className="box">
        <h4 className=" text-center mb-4">{title}</h4>
        <div className="mb-3 p-4">{children}</div>
        <div className="d-flex gap-2 justify-content-end">
          <button onClick={onClose} className="btn-fechar">
            <strong>X</strong>
          </button>
        </div>
        <div className="text-center mt-2">
          {onPrimary && (
            <button
              ref={primaryRef}
              onClick={onPrimary}
              className="button-primary-blue"
            >
              {primaryText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
