import { Card, CardBody, Button, Divider, Chip } from "@heroui/react";
import { Link } from "@tanstack/react-router";
import { LostPet } from "@/types";
import {
  getSpeciesLabel,
  getSexLabel,
  formatDate,
  maskPhone,
  resolveApiImageUrl,
  PLACEHOLDER_PET_IMAGE,
} from "@/lib/utils";

interface LostPetCardProps {
  lostPet: LostPet;
  isOwner?: boolean;
  onDelete?: () => void;
  isDeleting?: boolean;
  onMarkAsFound?: () => void;
  isMarkingAsFound?: boolean;
}

export function LostPetCard({
  lostPet,
  isOwner = false,
  onDelete,
  isDeleting = false,
  onMarkAsFound,
  isMarkingAsFound = false,
}: LostPetCardProps) {
  const fotoSrc = lostPet.foto
    ? resolveApiImageUrl(lostPet.foto) ?? PLACEHOLDER_PET_IMAGE
    : PLACEHOLDER_PET_IMAGE;

  const anunciante =
    lostPet.user?.nome && lostPet.user.sobrenome
      ? `${lostPet.user.nome} ${lostPet.user.sobrenome}`
      : null;

  return (
    <Card className="w-full">
      <CardBody className="flex flex-col md:flex-row gap-4 p-4">
        <img
          src={fotoSrc}
          alt={lostPet.nome}
          loading="lazy"
          className="w-full md:w-40 h-48 md:h-44 object-cover rounded-lg flex-shrink-0"
        />
        <div className="flex-1 flex flex-col gap-2">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-lg font-semibold text-gray-800">
                {lostPet.nome}
              </h3>
              {lostPet.encontrado && (
                <Chip color="success" variant="flat" size="sm">
                  Encontrado
                </Chip>
              )}
            </div>
            <p className="text-sm text-gray-600">
              {getSpeciesLabel(lostPet.especie)} • {lostPet.raca || "Raça não informada"}
            </p>
            {lostPet.sexo && (
              <p className="text-sm text-gray-600">{getSexLabel(lostPet.sexo)}</p>
            )}
            <p className="text-sm text-gray-600">Cor: {lostPet.cor || "Não informada"}</p>
          </div>

          <div className="flex items-start gap-1 text-sm text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mt-0.5 flex-shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <span>{lostPet.localizacao}</span>
          </div>

          <p className="text-sm text-gray-600">
            Visto em: <span className="font-medium">{formatDate(lostPet.dataUltimaVez)}</span>
          </p>

          <p className="text-sm text-gray-700 line-clamp-2">
            {lostPet.descricao || "Sem descrição informada"}
          </p>

          {anunciante && <p className="text-xs text-gray-500">Anunciado por {anunciante}</p>}

          <Divider className="my-1" />

          <div className="flex flex-col gap-1 text-sm">
            <p className="text-gray-700 font-medium">Contato:</p>
            <p className="text-gray-600">{lostPet.nomeContato}</p>
            <p className="text-gray-600">{maskPhone(lostPet.telefoneContato)}</p>
            <p className="text-gray-600">{lostPet.emailContato}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Button color="primary" variant="flat" size="sm" className="w-fit" as="a" href={`tel:${lostPet.telefoneContato}`}>
              Ligar para contato
            </Button>
            {isOwner && (
              <>
                <Button
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  as={Link as any}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  params={{ petId: lostPet.id } as any}
                  to="/perdidos/editar/$petId"
                  color="primary"
                  variant="bordered"
                  size="sm"
                >
                  Editar
                </Button>
                {!lostPet.encontrado && onMarkAsFound && (
                  <Button color="success" variant="flat" size="sm" isLoading={isMarkingAsFound} onPress={onMarkAsFound}>
                    Marcar como encontrado
                  </Button>
                )}
                {onDelete && (
                  <Button color="danger" variant="flat" size="sm" isLoading={isDeleting} onPress={onDelete}>
                    Excluir
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}