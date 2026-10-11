import { Card, CardBody, CardFooter, Chip, Button } from "@heroui/react";
import { Link } from "@tanstack/react-router";
import { Animal } from "@/types";
import { getSpeciesLabel, getSexLabel, getStatusLabel, getStatusColor, PLACEHOLDER_PET_IMAGE, resolveApiImageUrl } from "@/lib/utils";

interface AnimalCardProps {
  animal: Animal;
  /**
   * Quando informado, o card ganha o botão de exclusão. Só quem é o dono do
   * animal passa o callback, então a listagem pública nunca mostra o botão.
   */
  onDelete?: () => void;
  /** Mostra o spinner no botão e trava o clique durante a exclusão. */
  isDeleting?: boolean;
  /**
   * Callback para solicitar adoção. Quando informado, mostra o botão "Quero adotar"
   * na listagem pública.
   */
  onAdopt?: () => void;
  /** Mostra o spinner no botão durante a solicitação de adoção. */
  isAdopting?: boolean;
  /** Se true, o usuário é o dono do animal. */
  isOwner?: boolean;
}

export function AnimalCard({ animal, onDelete, isDeleting = false, onAdopt, isAdopting = false, isOwner = false }: AnimalCardProps) {
  const isAdopted = animal.status === "Adotado";
  const isInProcess = animal.status === "EmProcesso";
  const canAdopt = !isAdopted && !isOwner && onAdopt;

  return (
    <Card className="w-full hover:scale-105 transition-transform duration-200">
      {/* A imagem e os dados continuam sendo um link único para o detalhe. A
          linha de ações fica fora do Link: um <button> dentro de <a> é
          inválido e o navegador faria o clique abrir o detalhe em vez de
          excluir. */}
      <Link to="/animais/$id" params={{ id: animal.id }} className="block">
        <CardBody className="p-0">
          {/* <img> puro, não o <Image> do HeroUI: ele põe max-width:fit-content
              inline no wrapper, o que encolhe a foto para a largura intrínseca
              e a deixa colada na esquerda do card em vez de centralizada. */}
          <img
            src={resolveApiImageUrl(animal.foto) || PLACEHOLDER_PET_IMAGE}
            alt={animal.nome}
            loading="lazy"
            className="w-full h-48 object-cover"
          />
        </CardBody>
        <CardFooter className="flex flex-col items-start gap-3 p-4 pb-2">
          <div className="w-full">
            <h3 className="text-lg font-semibold text-gray-800">{animal.nome}</h3>
            <p className="text-sm text-gray-600">
              {getSpeciesLabel(animal.especie)} • {animal.idade}{" "}
              {animal.idade === 1 ? "ano" : "anos"}
            </p>
            <p className="text-sm text-gray-600">{getSexLabel(animal.sexo)}</p>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                />
              </svg>
              {animal.localizacao}
            </p>
          </div>
        </CardFooter>
      </Link>

      <CardFooter className="flex w-full items-center justify-between px-4 pb-4 pt-0">
        <Chip color={getStatusColor(animal.status)} variant="flat" size="sm">
          {getStatusLabel(animal.status)}
        </Chip>

        <div className="flex items-center gap-2">
          {/* Botão de exclusão (apenas para o dono) */}
          {onDelete && (
            <Button
              size="sm"
              variant="flat"
              color="danger"
              isLoading={isDeleting}
              onPress={onDelete}
            >
              Excluir
            </Button>
          )}
          
          {/* Botão de adoção (apenas para não-donos e pets disponíveis) */}
          {canAdopt && (
            <Button
              size="sm"
              color="primary"
              isDisabled={isInProcess}
              isLoading={isAdopting}
              onPress={onAdopt}
              startContent={
                !isAdopting && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4"
                  >
                    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                  </svg>
                )
              }
            >
              {isInProcess ? "Em processo" : "Quero adotar"}
            </Button>
          )}
          
          <Link
            to="/animais/$id"
            params={{ id: animal.id }}
            className="text-sm font-medium text-primary hover:underline"
          >
            Conhecer
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
