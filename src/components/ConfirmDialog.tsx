import type { ReactNode } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Fica true durante a mutation: some o X, o botão de fechar e trava o cancel. */
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

/**
 * Confirmação para ações destrutivas (excluir um registro).
 *
 * Existe porque o app não tinha nenhum modal: sem confirmação, um clique
 * errado em "Excluir" apaga o cadastro do animal sem volta.
 */
export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = "Excluir",
  cancelLabel = "Cancelar",
  isLoading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isDismissable={!isLoading}
      hideCloseButton={isLoading}
      size="sm"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
        <ModalBody>{description}</ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose} isDisabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button color="danger" onPress={onConfirm} isLoading={isLoading}>
            {confirmLabel}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
