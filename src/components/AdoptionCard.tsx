import { Card, CardBody, CardFooter, Chip, Button, Avatar } from "@heroui/react";
import { Link } from "@tanstack/react-router";
import { AdoptionWithRelations } from "@/services";
import { getSpeciesLabel, formatDate, PLACEHOLDER_PET_IMAGE, resolveApiImageUrl } from "@/lib/utils";

interface AdoptionCardProps {
  adoption: AdoptionWithRelations;
  type: "received" | "sent";
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  isApproving?: boolean;
  isRejecting?: boolean;
}

function getStatusColor(
  status: string
): "default" | "primary" | "secondary" | "success" | "warning" | "danger" {
  switch (status) {
    case "Enviado":
      return "primary";
    case "Analisando":
      return "warning";
    case "Aprovado":
      return "success";
    case "Rejeitado":
      return "danger";
    case "Concluido":
      return "success";
    default:
      return "default";
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "Enviado":
      return "Enviado";
    case "Analisando":
      return "Em análise";
    case "Aprovado":
      return "Aprovado";
    case "Rejeitado":
      return "Rejeitado";
    case "Concluido":
      return "Concluído";
    default:
      return status;
  }
}

export function AdoptionCard({
  adoption,
  type,
  onApprove,
  onReject,
  isApproving = false,
  isRejecting = false,
}: AdoptionCardProps) {
  const isPending = ["Enviado", "Analisando"].includes(adoption.status);
  const isReceived = type === "received";

  // Para adoções recebidas, mostrar info do solicitante
  // Para adoções enviadas, mostrar info do dono do pet
  const userInfo = isReceived ? adoption.user : adoption.pet.user;

  return (
    <Card className="w-full">
      <CardBody className="p-4">
        <div className="flex gap-4">
          {/* Imagem do Pet */}
          <Link to="/animais/$id" params={{ id: adoption.pet.id }}>
            <img
              src={resolveApiImageUrl(adoption.pet.foto) || PLACEHOLDER_PET_IMAGE}
              alt={adoption.pet.nome}
              className="w-24 h-24 object-cover rounded-lg hover:opacity-80 transition-opacity"
            />
          </Link>

          {/* Informações */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <Link
                  to="/animais/$id"
                  params={{ id: adoption.pet.id }}
                  className="text-lg font-semibold text-gray-900 hover:text-primary transition-colors"
                >
                  {adoption.pet.nome}
                </Link>
                <p className="text-sm text-gray-600">
                  {getSpeciesLabel(adoption.pet.especie)} • {adoption.pet.idade}{" "}
                  {adoption.pet.idade === 1 ? "ano" : "anos"}
                </p>
              </div>
              <Chip color={getStatusColor(adoption.status)} variant="flat" size="sm">
                {getStatusLabel(adoption.status)}
              </Chip>
            </div>

            {/* Info do usuário */}
            {userInfo && (
              <div className="flex items-center gap-2 mb-2">
                <Avatar
                  src={resolveApiImageUrl(userInfo.foto) || undefined}
                  name={`${userInfo.nome} ${userInfo.sobrenome}`}
                  size="sm"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {isReceived ? "Solicitante:" : "Dono:"} {userInfo.nome} {userInfo.sobrenome}
                  </p>
                  {userInfo.telefone && (
                    <p className="text-xs text-gray-600">{userInfo.telefone}</p>
                  )}
                </div>
              </div>
            )}

            {/* Observações */}
            {adoption.observacoes && (
              <div className="bg-gray-50 rounded-lg p-2 mb-2">
                <p className="text-xs text-gray-600 font-medium mb-1">Observações:</p>
                <p className="text-sm text-gray-700">{adoption.observacoes}</p>
              </div>
            )}

            {/* Data */}
            <p className="text-xs text-gray-500">
              Solicitado em {formatDate(adoption.createdAt)}
            </p>
          </div>
        </div>
      </CardBody>

      {/* Ações - apenas para adoções recebidas e pendentes */}
      {isReceived && isPending && onApprove && onReject && (
        <CardFooter className="flex gap-2 px-4 pb-4 pt-0">
          <Button
            size="sm"
            color="success"
            variant="flat"
            isLoading={isApproving}
            isDisabled={isRejecting}
            onPress={() => onApprove(adoption.id)}
            className="flex-1"
          >
            Aprovar adoção
          </Button>
          <Button
            size="sm"
            color="danger"
            variant="flat"
            isLoading={isRejecting}
            isDisabled={isApproving}
            onPress={() => onReject(adoption.id)}
            className="flex-1"
          >
            Rejeitar
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
